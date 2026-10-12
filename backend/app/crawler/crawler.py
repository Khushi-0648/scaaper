import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, urldefrag
from urllib.robotparser import RobotFileParser
from typing import List, Dict, Any, Callable, Optional, Set
import re

DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 WebIntelBot/2.0"
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
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
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
        self.security_shield_detected: bool = False
        self.security_shield_details: Dict[str, Any] = {}

    def check_robots_txt(self):
        robots_url = urljoin(self.base_url, "/robots.txt")
        try:
            resp = self.session.get(robots_url, timeout=6)
            if resp.status_code == 200 and "text" in resp.headers.get("Content-Type", ""):
                self.robots_txt_found = True
                self.robots_txt_content = resp.text[:10000]
                self.robot_parser = RobotFileParser()
                self.robot_parser.parse(resp.text.splitlines())
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
        path = parsed.path if parsed.path else "/"
        return f"{parsed.scheme}://{parsed.netloc.lower()}{path}" + (f"?{parsed.query}" if parsed.query else "")

    def _detect_security_shield(self, resp_headers: Dict[str, str], html_text: str, status_code: int) -> Optional[Dict[str, Any]]:
        """
        Detects if the website is protected by Enterprise Security Shield, WAF, Bot Management, or Cloudflare Challenge.
        """
        headers_lower = {k.lower(): str(v).lower() for k, v in resp_headers.items()}
        html_lower = html_text.lower()
        
        provider = None
        reasons = []

        # Cloudflare detection
        if "cf-ray" in headers_lower or "cloudflare" in headers_lower.get("server", "") or "cf-cache-status" in headers_lower:
            provider = "Cloudflare Enterprise Security & Bot Defense"
            reasons.append("Cloudflare Edge Network & WAF Shield active")
            if "challenges.cloudflare.com" in html_lower or "turnstile" in html_lower or status_code in (403, 503):
                reasons.append("Cloudflare Managed Challenge / Bot Defense triggered")

        # AWS CloudFront WAF
        elif "x-amz-cf-id" in headers_lower or "cloudfront" in headers_lower.get("via", ""):
            provider = "AWS CloudFront WAF & Shield"
            reasons.append("AWS CloudFront Enterprise Protection active")
            if status_code in (403, 503):
                reasons.append("AWS WAF Rule Block / Access Intercepted")

        # Akamai
        elif "x-akamai-transformed" in headers_lower or "akamaighost" in headers_lower.get("server", ""):
            provider = "Akamai Enterprise Edge & Bot Shield"
            reasons.append("Akamai Enterprise Edge Shield active")

        # Imperva / Incapsula
        elif "x-iinfo" in headers_lower or "incap_ses" in headers_lower.get("set-cookie", ""):
            provider = "Imperva Incapsula Enterprise Shield"
            reasons.append("Imperva Incapsula WAF Shield active")

        # Sucuri
        elif "x-sucuri-id" in headers_lower or "x-sucuri-block" in headers_lower:
            provider = "Sucuri WebSite Firewall (WAF)"
            reasons.append("Sucuri Cloud WAF active")

        # Generic 403/401 WAF Protection with security title
        elif status_code in (403, 401, 503):
            if any(term in html_lower for term in ["access denied", "just a moment...", "security check", "ddos protection", "firewall", "blocked"]):
                provider = "Enterprise Web Application Firewall (WAF)"
                reasons.append(f"HTTP {status_code} Access Denied by Server Security Rule")

        if provider or status_code in (403, 503):
            provider = provider or "Enterprise Web Security Shield"
            return {
                "is_protected": True,
                "provider": provider,
                "status_code": status_code,
                "reasons": reasons if reasons else [f"HTTP {status_code} Enterprise Protection Active"],
                "has_hsts": "strict-transport-security" in headers_lower,
                "has_csp": "content-security-policy" in headers_lower,
                "server": resp_headers.get("Server", "Protected Edge Gateway"),
                "cf_ray": resp_headers.get("CF-RAY", "")
            }
        return None

    def crawl(self, progress_callback: Optional[Callable[[int, str, str], None]] = None) -> Dict[str, Any]:
        start_time = time.time()
        
        if progress_callback:
            progress_callback(10, "Validating robots.txt and sitemap", f"Checking robots.txt for {self.domain}")
        
        self.check_robots_txt()

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
                })
                continue

            page_data = self._fetch_and_parse_page(current_url)
            self.discovered_pages.append(page_data)

            if page_data.get("security_shield"):
                self.security_shield_detected = True
                self.security_shield_details = page_data["security_shield"]

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
                        if any(c in link.lower() for c in ["contact", "about", "support", "help", "reach"]):
                            queue.insert(0, link)
                        else:
                            queue.append(link)

            for ext in page_data.get("external_links", []):
                self.all_external_links.add(ext)

            if self.options.crawl_delay > 0 and queue:
                time.sleep(self.options.crawl_delay)

        # Proactively check common contact endpoints if only 1 page crawled and no contact page was discovered
        if len(self.discovered_pages) < self.options.max_pages:
            contact_probes = ["/contact", "/contact-us", "/about-us", "/about"]
            for cp in contact_probes:
                probe_url = urljoin(self.base_url, cp)
                if probe_url not in self.visited_urls and len(self.discovered_pages) < self.options.max_pages:
                    self.visited_urls.add(probe_url)
                    try:
                        p_data = self._fetch_and_parse_page(probe_url)
                        if p_data.get("status_code") == 200:
                            self.discovered_pages.append(p_data)
                    except Exception:
                        pass

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
            "domain": self.domain,
            "security_shield_detected": self.security_shield_detected,
            "security_shield_details": self.security_shield_details
        }

    def _fetch_and_parse_page(self, url: str) -> Dict[str, Any]:
        fetch_start = time.time()
        try:
            resp = self.session.get(url, timeout=12, stream=True, allow_redirects=True)
            elapsed_ms = round((time.time() - fetch_start) * 1000, 1)

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

            # Check for Security Shield / WAF
            sec_shield = self._detect_security_shield(resp.headers, html_text, resp.status_code)

            soup = BeautifulSoup(html_text, "lxml")

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

            body = soup.find("body")
            body_text = body.get_text(" ", strip=True) if body else ""
            words = [w for w in body_text.split() if len(w) > 1]
            word_count = len(words)

            img_tags = soup.find_all("img")
            images_count = len(img_tags)
            images_without_alt = sum(1 for img in img_tags if not img.get("alt") or not img.get("alt").strip())

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

            internal_links = list(set(internal_links))
            external_links = list(set(external_links))

            crawl_status = "Success"
            if resp.status_code == 403:
                crawl_status = "Protected / HTTP 403 (Enterprise Security)"
            elif resp.status_code == 503:
                crawl_status = "Protected / HTTP 503 (WAF Challenge)"
            elif resp.status_code >= 400:
                crawl_status = f"HTTP {resp.status_code}"

            return {
                "url": url,
                "status_code": resp.status_code,
                "crawl_status": crawl_status,
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
                "html": html_text[:150000],
                "security_shield": sec_shield
            }

        except requests.exceptions.SSLError as e:
            return {
                "url": url,
                "status_code": 495,
                "crawl_status": f"SSL Certificate Verification: {str(e)[:100]}",
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
                "html": "",
                "security_shield": {
                    "is_protected": True,
                    "provider": "Strict SSL / TLS Certificate Policy",
                    "status_code": 495,
                    "reasons": ["Strict SSL Handshake / Custom Certificate Authority"],
                    "has_hsts": True,
                    "has_csp": False,
                    "server": "Encrypted TLS Gateway"
                }
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
                "html": "",
                "security_shield": None
            }
        except Exception as e:
            return {
                "url": url,
                "status_code": 500,
                "crawl_status": f"Network Response: {str(e)[:100]}",
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
                "html": "",
                "security_shield": None
            }
