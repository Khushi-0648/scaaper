import requests
from typing import List, Dict, Any, Set
from concurrent.futures import ThreadPoolExecutor, as_completed

def detect_broken_links(pages: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Detect broken internal and external links across crawled pages.
    Uses concurrent workers, link deduplication, and sensible sampling
    to prevent crawl stall or rate-limit timeouts.
    """
    timeout = 2.5
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WebsiteAnalyzer/2.0"}
    broken_internal: List[str] = []
    broken_external: List[str] = []
    per_page: Dict[str, Dict[str, List[str]]] = {}

    internal_candidates: Set[str] = set()
    external_candidates: Set[str] = set()

    for page in pages:
        p_url = page.get("url", "")
        per_page[p_url] = {"broken_internal": [], "broken_external": []}
        for l in (page.get("internal_links", []) or []):
            if l and isinstance(l, str) and l.startswith(("http://", "https://")):
                internal_candidates.add(l)
        for l in (page.get("external_links", []) or []):
            if l and isinstance(l, str) and l.startswith(("http://", "https://")):
                external_candidates.add(l)

    # Sample up to 25 unique internal and 15 unique external links to audit
    chosen_internal = list(internal_candidates)[:25]
    chosen_external = list(external_candidates)[:15]
    all_links_to_test = list(set(chosen_internal + chosen_external))

    status_cache: Dict[str, bool] = {}

    def test_single_link(url: str):
        try:
            resp = requests.head(url, timeout=timeout, headers=headers, allow_redirects=True)
            if resp.status_code in (405, 403, 501):
                resp = requests.get(url, timeout=timeout, headers=headers, stream=True, allow_redirects=True)
            return url, (resp.status_code < 400)
        except Exception:
            return url, False

    if all_links_to_test:
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(test_single_link, u) for u in all_links_to_test]
            for f in as_completed(futures):
                try:
                    target_url, is_ok = f.result()
                    status_cache[target_url] = is_ok
                except Exception:
                    pass

    for u in chosen_internal:
        if status_cache.get(u) is False:
            broken_internal.append(u)

    for u in chosen_external:
        if status_cache.get(u) is False:
            broken_external.append(u)

    for page in pages:
        p_url = page.get("url", "")
        for l in (page.get("internal_links", []) or []):
            if l in status_cache and status_cache[l] is False:
                if l not in per_page[p_url]["broken_internal"]:
                    per_page[p_url]["broken_internal"].append(l)
        for l in (page.get("external_links", []) or []):
            if l in status_cache and status_cache[l] is False:
                if l not in per_page[p_url]["broken_external"]:
                    per_page[p_url]["broken_external"].append(l)

    total_broken = len(broken_internal) + len(broken_external)
    return {
        "total_broken": total_broken,
        "broken_internal": broken_internal,
        "broken_external": broken_external,
        "per_page": per_page,
    }

