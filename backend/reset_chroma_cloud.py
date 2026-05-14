"""
Run this ONCE to delete the old 384-dim collection from Chroma Cloud
and recreate it fresh for the 1024-dim NVIDIA embeddings.

Usage:
    cd backend
    python reset_chroma_cloud.py
"""
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

import chromadb

api_key = os.getenv("CHROMA_API_KEY")
if not api_key:
    print("ERROR: CHROMA_API_KEY not found in .env")
    exit(1)

client = chromadb.CloudClient(
    api_key=api_key,
    tenant="bf7a99b2-7384-49c8-8710-25dc1baccd97",
    database="SNUGPT"
)

COLLECTION_NAME = "snu_knowledge"

# List existing collections
collections = client.list_collections()
print(f"Existing collections: {[c.name for c in collections]}")

# Delete the old collection if it exists
try:
    client.delete_collection(COLLECTION_NAME)
    print(f"[OK] Deleted old collection '{COLLECTION_NAME}'")
except Exception as e:
    print(f"Collection not found or error: {e}")

# Create a fresh collection (dimension will be auto-set on first upsert)
client.create_collection(COLLECTION_NAME)
print(f"[OK] Created fresh collection '{COLLECTION_NAME}'")
print("\nDone! Now run: python -m app.ingestion.ingest")
