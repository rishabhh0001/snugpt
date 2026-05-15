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
        try:
            # Note: CloudClient is for Hosted Chroma. If using your own server, use HttpClient.
            client = chromadb.CloudClient(
                api_key=settings.chroma_api_key,
                tenant=settings.chroma_tenant,
                database=settings.chroma_database
            )
        except Exception as e:
            logger.error(f"Chroma Cloud connection failed: {e}. Falling back to local.")
            # Fallback to local
            persist_dir = settings.chroma_persist_dir
            if os.environ.get("VERCEL"):
                persist_dir = "/tmp/chroma_db"
            os.makedirs(persist_dir, exist_ok=True)
            client = chromadb.PersistentClient(path=persist_dir)
    else:
        # DEVELOPMENT / VERCEL FALLBACK: Use local SQLite
        persist_dir = settings.chroma_persist_dir
        if os.environ.get("VERCEL"):
            persist_dir = "/tmp/chroma_db"
            
        logger.info(f"Using local vector store at {persist_dir}")
        os.makedirs(persist_dir, exist_ok=True)
        client = chromadb.PersistentClient(path=persist_dir)
    
    vectorstore = Chroma(
        client=client,
        collection_name="snu_knowledge",
        embedding_function=get_embeddings()
    )
    return vectorstore

def get_retriever():
    vs = get_vectorstore()
    return vs.as_retriever(search_kwargs={"k": 4})
