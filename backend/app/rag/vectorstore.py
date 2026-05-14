import os
from langchain_community.vectorstores import Chroma
import chromadb
from app.rag.embeddings import get_embeddings
from app.config import settings

def get_vectorstore():
    # Detect if we should use Chroma Cloud or Local
    api_key = os.getenv("CHROMA_API_KEY")
    
    if api_key:
        # PRODUCTION: Use Chroma Cloud
        client = chromadb.CloudClient(
            api_key=api_key,
            tenant="bf7a99b2-7384-49c8-8710-25dc1baccd97",
            database="SNUGPT"
        )
    else:
        # DEVELOPMENT: Use Local SQLite
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
