import logging
import uuid
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


def retrieve_documents(query: str, k: int = 4) -> List[Document]:
    """Similarity search against Chroma Cloud via chromadb-client (no full chromadb)."""
    embeddings = get_embeddings()
    query_vector = embeddings.embed_query(query)
    result = _get_collection().query(
        query_embeddings=[query_vector],
        n_results=k,
        include=["documents", "metadatas"],
    )

    docs: List[Document] = []
    if not result or not result.get("documents") or not result["documents"][0]:
        return docs

    metadatas = result.get("metadatas") or [[]]
    for i, content in enumerate(result["documents"][0]):
        if not content:
            continue
        meta = metadatas[0][i] if i < len(metadatas[0]) else {}
        docs.append(Document(page_content=content, metadata=meta or {}))
    return docs


def add_qa_pair(query: str, answer: str, feedback: str = "up") -> None:
    """Persist a learned Q&A pair to Chroma with feedback type (up or down)."""
    text = f"Q: {query}\nA: {answer}"
    embedding = get_embeddings().embed_documents([text])[0]
    _get_collection().add(
        ids=[str(uuid.uuid4())],
        documents=[text],
        metadatas=cast(Any, [{"source": "chat_learning", "type": "learned_qa", "feedback": feedback}]),
        embeddings=cast(Any, [embedding]),
    )


def add_documents(documents: List[Document]) -> None:
    """Batch add for local indexing scripts."""
    if not documents:
        return
    texts = [d.page_content for d in documents]
    metadatas = [d.metadata for d in documents]
    vectors = get_embeddings().embed_documents(texts)
    _get_collection().add(
        ids=[str(uuid.uuid4()) for _ in texts],
        documents=texts,
        metadatas=cast(Any, metadatas),
        embeddings=cast(Any, vectors),
    )
