from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
from app.config import settings
import os

def get_embeddings():
    # We use the NV-Embed-QA model which is optimized for RAG
    api_key = settings.nvidia_api_key or os.getenv("NVIDIA_API_KEY")
    if not api_key:
        # Fallback or informative error if needed, but for now we try to initialize
        # langchain-nvidia will raise a clearer error if the key is missing during call
        pass
        
    return NVIDIAEmbeddings(
        model="nvidia/nv-embedqa-e5-v5", 
        nvidia_api_key=api_key
    )
