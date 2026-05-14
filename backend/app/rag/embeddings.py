from langchain_huggingface import HuggingFaceEmbeddings

# Initialize local embeddings (singleton)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def get_embeddings():
    return embeddings
