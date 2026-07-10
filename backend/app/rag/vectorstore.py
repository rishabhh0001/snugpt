import logging
import uuid
import os
from typing import List, Any, cast

import chromadb
from langchain_core.documents import Document

from app.config import settings
from app.rag.embeddings import get_embeddings

logger = logging.getLogger(__name__)

COLLECTION_NAME = "snu_knowledge"
_client = None
_collection = None


import threading

_client_lock = threading.Lock()
_collection_lock = threading.Lock()


def _get_client():
    global _client
    if _client is not None:
        return _client

    with _client_lock:
        if _client is not None:
            return _client

        if settings.chroma_api_key and settings.use_chroma_cloud:
            logger.info(
                "Chroma Cloud tenant=%s database=%s",
                settings.chroma_tenant,
                settings.chroma_database,
            )
            _client = chromadb.CloudClient(
                api_key=settings.chroma_api_key,
                tenant=settings.chroma_tenant,
                database=settings.chroma_database,
            )
        else:
            logger.info("Chroma HTTP %s:%s", settings.chroma_host, settings.chroma_port)
            _client = chromadb.HttpClient(
                host=settings.chroma_host,
                port=settings.chroma_port,
            )
    return _client


def _get_collection():
    global _collection
    if _collection is not None:
        return _collection

    with _collection_lock:
        if _collection is None:
            _collection = _get_client().get_or_create_collection(COLLECTION_NAME)
    return _collection


import math
import re
from collections import Counter

class BM25:
    def __init__(self, corpus: List[List[str]], k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus_size = len(corpus)
        self.avg_doc_len = sum(len(doc) for doc in corpus) / self.corpus_size if self.corpus_size > 0 else 0
        self.doc_freqs = []
        self.doc_lens = []
        self.df = Counter()
        self.idf = {}
        
        for doc in corpus:
            self.doc_lens.append(len(doc))
            frequencies = Counter(doc)
            self.doc_freqs.append(frequencies)
            for term in frequencies:
                self.df[term] += 1
                
        for term, freq in self.df.items():
            self.idf[term] = math.log((self.corpus_size - freq + 0.5) / (freq + 0.5) + 1.0)

    def get_scores(self, query: List[str]) -> List[float]:
        scores = [0.0] * self.corpus_size
        for i, doc_len in enumerate(self.doc_lens):
            frequencies = self.doc_freqs[i]
            score = 0.0
            for term in query:
                if term not in self.idf:
                    continue
                tf = frequencies[term]
                numerator = tf * (self.k1 + 1)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * doc_len / self.avg_doc_len)
                score += self.idf[term] * (numerator / denominator)
            scores[i] = score
        return scores


_bm25_index = None
_bm25_lock = threading.Lock()


def clear_bm25_cache() -> None:
    """Clear cached BM25 index to force re-indexing on the next search query."""
    global _bm25_index
    with _bm25_lock:
        _bm25_index = None
    logger.info("BM25 index cache cleared.")


def get_bm25_index():
    """Lazily initialize and cache the BM25 index from all documents in ChromaDB."""
    global _bm25_index
    if _bm25_index is not None:
        return _bm25_index

    with _bm25_lock:
        if _bm25_index is None:
            # BM25 is disabled for serverless scalability.
            # Building BM25 index in memory pulls 20,000 docs on every cold start which destroys performance under high concurrency.
            _bm25_index = (None, [])
            logger.info("BM25 index generation disabled for scalability. Using pure Dense Vector + Exact Match Boosting.")
    return _bm25_index


def retrieve_documents(query: str, k: int = 4) -> List[Document]:
    """Hybrid Dense-Sparse search using ChromaDB and BM25 with Reciprocal Rank Fusion & Exact Match Boosting."""
    # 1. Dense Query (vector search)
    embeddings = get_embeddings()
    query_vector = embeddings.embed_query(query)
    
    # We fetch a larger pool for RRF ranking
    pool_size = max(k * 4, 20)
    
    dense_docs = []
    try:
        result = _get_collection().query(
            query_embeddings=[query_vector],
            n_results=pool_size,
            include=["documents", "metadatas"],
        )
        if result and result.get("documents") and result["documents"][0]:
            metadatas = result.get("metadatas") or [[]]
            for i, content in enumerate(result["documents"][0]):
                if content:
                    meta = metadatas[0][i] if i < len(metadatas[0]) else {}
                    dense_docs.append(Document(page_content=content, metadata=meta or {}))
    except Exception as e:
        logger.error("Chroma query failed during hybrid search: %s", e)

    # 2. Sparse Query (BM25 token search)
    bm25, corpus_docs = get_bm25_index()
    sparse_docs = []
    if bm25 and corpus_docs:
        query_tokens = re.findall(r'\b\w+\b', query.lower())
        scores = bm25.get_scores(query_tokens)
        
        # Pair documents with scores, sort descending, and filter those with non-zero scores
        scored_docs = list(zip(corpus_docs, scores))
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        sparse_docs = [doc for doc, score in scored_docs[:pool_size] if score > 0.0]

    # 3. Reciprocal Rank Fusion (RRF) & Deduplication by document text
    rrf_scores = {}
    doc_map = {}
    
    def add_to_rrf(doc, rank, weight=1.0):
        content = doc.page_content
        if content not in doc_map:
            doc_map[content] = doc
        rrf_scores[content] = rrf_scores.get(content, 0.0) + weight * (1.0 / (60.0 + rank))

    for rank, doc in enumerate(dense_docs, 1):
        add_to_rrf(doc, rank)
        
    for rank, doc in enumerate(sparse_docs, 1):
        add_to_rrf(doc, rank)

    # 4. Exact Match Boosting for Alphanumeric Course Codes & Section Identifiers
    # Extract alphanumeric codes of typical course length (e.g. CSD101, MAT203, PHY101)
    course_codes = re.findall(r'\b[a-zA-Z]{2,4}\d{3,4}[a-zA-Z]?\b', query)
    # Extract subsection markers (e.g. 4.2, 3.1.2)
    subsections = re.findall(r'\b\d+\.\d+(?:\.\d+)?\b', query)
    
    exact_targets = [code.lower() for code in course_codes] + subsections
    
    if exact_targets:
        for content, doc in doc_map.items():
            content_lower = content.lower()
            # Apply a massive boost if the document contains any exact course code or subsection identifier
            if any(target in content_lower for target in exact_targets):
                rrf_scores[content] = rrf_scores.get(content, 0.0) + 2.0

    # Sort final documents by RRF + Boost scores descending
    sorted_contents = sorted(rrf_scores.keys(), key=lambda c: rrf_scores[c], reverse=True)
    return [doc_map[content] for content in sorted_contents[:k]]


def add_qa_pair(query: str, answer: str, feedback: str = "up") -> None:
    """Persist a learned Q&A pair to Chroma with feedback type (up or down)."""
    clear_bm25_cache()  # Clear cache to trigger re-indexing of learned QA
    try:
        # Delete existing entries with the same query to prevent vector store pollution
        _get_collection().delete(where={"query": query})
    except Exception as e:
        logger.debug("Did not delete old duplicates: %s", e)

    text = f"Q: {query}\nA: {answer}"
    embedding = get_embeddings().embed_documents([text])[0]
    _get_collection().add(
        ids=[str(uuid.uuid4())],
        documents=[text],
        metadatas=cast(Any, [{"source": "chat_learning", "type": "learned_qa", "feedback": feedback, "query": query}]),
        embeddings=cast(Any, [embedding]),
    )


def add_admin_document(content: str, title: str, source: str = "admin_upload") -> None:
    """Index an administrative knowledge document directly into ChromaDB."""
    clear_bm25_cache()
    try:
        # Prevent duplicate document titles
        _get_collection().delete(where={"title": title})
    except Exception as e:
        logger.debug("Did not delete old document duplicate: %s", e)

    embedding = get_embeddings().embed_documents([content])[0]
    _get_collection().add(
        ids=[str(uuid.uuid4())],
        documents=[content],
        metadatas=cast(Any, [{"source": source, "type": "admin_document", "title": title}]),
        embeddings=cast(Any, [embedding]),
    )



def add_documents(documents: List[Document]) -> None:
    """Batch add for local indexing scripts."""
    if not documents:
        return
    clear_bm25_cache()  # Clear cache on new bulk ingest
    texts = [d.page_content for d in documents]
    metadatas = [d.metadata for d in documents]
    vectors = get_embeddings().embed_documents(texts)
    _get_collection().add(
        ids=[str(uuid.uuid4()) for _ in texts],
        documents=texts,
        metadatas=cast(Any, metadatas),
        embeddings=cast(Any, vectors),
    )


async def rerank_documents(query: str, docs: List[Document], top_n: int = 5) -> List[Document]:
    """Re-ranks retrieved documents using NVIDIA's hosted state-of-the-art re-ranking API."""
    if not docs:
        return []
        
    api_key = settings.nvidia_api_key or os.getenv("NVIDIA_API_KEY")
    if not api_key:
        logger.warning("NVIDIA API key not configured for reranking. Returning top %d original documents.", top_n)
        return docs[:top_n]
        
    url = "https://ai.api.nvidia.com/v1/retrieval/nvidia/reranking"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    passages = [{"text": doc.page_content} for doc in docs]
    payload = {
        "model": "nvidia/rerank-qa-mistral-4b",
        "query": {"text": query},
        "passages": passages
    }
    
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=12.0)
            if response.status_code == 200:
                result = response.json()
                rankings = result.get("rankings") or []
                
                ranked_docs = []
                for rank in rankings:
                    idx = rank.get("index")
                    if idx is not None and 0 <= idx < len(docs):
                        doc = docs[idx]
                        doc.metadata["rerank_score"] = rank.get("logit", rank.get("score", 0.0))
                        ranked_docs.append(doc)
                
                seen = set(id(d) for d in ranked_docs)
                for d in docs:
                    if id(d) not in seen:
                        ranked_docs.append(d)
                        
                logger.info("Successfully re-ranked %d documents down to top %d.", len(docs), top_n)
                return ranked_docs[:top_n]
            else:
                logger.error("NVIDIA Reranking API error (status %d): %s", response.status_code, response.text)
    except Exception as e:
        logger.error("Failed to call NVIDIA Reranking API: %s", e)
        
    # Fail-safe local fallback
    return docs[:top_n]


