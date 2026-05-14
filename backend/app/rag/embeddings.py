# pyrefly: ignore [missing-import]
from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings
import os

# Initialize NVIDIA embeddings (singleton)
# We use the NV-Embed-QA model which is optimized for RAG
embeddings = NVIDIAEmbeddings(
    model="nvidia/nv-embedqa-e5-v5", 
    api_key=os.getenv("NVIDIA_API_KEY")
)

def get_embeddings():
    return embeddings
