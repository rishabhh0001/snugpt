import os
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time

# ── Config ────────────────────────────────────────────────────────────────────
BASE_URLS = [
    "https://snu.edu.in",
    "https://snu.edu.in/admissions",
    "https://snu.edu.in/academics",
    "https://snu.edu.in/campus-life",
    "https://snu.edu.in/home/mandatory-disclosure",
    "https://snu.edu.in/schools",
    "https://snu.edu.in/research",
    "https://snuadmissions.com",
    "https://rslookup.abs.moe/",
    "https://snulinks.snu.edu.in/application/student-policy",
    "https://wiki.snu.edu.in/index.php?title=Main_Page",
]

ALLOWED_DOMAINS = [
    "snu.edu.in",
    "snuadmissions.com",
    "rslookup.abs.moe",
    "snulinks.snu.edu.in",
    "wiki.snu.edu.in",
]

SKIP_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".svg", ".zip", ".docx", ".xlsx"}
SKIP_PATTERNS   = ["#", "mailto:", "tel:", "javascript:", "login", "logout", "signin", "signup"]


def clean_text(text: str) -> str:
    """Collapse whitespace and strip junk."""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_markdown(soup: BeautifulSoup, url: str) -> str:
    """
    Convert a BeautifulSoup page into clean, structured Markdown.
    Preserves headings, paragraphs, lists, and tables.
    """
    # Remove noise elements
    for tag in soup(["script", "style", "noscript", "nav", "footer",
                     "header", "aside", "form", "iframe", "button",
                     "svg", "img", "figure", "figcaption"]):
        tag.decompose()

    lines = []
    main = soup.find("main") or soup.find("article") or soup.find("div", class_=re.compile(r"content|main|body", re.I)) or soup.body

    if not main:
        return ""

    for element in main.find_all(["h1", "h2", "h3", "h4", "h5", "h6",
                                   "p", "ul", "ol", "li", "table", "tr",
                                   "th", "td", "blockquote", "strong", "em"]):
        tag = element.name
        text = clean_text(element.get_text())

        if not text or len(text) < 2:
            continue

        if tag == "h1":
            lines.append(f"\n# {text}\n")
        elif tag == "h2":
            lines.append(f"\n## {text}\n")
        elif tag == "h3":
            lines.append(f"\n### {text}\n")
        elif tag in ("h4", "h5", "h6"):
            lines.append(f"\n#### {text}\n")
        elif tag == "p":
            lines.append(f"{text}\n")
        elif tag == "li":
            lines.append(f"- {text}")
        elif tag == "th":
            lines.append(f"**{text}** | ")
        elif tag == "td":
            lines.append(f"{text} | ")
        elif tag == "blockquote":
            lines.append(f"> {text}\n")

    return "\n".join(lines)


def url_to_filename(url: str) -> str:
    """Convert a URL to a safe, readable markdown filename."""
    name = url.replace("https://", "").replace("http://", "")
    name = re.sub(r'[^a-zA-Z0-9_\-]', '_', name)
    name = re.sub(r'_+', '_', name).strip('_')
    return (name[:180] + ".md") if len(name) > 180 else name + ".md"


def should_skip(url: str) -> bool:
    ext = os.path.splitext(urlparse(url).path)[1].lower()
    if ext in SKIP_EXTENSIONS:
        return True
    return any(p in url.lower() for p in SKIP_PATTERNS)


def scrape_snu():
    visited  = set()
    to_visit = set(BASE_URLS)
    max_pages = 1000
    count = 0

    scraped_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "knowledge_base", "scraped_web"
    )
    os.makedirs(scraped_dir, exist_ok=True)

    print(f"Starting recursive crawl (limit: {max_pages} pages) -> {scraped_dir}")

    headers = {"User-Agent": "SnuGPT-Scraper/1.0 (educational bot; contact: rishabhh0001@github)"}

    while to_visit and count < max_pages:
        url = to_visit.pop()

        if url in visited or should_skip(url):
            continue
        visited.add(url)

        try:
            print(f"  [{count + 1}/{max_pages}] {url}")
            response = requests.get(url, timeout=12, headers=headers)
            if response.status_code != 200:
                continue

            soup = BeautifulSoup(response.text, "html.parser")

            # Page title
            title = clean_text(soup.title.get_text()) if soup.title else url

            # Extract clean markdown
            md_body = extract_markdown(soup, url)
            if not md_body or len(md_body) < 100:
                continue   # Skip pages with no meaningful content

            # Write formatted markdown file
            filename = url_to_filename(url)
            filepath = os.path.join(scraped_dir, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(f"# Source: {url}\n")
                f.write(f"# Title: {title}\n\n")
                f.write(md_body)

            count += 1

            # Discover more links
            for link in soup.find_all("a", href=True):
                next_url = urljoin(url, link["href"]).split("#")[0].rstrip("/")
                parsed   = urlparse(next_url)
                if (
                    any(d in parsed.netloc for d in ALLOWED_DOMAINS)
                    and next_url not in visited
                    and not should_skip(next_url)
                ):
                    to_visit.add(next_url)

            time.sleep(0.4)  # polite delay

        except Exception as e:
            print(f"  [ERROR] {url}: {e}")

    print(f"[DONE] Scraped {count} pages -> {scraped_dir}")


if __name__ == "__main__":
    scrape_snu()
