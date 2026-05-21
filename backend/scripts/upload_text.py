import sys
import os
from pathlib import Path

# Add backend directory to path to allow absolute imports
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from dotenv import load_dotenv
load_dotenv()

from app.rag.vectorstore import add_documents
from langchain_core.documents import Document

def upload_text(text: str, source: str = "supervised data"):
    """Uploads raw text to ChromaDB."""
    if not text.strip():
        print("Error: Empty text provided.")
        return

    doc = Document(page_content=text, metadata={"source": source})
    
    try:
        add_documents([doc])
        print(f"SUCCESS: Successfully uploaded to ChromaDB!")
        print(f"Source: {source}")
        print(f"Content Preview: {text[:50]}...")
    except Exception as e:
        print(f"ERROR: Failed to upload: {e}")

def upload_documents_from_dir(docs_dir: Path):
    """Loads documents from the specified directory, chunks them, and adds them to ChromaDB."""
    print(f"Starting indexing process for directory: {docs_dir}")
    
    if not docs_dir.exists():
        print(f"Directory {docs_dir} does not exist.")
        return

    # Define Loaders for different file types
    text_loader_kwargs = {'autodetect_encoding': True}
    
    from langchain_community.document_loaders import DirectoryLoader, TextLoader, PyPDFLoader
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    loaders = {
        ".txt": DirectoryLoader(str(docs_dir), glob="**/*.txt", loader_cls=TextLoader, loader_kwargs=text_loader_kwargs),
        ".pdf": DirectoryLoader(str(docs_dir), glob="**/*.pdf", loader_cls=PyPDFLoader),
        ".md": DirectoryLoader(str(docs_dir), glob="**/*.md", loader_cls=TextLoader, loader_kwargs=text_loader_kwargs),
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
            print(f"Warning: Error loading {extension} files: {e}")

    if not documents:
        print("No documents found in the directory to index.")
        return

    # Chunking
    print("Splitting documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} chunks from {len(documents)} documents.")

    # Upload to ChromaDB in batches
    print("Uploading chunks to ChromaDB...")
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        try:
            add_documents(batch)
            print(f"Progress: {min(i + batch_size, len(chunks))}/{len(chunks)} chunks uploaded.")
        except Exception as e:
            print(f"ERROR: Failed to upload batch at index {i}: {e}")
            raise e

    print("Indexing complete! SNUGPT is now smarter.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Upload text or file content to ChromaDB.")
    parser.add_argument("content", nargs="?", help="The text content to upload")
    parser.add_argument("--file", help="Path to a file to upload")
    parser.add_argument("--source", default="supervised data", help="Source metadata for the document")
    parser.add_argument("--docs", action="store_true", help="Upload all documents in /docs directory")
    
    args = parser.parse_args()
    
    docs_dir = backend_dir.parent / "docs"
    
    # Check if there are indexable files in the docs directory
    has_files = False
    if docs_dir.exists() and docs_dir.is_dir():
        for path in docs_dir.rglob("*"):
            if path.is_file() and path.suffix.lower() in [".txt", ".md", ".pdf"]:
                has_files = True
                break

    if args.docs or (not args.content and not args.file and has_files):
        upload_documents_from_dir(docs_dir)
    elif args.file:
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"Error: File {args.file} not found.")
            sys.exit(1)
        content = file_path.read_text(encoding="utf-8")
        source = args.source if args.source != "supervised data" else file_path.name
        upload_text(content, source)
    elif args.content:
        upload_text(args.content, args.source)
    else:
        print("Usage: python upload_text.py \"Your text\" OR python upload_text.py --file path/to/file.txt OR python upload_text.py --docs")
        sys.exit(1)
