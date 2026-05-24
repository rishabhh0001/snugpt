import os
import sys
from dotenv import load_dotenv

# Load environment variables BEFORE importing any app modules
load_dotenv()

# Add the backend directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.rag.vectorstore import retrieve_documents, get_bm25_index

def run_tests():
    print("=== SNUGPT Hybrid Search Verification ===")
    
    # 1. Warm up BM25 index
    print("\n[Test 1] Initializing BM25 Index...")
    bm25, corpus = get_bm25_index()
    if bm25 is None:
        print("FAIL: Could not load BM25 index (are Chroma settings correct and running?)")
        return
    print(f"SUCCESS: Loaded BM25 index with {len(corpus)} documents.")
    
    # 2. Test exact course code query
    # Find a course code or similar token in the actual corpus to search for
    test_course_code = None
    test_subsection = None
    
    import re
    # Scan corpus for a typical course code or subsection to make the test dynamic and guaranteed to match
    course_pattern = re.compile(r'\b[a-zA-Z]{3}\d{3}\b')
    sub_pattern = re.compile(r'\b\d+\.\d+(?:\.\d+)?\b')
    
    for doc in corpus:
        text = doc.page_content
        if not test_course_code:
            match = course_pattern.search(text)
            if match:
                test_course_code = match.group(0)
        if not test_subsection:
            match = sub_pattern.search(text)
            if match:
                test_subsection = match.group(0)
        if test_course_code and test_subsection:
            break

    # Defaults if corpus is empty or doesn't contain matching tokens
    if not test_course_code:
        test_course_code = "CSD101"
    if not test_subsection:
        test_subsection = "4.2"
        
    print(f"\n[Test 2] Querying Course Code: '{test_course_code}'...")
    results = retrieve_documents(f"Tell me about {test_course_code}", k=3)
    if results:
        print(f"SUCCESS: Retrieved {len(results)} documents.")
        for idx, doc in enumerate(results, 1):
            excerpt = doc.page_content.replace("\n", " ")[:120]
            contains_target = test_course_code.lower() in doc.page_content.lower()
            status = "MATCHED (BOOSTED)" if contains_target else "NO MATCH"
            print(f"  Rank {idx}: [{status}] - {excerpt}...")
        
        # Verify the top document matches the exact target if any matches exist in corpus
        top_text = results[0].page_content.lower()
        if any(test_course_code.lower() in d.page_content.lower() for d in corpus):
            if test_course_code.lower() in top_text:
                print("PASS: Exact course code document successfully boosted to Rank 1!")
            else:
                print("FAIL: Exact course code document was not Rank 1.")
        else:
            print("INFO: Test target course code is not in the database; skipping Rank 1 validation.")
    else:
        print("FAIL: No documents retrieved for course query.")

    # 3. Test exact subsection query
    print(f"\n[Test 3] Querying Subsection: '{test_subsection}'...")
    results = retrieve_documents(f"What is in section {test_subsection}?", k=3)
    if results:
        print(f"SUCCESS: Retrieved {len(results)} documents.")
        for idx, doc in enumerate(results, 1):
            excerpt = doc.page_content.replace("\n", " ")[:120]
            contains_target = test_subsection.lower() in doc.page_content.lower()
            status = "MATCHED (BOOSTED)" if contains_target else "NO MATCH"
            print(f"  Rank {idx}: [{status}] - {excerpt}...")
            
        top_text = results[0].page_content.lower()
        if any(test_subsection.lower() in d.page_content.lower() for d in corpus):
            if test_subsection.lower() in top_text:
                print("PASS: Exact subsection document successfully boosted to Rank 1!")
            else:
                print("FAIL: Exact subsection document was not Rank 1.")
        else:
            print("INFO: Test target subsection is not in the database; skipping Rank 1 validation.")
    else:
        print("FAIL: No documents retrieved for subsection query.")

if __name__ == "__main__":
    run_tests()
