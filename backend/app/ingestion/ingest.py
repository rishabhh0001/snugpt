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
        chunk_size=500,
        chunk_overlap=50
    )
    
    splits = text_splitter.split_documents(docs)
    print(f"Split into {len(splits)} chunks.")
    
    vectorstore = get_vectorstore()
    print("Adding to vectorstore in batches...")
    
    batch_size = 100
    for i in range(0, len(splits), batch_size):
        batch = splits[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1}/{(len(splits)-1)//batch_size + 1} (Chunks {i} to {i+len(batch)})...")
        try:
            vectorstore.add_documents(batch)
        except Exception as e:
            print(f"Error in batch {i//batch_size + 1}: {e}")
            print("Retrying with smaller sub-batches...")
            for doc in batch:
                try:
                    vectorstore.add_documents([doc])
                except Exception as inner_e:
                    print(f"Failed to add document snippet: {inner_e}")
                    
    print("Ingestion complete!")

if __name__ == "__main__":
    ingest_data()
