import os
import sys
from dotenv import load_dotenv

# Load env
load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.rag.vectorstore import rerank_documents
from langchain_core.documents import Document

def test_reranking():
    print("=== SNUGPT Cross-Encoder Re-ranking Test ===")
    
    query = "What is CSD101?"
    docs = [
        Document(page_content="Shiv Nadar University is a private research university located in Greater Noida.", metadata={"id": 1}),
        Document(page_content="CSD101 is Introduction to Computing and Programming. It covers procedural programming, algorithms, and computational thinking using Python.", metadata={"id": 2}),
        Document(page_content="MAT203 is Advanced Calculus and Linear Algebra, which is a required math course for CSE majors.", metadata={"id": 3})
    ]
    
    print(f"\nQuery: '{query}'")
    print("Original order:")
    for idx, doc in enumerate(docs, 1):
        print(f"  {idx}. {doc.page_content[:90]}...")
        
    print("\nRunning Reranking...")
    reranked = rerank_documents(query, docs, top_n=2)
    
    print("\nRe-ranked top 2 order:")
    for idx, doc in enumerate(reranked, 1):
        print(f"  {idx}. {doc.page_content[:90]}...")
        
    if len(reranked) > 0 and "CSD101" in reranked[0].page_content:
        print("\nPASS: Reranker successfully placed the exact match CSD101 document at Rank 1!")
    else:
        print("\nFAIL: Reranker failed to rank the CSD101 document at Rank 1.")

if __name__ == "__main__":
    test_reranking()
