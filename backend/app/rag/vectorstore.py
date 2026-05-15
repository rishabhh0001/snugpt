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
            client = chromadb.CloudClient(
                api_key=settings.chroma_api_key,
                tenant=settings.chroma_tenant,
                database=settings.chroma_database
            )
        except Exception as e:
            logger.error(f"Chroma Cloud connection failed: {e}. Falling back to local.")
            client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
    else:
        # DEVELOPMENT: Use Local SQLite
        logger.info(f"Using local vector store at {settings.chroma_persist_dir}")
        os.makedirs(settings.chroma_persist_dir, exist_ok=True)
        client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
    
    vectorstore = Chroma(
        client=client,
        collection_name="snu_knowledge",
        embedding_function=get_embeddings()
    )
    return vectorstore

def get_retriever():
    vs = get_vectorstore()
    return vs.as_retriever(search_kwargs={"k": 4})
