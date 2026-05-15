import os
import logging
from langchain_chroma import Chroma
import chromadb
from app.rag.embeddings import get_embeddings
from app.config import settings

logger = logging.getLogger(__name__)

def get_vectorstore():
    # Use centralized settings for configuration
    if settings.chroma_api_key and settings.use_chroma_cloud:
        # PRODUCTION: Use Chroma Cloud
        logger.info(f"Connecting to Chroma Cloud (Tenant: {settings.chroma_tenant}, DB: {settings.chroma_database})...")
        # CloudClient is available in chromadb-client
        client = chromadb.CloudClient(
            api_key=settings.chroma_api_key,
            tenant=settings.chroma_tenant,
            database=settings.chroma_database
        )
    else:
        # DEVELOPMENT / HTTP FALLBACK: Use HttpClient (requires a running Chroma server)
        # We avoid PersistentClient on Vercel to keep the bundle small
        host = os.getenv("CHROMA_HOST", "localhost")
        try:
            port = int(os.getenv("CHROMA_PORT", "8000"))
        except ValueError:
            port = 8000
        logger.info(f"Connecting to Chroma server at {host}:{port}")
        client = chromadb.HttpClient(host=host, port=port)
    
    vectorstore = Chroma(
        client=client,
        collection_name="snu_knowledge",
        embedding_function=get_embeddings()
    )
    return vectorstore

def get_retriever():
    vs = get_vectorstore()
    return vs.as_retriever(search_kwargs={"k": 4})
