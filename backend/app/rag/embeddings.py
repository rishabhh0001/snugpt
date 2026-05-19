from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from app.config import settings
import os

import threading

_embeddings = None
_embeddings_lock = threading.Lock()

def get_embeddings():
    global _embeddings
    if _embeddings is not None:
        return _embeddings
    
    with _embeddings_lock:
        if _embeddings is None:
            # We use the NV-Embed-QA model which is optimized for RAG
            api_key = settings.nvidia_api_key or os.getenv("NVIDIA_API_KEY")
            _embeddings = NVIDIAEmbeddings(
                model="nvidia/nv-embedqa-e5-v5", 
                nvidia_api_key=api_key
            )
    return _embeddings
