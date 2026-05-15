import os
from langchain_chroma import Chroma
import chromadb
from app.rag.embeddings import get_embeddings
from app.config import settings

def get_vectorstore():
    # Detect if we should use Chroma Cloud or Local
    api_key = os.getenv("CHROMA_API_KEY")
    use_cloud = os.getenv("USE_CHROMA_CLOUD", "false").lower() == "true"
    
    if api_key and use_cloud:
        # PRODUCTION: Use Chroma Cloud
        tenant = os.getenv("CHROMA_TENANT", "default")
        database_name = os.getenv("CHROMA_DATABASE", "default")
        print(f"Connecting to Chroma Cloud (Tenant: {tenant}, DB: {database_name})...")
        try:
            client = chromadb.CloudClient(
                api_key=api_key,
                tenant=tenant,
                database=database_name
            )
        except Exception as e:
            print(f"Cloud connection failed: {e}. Falling back to local storage.")
            client = chromadb.PersistentClient(path=settings.chroma_persist_dir)
    else:
        # DEVELOPMENT: Use Local SQLite
        print(f"Using local vector store at {settings.chroma_persist_dir}")
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
