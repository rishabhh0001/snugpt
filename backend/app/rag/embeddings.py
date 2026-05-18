from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from app.config import settings
import os

_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        # We use the NV-Embed-QA model which is optimized for RAG
        api_key = settings.nvidia_api_key or os.getenv("NVIDIA_API_KEY")
        _embeddings = NVIDIAEmbeddings(
            model="nvidia/nv-embedqa-e5-v5", 
            nvidia_api_key=api_key
        )
    return _embeddings
