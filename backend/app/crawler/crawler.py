import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, urldefrag
from urllib.robotparser import RobotFileParser
from typing import List, Dict, Any, Callable, Optional, Set
import re

DEFAULT_USER_AGENT = "WebsiteAnalyzerBot/1.0 (+https://websiteanalyzer.local; contact@websiteanalyzer.local)"
MAX_RESPONSE_SIZE = 5 * 1024 * 1024  # 5 MB max per page

class CrawlOptions:
    def __init__(
        self,
        max_pages: int = 25,
        crawl_delay: float = 0.2,
        same_domain_only: bool = True,
        follow_external: bool = False,
        js_rendering: str = "auto",
        user_agent: str = DEFAULT_USER_AGENT
    ):
        self.max_pages = min(max(max_pages, 1), 100)
        self.crawl_delay = max(0.0, min(crawl_delay, 5.0))
        self.same_domain_only = same_domain_only
        self.follow_external = follow_external
        self.js_rendering = js_rendering
        self.user_agent = user_agent

class WebCrawler:
    def __init__(self, base_url: str, domain: str, options: Optional[CrawlOptions] = None):
        self.base_url = base_url
        self.domain = domain
        self.options = options or CrawlOptions()
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": self.options.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive"
        })
        self.visited_urls: Set[str] = set()
        self.discovered_pages: List[Dict[str, Any]] = []
        self.all_internal_links: Set[str] = set()
        self.all_external_links: Set[str] = set()
        self.robot_parser: Optional[RobotFileParser] = None
        self.robots_txt_found: bool = False
        self.robots_txt_content: str = ""
        self.sitemap_urls: List[str] = []

    def check_robots_txt(self):
        robots_url = urljoin(self.base_url, "/robots.txt")
        try:
            resp = self.session.get(robots_url, timeout=6)
            if resp.status_code == 200 and "text" in resp.headers.get("Content-Type", ""):
                self.robots_txt_found = True
                self.robots_txt_content = resp.text[:10000] # First 10KB
                self.robot_parser = RobotFileParser()
                self.robot_parser.parse(resp.text.splitlines())
                # Extract Sitemap entries
                for line in resp.text.splitlines():
                    if line.strip().lower().startswith("sitemap:"):
                        smap = line.split(":", 1)[1].strip()
                        if smap:
                            self.sitemap_urls.append(smap)
        except Exception:
            self.robots_txt_found = False

    def can_fetch(self, url: str) -> bool:
        if self.robot_parser:
            try:
                return self.robot_parser.can_fetch(self.options.user_agent, url)
            except Exception:
                return True
        return True

    def normalize_link(self, current_url: str, href: str) -> Optional[str]:
        if not href or href.startswith("javascript:") or href.startswith("mailto:") or href.startswith("tel:") or href.startswith("#"):
            return None
        joined = urljoin(current_url, href)
        defragged, _ = urldefrag(joined)
        parsed = urlparse(defragged)
        if parsed.scheme not in ("http", "https"):
            return None
        # Clean query strings for deduplication if desired, or strip trailing slash consistency
        path = parsed.path if parsed.path else "/"
        return f"{parsed.scheme}://{parsed.netloc.lower()}{path}" + (f"?{parsed.query}" if parsed.query else "")

    def crawl(self, progress_callback: Optional[Callable[[int, str, str], None]] = None) -> Dict[str, Any]:
        start_time = time.time()
        
        if progress_callback:
            progress_callback(10, "Validating robots.txt and sitemap", f"Checking robots.txt for {self.domain}")
        
        self.check_robots_txt()

        # Check standard sitemap if not in robots.txt
        if not self.sitemap_urls:
            sitemap_url = urljoin(self.base_url, "/sitemap.xml")
            try:
                s_resp = self.session.head(sitemap_url, timeout=5)
                if s_resp.status_code == 200:
                    self.sitemap_urls.append(sitemap_url)
            except Exception:
                pass

        queue = [self.base_url]
        self.visited_urls.add(self.base_url)

        if progress_callback:
            progress_callback(20, "Connecting to website", f"Requesting initial page: {self.base_url}")

        while queue and len(self.discovered_pages) < self.options.max_pages:
            current_url = queue.pop(0)

            if not self.can_fetch(current_url):
                self.discovered_pages.append({
                    "url": current_url,
                    "status_code": 403,
                    "crawl_status": "Blocked by robots.txt",
                    "title": "",
                    "h1": "",
                    "meta_description": "",
                    "word_count": 0,
                    "internal_links_count": 0,
                    "external_links_count": 0,
                    "images_count": 0,
                    "images_without_alt": 0,
                    "load_time_ms": 0,
                    "content_length": 0,
                    "headers": {},
                    "html": ""
                })
                continue

            page_data = self._fetch_and_parse_page(current_url)
            self.discovered_pages.append(page_data)

            # Update progress
            crawled_count = len(self.discovered_pages)
            progress_pct = min(20 + int((crawled_count / self.options.max_pages) * 35), 55)
            if progress_callback:
                progress_callback(
                    progress_pct,
                    f"Crawling page {crawled_count} of {self.options.max_pages}",
                    f"Crawled: {current_url} ({page_data.get('status_code', 'N/A')})"
                )

            # Add discovered internal links to queue
            for link in page_data.get("internal_links", []):
                self.all_internal_links.add(link)
                if link not in self.visited_urls and len(self.visited_urls) < self.options.max_pages * 3:
                    self.visited_urls.add(link)
                    if len(queue) < self.options.max_pages:
                        queue.append(link)

            for ext in page_data.get("external_links", []):
                self.all_external_links.add(ext)

            if self.options.crawl_delay > 0 and queue:
                time.sleep(self.options.crawl_delay)

        duration = round(time.time() - start_time, 2)
        return {
            "duration": duration,
            "pages": self.discovered_pages,
            "internal_links_count": len(self.all_internal_links),
            "external_links_count": len(self.all_external_links),
            "robots_txt_found": self.robots_txt_found,
            "robots_txt_content": self.robots_txt_content,
            "sitemap_urls": self.sitemap_urls,
            "base_url": self.base_url,
            "domain": self.domain
        }

    def _fetch_and_parse_page(self, url: str) -> Dict[str, Any]:
        fetch_start = time.time()
        try:
            resp = self.session.get(url, timeout=12, stream=True)
            elapsed_ms = round((time.time() - fetch_start) * 1000, 1)

            # Read up to MAX_RESPONSE_SIZE bytes safely
            content_chunks = []
            total_size = 0
            for chunk in resp.iter_content(chunk_size=65536):
                total_size += len(chunk)
                content_chunks.append(chunk)
                if total_size >= MAX_RESPONSE_SIZE:
                    break

            raw_bytes = b"".join(content_chunks)
            encoding = resp.encoding or "utf-8"
            html_text = raw_bytes.decode(encoding, errors="replace")

            # Basic HTML parse
            soup = BeautifulSoup(html_text, "lxml")

            # Extract basic tags
            title_tag = soup.find("title")
            title = title_tag.get_text(strip=True) if title_tag else ""

            meta_desc = ""
            desc_tag = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
            if desc_tag and desc_tag.get("content"):
                meta_desc = desc_tag["content"].strip()

            h1_tags = soup.find_all("h1")
            h1 = h1_tags[0].get_text(strip=True) if h1_tags else ""

            h2_tags = soup.find_all("h2")
            h2_list = [h.get_text(strip=True) for h in h2_tags[:10] if h.get_text(strip=True)]

            canonical_tag = soup.find("link", rel=lambda val: val and "canonical" in val.lower())
            canonical_url = canonical_tag.get("href", "").strip() if canonical_tag else ""

            # Words count
            body = soup.find("body")
            body_text = body.get_text(" ", strip=True) if body else ""
            words = [w for w in body_text.split() if len(w) > 1]
            word_count = len(words)

            # Images
            img_tags = soup.find_all("img")
            images_count = len(img_tags)
            images_without_alt = sum(1 for img in img_tags if not img.get("alt") or not img.get("alt").strip())

            # Links
            internal_links = []
            external_links = []
            for a_tag in soup.find_all("a", href=True):
                norm_link = self.normalize_link(url, a_tag["href"])
                if norm_link:
                    parsed_link = urlparse(norm_link)
                    if parsed_link.netloc.lower() == self.domain or parsed_link.netloc.lower().endswith("." + self.domain):
                        internal_links.append(norm_link)
                    else:
                        external_links.append(norm_link)

            # Deduplicate
            internal_links = list(set(internal_links))
            external_links = list(set(external_links))

            return {
                "url": url,
                "status_code": resp.status_code,
                "crawl_status": "Success" if resp.status_code < 400 else f"HTTP {resp.status_code}",
                "title": title,
                "h1": h1,
                "h2_list": h2_list,
                "meta_description": meta_desc,
                "canonical_url": canonical_url,
                "word_count": word_count,
                "internal_links": internal_links,
                "external_links": external_links,
                "internal_links_count": len(internal_links),
                "external_links_count": len(external_links),
                "images_count": images_count,
                "images_without_alt": images_without_alt,
                "load_time_ms": elapsed_ms,
                "content_length": total_size,
                "headers": dict(resp.headers),
                "html": html_text[:120000] # Store first 120KB for feature and tech analyzers
            }

        except requests.exceptions.Timeout:
            return {
                "url": url,
                "status_code": 408,
                "crawl_status": "Request Timeout (>12s)",
                "title": "",
                "h1": "",
                "h2_list": [],
                "meta_description": "",
                "canonical_url": "",
                "word_count": 0,
                "internal_links": [],
                "external_links": [],
                "internal_links_count": 0,
                "external_links_count": 0,
                "images_count": 0,
                "images_without_alt": 0,
                "load_time_ms": 12000,
                "content_length": 0,
                "headers": {},
                "html": ""
            }
        except requests.exceptions.SSLError as e:
            return {
                "url": url,
                "status_code": 495,
                "crawl_status": f"SSL Certificate Error: {str(e)[:100]}",
                "title": "",
                "h1": "",
                "h2_list": [],
                "meta_description": "",
                "canonical_url": "",
                "word_count": 0,
                "internal_links": [],
                "external_links": [],
                "internal_links_count": 0,
                "external_links_count": 0,
                "images_count": 0,
                "images_without_alt": 0,
                "load_time_ms": 0,
                "content_length": 0,
                "headers": {},
                "html": ""
            }
        except Exception as e:
            return {
                "url": url,
                "status_code": 500,
                "crawl_status": f"Failed: {str(e)[:100]}",
                "title": "",
                "h1": "",
                "h2_list": [],
                "meta_description": "",
                "canonical_url": "",
                "word_count": 0,
                "internal_links": [],
                "external_links": [],
                "internal_links_count": 0,
                "external_links_count": 0,
                "images_count": 0,
                "images_without_alt": 0,
                "load_time_ms": 0,
                "content_length": 0,
                "headers": {},
                "html": ""
            }
