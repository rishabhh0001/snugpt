"""Compact pgvector storage for the campus document corpus."""
import hashlib
import json
import re
import time
from contextlib import closing

import httpx
import psycopg2
from psycopg2.extras import execute_values, Json
from langchain_core.documents import Document
from app.config import settings

EMBEDDING_MODEL = "nvidia/nemotron-3.5-embed-1b"
EMBEDDING_DIMENSIONS = 768
EMBEDDING_VERSION = f"{EMBEDDING_MODEL}:{EMBEDDING_DIMENSIONS}"


class RejectedEmbedding(RuntimeError):
    pass


def embed(texts, input_type):
    with httpx.Client(timeout=30) as client:
        for attempt in range(5):
            response = client.post(
                "https://integrate.api.nvidia.com/v1/embeddings",
                headers={"Authorization": f"Bearer {settings.nvidia_api_key}"},
                json={"model": EMBEDDING_MODEL, "dimensions": EMBEDDING_DIMENSIONS,
                      "input": texts, "input_type": input_type, "truncate": "END"},
            )
            if response.is_success:
                data = sorted(response.json()["data"], key=lambda item: item["index"])
                vectors = [item["embedding"] for item in data]
                if len(vectors) != len(texts) or any(len(v) != EMBEDDING_DIMENSIONS for v in vectors):
                    raise RuntimeError("Unexpected NVIDIA embedding dimensions or batch size")
                return vectors
            if response.status_code == 422:
                raise RejectedEmbedding("NVIDIA rejected embedding input (HTTP 422)")
            if response.status_code not in (429, 500, 502, 503, 504) or attempt == 4:
                raise RuntimeError(f"NVIDIA embeddings HTTP {response.status_code}")
            time.sleep(2 ** attempt)


def connect():
    dsn = re.sub(r"^postgresql\+(?:asyncpg|psycopg2)://", "postgresql://", settings.database_url or "")
    if not dsn.startswith(("postgresql://", "postgres://")):
        raise ValueError("Configure a PostgreSQL DATABASE_URL")
    try:
        return psycopg2.connect(dsn, connect_timeout=10)
    except psycopg2.Error:
        raise RuntimeError("Could not connect to the configured Neon database") from None


def initialize():
    with closing(connect()) as db, db, db.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
        cur.execute("""CREATE TABLE IF NOT EXISTS snugpt_chunks (
            id text PRIMARY KEY, content text NOT NULL, metadata jsonb NOT NULL,
            embedding halfvec NOT NULL)""")


def ingest(docs):
    unique = {}
    for doc in docs:
        identity = {k: v for k, v in doc.metadata.items() if k != "last_checked"}
        key = json.dumps([EMBEDDING_VERSION, identity, doc.page_content], sort_keys=True, default=str)
        unique[hashlib.sha256(key.encode()).hexdigest()] = doc
    with closing(connect()) as db, db, db.cursor() as cur:
        cur.execute("SELECT id FROM snugpt_chunks WHERE id = ANY(%s)", (list(unique),))
        for key, in cur.fetchall():
            unique.pop(key)
    items = list(unique.items())
    def write_batch(batch):
        try:
            vectors = embed([doc.page_content for _, doc in batch], "passage")
        except RejectedEmbedding:
            if len(batch) == 1:
                return 1
            middle = len(batch) // 2
            return write_batch(batch[:middle]) + write_batch(batch[middle:])
        rows = [(key, doc.page_content, Json({**doc.metadata, "embedding_version": EMBEDDING_VERSION}), str(vector))
                for (key, doc), vector in zip(batch, vectors, strict=True)]
        with closing(connect()) as db, db, db.cursor() as cur:
            execute_values(cur, "INSERT INTO snugpt_chunks VALUES %s ON CONFLICT (id) DO NOTHING",
                           rows, template="(%s,%s,%s,%s::halfvec)")
        return 0

    rejected = sum(write_batch(items[offset:offset + 32]) for offset in range(0, len(items), 32))
    if rejected:
        raise RejectedEmbedding(f"NVIDIA rejected {rejected} individual chunks. Other chunks were stored.")


def search(query, k):
    vector = str(embed([query], "query")[0])
    match = re.search(r'"([^"]+)"|\b([A-Za-z]{2,4}\d{3,4})\b', query)
    phrase = next((s for s in match.groups() if s), "") if match else ""
    with closing(connect()) as db, db, db.cursor() as cur:
        cur.execute("""SELECT content, metadata FROM snugpt_chunks
            WHERE metadata->>'embedding_version' = %s
            ORDER BY (%s <> '' AND strpos(lower(content),lower(%s)) > 0) DESC,
            embedding <=> %s::halfvec LIMIT %s""", (EMBEDDING_VERSION, phrase, phrase, vector, k))
        return [Document(page_content=text, metadata=meta) for text, meta in cur.fetchall()]
