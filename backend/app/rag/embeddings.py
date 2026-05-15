from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from app.config import settings

def get_embeddings():
    # We use the NV-Embed-QA model which is optimized for RAG
    return NVIDIAEmbeddings(
        model="nvidia/nv-embedqa-e5-v5", 
        nvidia_api_key=settings.nvidia_api_key
    )
