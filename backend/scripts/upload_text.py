import sys
import os
from pathlib import Path

# Add backend directory to path to allow absolute imports
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from app.rag.vectorstore import add_documents
from langchain_core.documents import Document

def upload_text(text: str, source: str = "manual_entry"):
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

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Upload text or file content to ChromaDB.")
    parser.add_argument("content", nargs="?", help="The text content to upload")
    parser.add_argument("--file", help="Path to a file to upload")
    parser.add_argument("--source", default="manual_entry", help="Source metadata for the document")
    
    args = parser.parse_args()
    
    if args.file:
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
        print("Usage: python upload_text.py \"Your text\" OR python upload_text.py --file path/to/file.txt")
        sys.exit(1)
