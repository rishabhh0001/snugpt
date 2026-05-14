import os
from langchain_community.vectorstores import Chroma
import chromadb
from app.rag.embeddings import get_embeddings
from app.config import settings

def get_vectorstore():
    # Make sure path exists
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
