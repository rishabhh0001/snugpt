import chromadb
import os
from dotenv import load_dotenv

# Load env vars
load_dotenv()

def push_to_cloud():
    print("Connecting to local database...")
    # 1. Connect to local database
    # Path is relative to project root
    local_client = chromadb.PersistentClient(path="./backend/chroma_db")
    local_collection = local_client.get_collection("snu_knowledge")

    # 2. Connect to Chroma Cloud using official CloudClient
    print("Connecting to Chroma Cloud...")
    api_key = os.getenv("CHROMA_API_KEY")
    
    # CloudClient automatically handles headers and endpoints
    cloud_client = chromadb.CloudClient(
        api_key=api_key,
        tenant="bf7a99b2-7384-49c8-8710-25dc1baccd97",
        database="SNUGPT"
    )

    # 3. Get your data
    print("Fetching data from local collection...")
    data = local_collection.get(include=['embeddings', 'documents', 'metadatas'])
    
    if not data['ids']:
        print("No data found in local collection!")
        return

    # 4. Create/Get collection on cloud
    print(f"Syncing {len(data['ids'])} items to cloud...")
    cloud_collection = cloud_client.get_or_create_collection("snu_knowledge")

    # 5. Upload in batches (to avoid timeout/payload limits)
    batch_size = 100
    for i in range(0, len(data['ids']), batch_size):
        end = i + batch_size
        cloud_collection.add(
            ids=data['ids'][i:end],
            embeddings=data['embeddings'][i:end],
            metadatas=data['metadatas'][i:end],
            documents=data['documents'][i:end]
        )
        print(f"Uploaded batch {i//batch_size + 1}/{(len(data['ids'])-1)//batch_size + 1}")

    print("SUCCESS: Successfully pushed all data to Chroma Cloud!")

if __name__ == "__main__":
    push_to_cloud()
