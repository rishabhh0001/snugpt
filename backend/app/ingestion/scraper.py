import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time

def scrape_snu():
    base_urls = ["https://snu.edu.in", "https://snuadmissions.com"]
    visited = set()
    to_visit = set(base_urls)
    max_pages = 300
    count = 0
    
    # Create directory for scraped content
    scraped_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "knowledge_base", "scraped_web")
    os.makedirs(scraped_dir, exist_ok=True)
    
    print(f"Starting recursive crawl of SNU domains (limit: {max_pages} pages)...")
    
    while to_visit and count < max_pages:
        url = to_visit.pop()
        if url in visited:
            continue
            
        visited.add(url)
        try:
            print(f"[{count+1}/{max_pages}] Scraping: {url}")
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                continue
                
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Clean up the soup (remove scripts, styles, etc.)
            for script_or_style in soup(["script", "style", "nav", "footer"]):
                script_or_style.decompose()
            
            text = soup.get_text(separator=' ', strip=True)
            
            # Save to file
            filename = url.replace("https://", "").replace("http://", "").replace("/", "_").replace(".", "_") + ".md"
            if len(filename) > 200: filename = filename[:200]
            
            filepath = os.path.join(scraped_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(f"# Source: {url}\n\n")
                f.write(text)
            
            count += 1
            
            # Find more links on the same domains
            for link in soup.find_all('a', href=True):
                next_url = urljoin(url, link['href']).split('#')[0].rstrip('/')
                parsed_next = urlparse(next_url)
                
                # Stay within the SNU domains
                if any(domain in parsed_next.netloc for domain in ["snu.edu.in", "snuadmissions.com"]):
                    if next_url not in visited:
                        to_visit.add(next_url)
                        
            # Polite delay
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")

    print(f"✅ Scraping complete! Saved {count} pages to {scraped_dir}")

if __name__ == "__main__":
    scrape_snu()
