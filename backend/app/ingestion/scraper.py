import os
from bs4 import BeautifulSoup
import requests
import re
from urllib.parse import urlparse

def clean_text(text):
    # Remove extra whitespace and newlines
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

def scrape_url_to_md(url, output_dir):
    try:
        print(f"Scraping {url}...")
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer"]):
            script.extract()
            
        # Get title
        title = soup.title.string if soup.title else "Untitled"
        title = title.strip()
        
        # Get text
        text = soup.get_text()
        text = clean_text(text)
        
        # Generate filename from URL
        parsed_url = urlparse(url)
        filename = parsed_url.netloc + parsed_url.path
        filename = filename.replace('/', '_').replace('.', '_').strip('_')
        if not filename:
            filename = "index"
            
        filepath = os.path.join(output_dir, f"{filename}.md")
        
        # Save to markdown
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(f"# {title}\n\n")
            f.write(f"Source URL: {url}\n\n")
            f.write(text)
            
        print(f"Saved to {filepath}")
        return True
    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return False

def run_scraper():
    urls_to_scrape = [
        "https://snu.edu.in/home/",
        "https://snuadmissions.com/",
        "https://snu.edu.in/admissions/",
        "https://snu.edu.in/academics/",
        "https://snu.edu.in/campus-life/"
    ]
    
    # Path to knowledge_base
    kb_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "knowledge_base")
    os.makedirs(kb_dir, exist_ok=True)
    
    scraped_dir = os.path.join(kb_dir, "scraped_web")
    os.makedirs(scraped_dir, exist_ok=True)
    
    print(f"Starting scraper for {len(urls_to_scrape)} URLs...")
    for url in urls_to_scrape:
        scrape_url_to_md(url, scraped_dir)
        
    print("Scraping complete. Run ingest.py to add these to the vector database.")

if __name__ == "__main__":
    run_scraper()
