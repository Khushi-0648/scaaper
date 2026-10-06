import requests
from typing import List, Dict, Any

def detect_broken_links(pages: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Detect broken internal and external links across crawled pages.

    Args:
        pages: List of page dictionaries from the crawler. Expected to contain
            'url', 'internal_links', and 'external_links' keys where the link
            values are absolute URLs (strings).

    Returns:
        A dictionary with overall counts and per‑page breakdown:
        {
            "total_broken": int,
            "broken_internal": List[str],
            "broken_external": List[str],
            "per_page": {
                "<page_url>": {
                    "broken_internal": List[str],
                    "broken_external": List[str]
                }, ...
            }
        }
    """
    timeout = 5  # seconds
    headers = {"User-Agent": "WebsiteAnalyzerBot/1.0"}
    broken_internal: List[str] = []
    broken_external: List[str] = []
    per_page: Dict[str, Dict[str, List[str]]] = {}

    for page in pages:
        page_url = page.get("url", "")
        per_page[page_url] = {"broken_internal": [], "broken_external": []}
        for link_type in ("internal_links", "external_links"):
            links = page.get(link_type, []) or []
            for link in links:
                try:
                    # Use HEAD first; fall back to GET if HEAD not allowed.
                    resp = requests.head(link, timeout=timeout, headers=headers, allow_redirects=True)
                    if resp.status_code >= 400:
                        # Some servers reject HEAD; try GET.
                        resp = requests.get(link, timeout=timeout, headers=headers, allow_redirects=True)
                except Exception:
                    resp = None
                if not resp or resp.status_code >= 400:
                    if link_type == "internal_links":
                        broken_internal.append(link)
                        per_page[page_url]["broken_internal"].append(link)
                    else:
                        broken_external.append(link)
                        per_page[page_url]["broken_external"].append(link)
    total_broken = len(broken_internal) + len(broken_external)
    return {
        "total_broken": total_broken,
        "broken_internal": broken_internal,
        "broken_external": broken_external,
        "per_page": per_page,
    }
