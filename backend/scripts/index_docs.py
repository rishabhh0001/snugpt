import os
import sys
from typing import List
from dotenv import load_dotenv

# Load environment variables BEFORE importing any app modules
load_dotenv()

# Add the backend directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_community.document_loaders import (
    DirectoryLoader,
    TextLoader,
    PyPDFLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.rag.vectorstore import add_documents

def index_documents(docs_dir: str):
    """
    Loads documents from the specified directory, chunks them, 
    and adds them to the Chroma vector store.
    """
    print(f"Starting indexing process for directory: {docs_dir}")
    
    if not os.path.exists(docs_dir):
        print(f"Directory {docs_dir} does not exist.")
        return

    # 1. Define Loaders for different file types
    # Text and Markdown files
    text_loader_kwargs={'autodetect_encoding': True}
    loaders = {
        ".txt": DirectoryLoader(docs_dir, glob="**/*.txt", loader_cls=TextLoader, loader_kwargs=text_loader_kwargs),
        ".pdf": DirectoryLoader(docs_dir, glob="**/*.pdf", loader_cls=PyPDFLoader),
        ".md": DirectoryLoader(docs_dir, glob="**/*.md", loader_cls=TextLoader, loader_kwargs=text_loader_kwargs),
    }

    documents = []
    for extension, loader in loaders.items():
        print(f"Loading {extension} files...")
        try:
            docs = loader.load()
            if docs:
                print(f"Loaded {len(docs)} documents from {extension} files.")
                documents.extend(docs)
        except Exception as e:
            print(f"Error loading {extension} files: {e}")

    if not documents:
        print("No documents found to index.")
        return

    # 2. Chunking
    print("Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks from {len(documents)} documents.")

    # 3. Upload to ChromaDB
    print("Uploading chunks to ChromaDB...")
    # We add in batches to avoid any potential API limits or memory issues
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        add_documents(batch)
        print(f"Progress: {min(i + batch_size, len(chunks))}/{len(chunks)} chunks uploaded.")

    print("Indexing complete! SnuGPT is now smarter.")

if __name__ == "__main__":
    # Path to the docs directory relative to the project root
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    docs_path = os.path.join(project_root, "docs")
    
    index_documents(docs_path)
