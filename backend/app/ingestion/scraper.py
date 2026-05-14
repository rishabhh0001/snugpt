import os
import requests
import re
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup

def clean_text(text):
    # Remove extra whitespace and newlines
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

def get_domain(url):
    return urlparse(url).netloc

def crawl_domain(start_urls, output_dir, max_pages=300):
    visited = set()
    to_visit = list(start_urls)
    
    # Allowed domains based on start_urls
    allowed_domains = {get_domain(url) for url in start_urls}
    
    pages_scraped = 0
    
    while to_visit and pages_scraped < max_pages:
        url = to_visit.pop(0)
        
        # Normalize URL to avoid duplicates (remove fragments, trailing slashes)
        parsed = urlparse(url)
        normalized_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        if normalized_url.endswith('/'):
            normalized_url = normalized_url[:-1]
            
        if normalized_url in visited:
            continue
            
        visited.add(normalized_url)
        
        try:
            print(f"Scraping [{pages_scraped+1}/{max_pages}]: {url}")
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
            
            # Only process HTML
            if 'text/html' not in response.headers.get('Content-Type', ''):
                continue
                
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract links and add to queue
            for link in soup.find_all('a', href=True):
                href = link['href']
                absolute_url = urljoin(url, href)
                
                # Check domain and that it is http/https (skip mailto, javascript, etc)
                parsed_absolute = urlparse(absolute_url)
                if parsed_absolute.scheme in ['http', 'https'] and get_domain(absolute_url) in allowed_domains:
                    # Ignore anchors
                    clean_url = f"{parsed_absolute.scheme}://{parsed_absolute.netloc}{parsed_absolute.path}"
                    if clean_url not in visited and clean_url not in to_visit:
                        to_visit.append(clean_url)
            
            # Extract content
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.extract()
                
            title = soup.title.string if soup.title else "Untitled"
            title = title.strip()
            text = clean_text(soup.get_text())
            
            # Skip empty or very small pages (less than 100 characters of real text)
            if len(text) < 100:  
                continue
                
            # Generate filename from URL
            filename = parsed.netloc + parsed.path
            filename = filename.replace('/', '_').replace('.', '_').strip('_')
            if not filename:
                filename = "index"
                
            filepath = os.path.join(output_dir, f"{filename}.md")
            
            # Save to markdown
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(f"# {title}\n\n")
                f.write(f"Source URL: {url}\n\n")
                f.write(text)
                
            pages_scraped += 1
            
        except requests.exceptions.RequestException as e:
            print(f"Request failed for {url}: {e}")
        except Exception as e:
            print(f"Failed to scrape {url}: {e}")

def run_scraper():
    # Start URLs to seed the crawler
    start_urls = [
        "https://snu.edu.in",
        "https://snuadmissions.com"
    ]
    
    # Path to knowledge_base
    kb_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "knowledge_base")
    os.makedirs(kb_dir, exist_ok=True)
    
    scraped_dir = os.path.join(kb_dir, "scraped_web")
    os.makedirs(scraped_dir, exist_ok=True)
    
    print(f"Starting domain crawler. Target limit: 300 pages...")
    crawl_domain(start_urls, scraped_dir, max_pages=300)
    
    print("Scraping complete. Run ingest.py to add these to the vector database.")

if __name__ == "__main__":
    run_scraper()
