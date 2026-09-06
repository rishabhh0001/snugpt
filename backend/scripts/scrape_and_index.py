import os
import sys
import asyncio
from dotenv import load_dotenv

load_dotenv()
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from langchain_community.document_loaders import RecursiveUrlLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.rag.vectorstore import add_documents
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _custom_extract(html: str) -> str:
    """Extract clean, semantic text from HTML."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")
    
    # Remove elements that destroy context or are repetitive
    for el in soup(["script", "style", "footer", "nav", "header", "aside"]):
        el.decompose()
    
    # Extract text with double newlines
    text = soup.get_text(separator="\n\n")
    
    # Clean up whitespace
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    return "\n".join(chunk for chunk in chunks if chunk)

def scrape_and_index_snu():
    base_url = "https://snu.edu.in/"
    
    logger.info(f"Starting web scraping for {base_url} up to depth 5...")
    
    # RecursiveUrlLoader will crawl links up to max_depth
    loader = RecursiveUrlLoader(
        url=base_url,
        max_depth=5,
        extractor=_custom_extract,
        prevent_outside=True,
    )
    
    try:
        # Note: A depth of 5 can yield a massive number of pages and take significant time.
        # Ensure you run this script as a background process or screen session.
        docs = loader.load()
        logger.info(f"Loaded {len(docs)} documents.")
    except Exception as e:
        logger.error(f"Failed to crawl website: {e}")
        return

    if not docs:
        logger.info("No documents were scraped. Exiting.")
        return

    logger.info("Splitting documents to preserve context...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1200, 
        chunk_overlap=250, # Sufficient overlap to maintain context between chunks
        length_function=len
    )
    chunks = text_splitter.split_documents(docs)
    
    # 1. Sanitize metadata to avoid ChromaDB serialization errors
    # 2. Filter out base64 images to prevent NVIDIA VLM embedding crashes
    valid_chunks = []
    for chunk in chunks:
        cleaned_meta = {}
        for k, v in chunk.metadata.items():
            if v is None:
                continue
            if isinstance(v, (str, int, float, bool)):
                cleaned_meta[k] = v
            else:
                cleaned_meta[k] = str(v)
        chunk.metadata = cleaned_meta
        
        if "data:image/" not in chunk.page_content:
            valid_chunks.append(chunk)
            
    chunks = valid_chunks
    
    logger.info(f"Created {len(chunks)} contextual chunks. Uploading to Chroma DB in batches...")
    
    batch_size = 50
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        try:
            add_documents(batch)
            logger.info(f"Progress: {min(i + batch_size, len(chunks))}/{len(chunks)} chunks uploaded.")
        except Exception as e:
            logger.error(f"Error uploading batch {i}: {e}")
            
    logger.info("Scraping and Indexing complete!")

if __name__ == "__main__":
    scrape_and_index_snu()
