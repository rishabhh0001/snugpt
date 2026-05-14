import os
from dotenv import load_dotenv

# Load env variables before anything else
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "..", ".env"))

# pyrefly: ignore [missing-import]
from langchain_community.document_loaders import DirectoryLoader, TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.rag.vectorstore import get_vectorstore
from app.config import settings

def ingest_data():
    kb_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "knowledge_base")
    os.makedirs(kb_dir, exist_ok=True)
    
    print(f"Loading documents from {kb_dir}...")
    
    # Load markdown and text files with explicit utf-8 encoding (which we used in the scraper)
    text_loader = DirectoryLoader(kb_dir, glob="**/*.txt", loader_cls=TextLoader, loader_kwargs={'encoding': 'utf-8'})
    md_loader = DirectoryLoader(kb_dir, glob="**/*.md", loader_cls=TextLoader, loader_kwargs={'encoding': 'utf-8'})
    pdf_loader = DirectoryLoader(kb_dir, glob="**/*.pdf", loader_cls=PyPDFLoader)
    
    docs = []
    try:
        docs.extend(text_loader.load())
    except Exception as e:
        print(f"No text files or error: {e}")
        
    try:
        docs.extend(md_loader.load())
    except Exception as e:
        print(f"No markdown files or error: {e}")
        
    try:
        docs.extend(pdf_loader.load())
    except Exception as e:
        print(f"No PDF files or error: {e}")
        
    if not docs:
        print("No documents found to ingest. Please place files in backend/knowledge_base/")
        return
        
    print(f"Loaded {len(docs)} documents.")
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200, # Increased from 500 to halve the total chunks (faster + better context)
        chunk_overlap=150
    )
    
    splits = text_splitter.split_documents(docs)
    print(f"Split into {len(splits)} chunks.")
    
    vectorstore = get_vectorstore()
    print("Adding to vectorstore in batches...")
    
    # Increase batch size and use a ThreadPool to upload concurrently
    batch_size = 200 
    
    from concurrent.futures import ThreadPoolExecutor, as_completed
    
    def upload_batch(b_idx, batch):
        try:
            vectorstore.add_documents(batch)
            return b_idx, True, None
        except Exception as e:
            return b_idx, False, str(e)

    batches = [splits[i:i+batch_size] for i in range(0, len(splits), batch_size)]
    total_batches = len(batches)
    
    # Use 5 concurrent workers (adjust if you hit NVIDIA rate limits)
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(upload_batch, i, batch): i for i, batch in enumerate(batches)}
        
        completed = 0
        for future in as_completed(futures):
            b_idx = futures[future]
            completed += 1
            idx, success, error = future.result()
            
            if success:
                print(f"Processed batch {completed}/{total_batches}...")
            else:
                print(f"Error in batch {completed}/{total_batches}: {error}")
                print("Retrying sequentially...")
                # Fallback sequential retry
                for doc in batches[b_idx]:
                    try:
                        vectorstore.add_documents([doc])
                    except Exception as inner_e:
                        pass
                    
    print("Ingestion complete!")

if __name__ == "__main__":
    ingest_data()
