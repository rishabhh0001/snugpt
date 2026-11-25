"""Compact pgvector storage for the campus document corpus."""
import hashlib
import json
import re
from contextlib import closing

import psycopg2
from psycopg2.extras import execute_values, Json
from langchain_core.documents import Document
from app.config import settings
from app.rag.embeddings import get_embeddings


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
        key = json.dumps([settings_embedding, doc.metadata, doc.page_content], sort_keys=True, default=str)
        unique[hashlib.sha256(key.encode()).hexdigest()] = doc
    with closing(connect()) as db, db, db.cursor() as cur:
        cur.execute("SELECT id FROM snugpt_chunks WHERE id = ANY(%s)", (list(unique),))
        for key, in cur.fetchall():
            unique.pop(key)
    items = list(unique.items())
    for offset in range(0, len(items), 32):
        batch = items[offset:offset + 32]
        vectors = get_embeddings().embed_documents([doc.page_content for _, doc in batch])
        rows = [(key, doc.page_content, Json(doc.metadata), str(vector)) for (key, doc), vector in zip(batch, vectors, strict=True)]
        with closing(connect()) as db, db, db.cursor() as cur:
            execute_values(cur, "INSERT INTO snugpt_chunks VALUES %s ON CONFLICT (id) DO NOTHING",
                           rows, template="(%s,%s,%s,%s::halfvec)")


settings_embedding = "nvidia/nemotron-3-embed-1b"


def search(query, k):
    vector = str(get_embeddings().embed_query(query))
    match = re.search(r'"([^"]+)"|\b([A-Za-z]{2,4}\d{3,4})\b', query)
    phrase = next((s for s in match.groups() if s), "") if match else ""
    with closing(connect()) as db, db, db.cursor() as cur:
        cur.execute("""SELECT content, metadata FROM snugpt_chunks
            ORDER BY (%s <> '' AND strpos(lower(content),lower(%s)) > 0) DESC,
            embedding <=> %s::halfvec LIMIT %s""", (phrase, phrase, vector, k))
        return [Document(page_content=text, metadata=meta) for text, meta in cur.fetchall()]
