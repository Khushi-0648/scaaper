from bs4 import BeautifulSoup
from typing import List, Dict, Any
import re

def analyze_performance(crawl_data: Dict[str, Any]) -> Dict[str, Any]:
    pages = crawl_data.get("pages", [])
    if not pages:
        return {
            "score": 0,
            "grade": "F",
            "load_time_ms": 0,
            "page_size_kb": 0,
            "metrics": {},
            "issues": []
        }

    main_page = pages[0]
    load_time = main_page.get("load_time_ms", 0)
    content_length = main_page.get("content_length", 0)
    page_size_kb = round(content_length / 1024, 1)
    headers = main_page.get("headers", {})
    headers_lower = {k.lower(): str(v) for k, v in headers.items()}
    html = main_page.get("html", "")
    soup = BeautifulSoup(html, "lxml")

    # Resource counts
    scripts = soup.find_all("script")
    external_scripts = [s for s in scripts if s.get("src")]
    head_render_blocking_scripts = []
    head = soup.find("head")
    if head:
        for s in head.find_all("script", src=True):
            if not s.get("async") and not s.get("defer") and s.get("type") != "module":
                head_render_blocking_scripts.append(s["src"][:60])

    stylesheets = soup.find_all("link", rel=lambda val: val and "stylesheet" in val.lower())
    images = soup.find_all("img")

    compression = headers_lower.get("content-encoding", "none").lower()
    is_compressed = any(c in compression for c in ["gzip", "br", "deflate", "zstd"])

    cache_control = headers_lower.get("cache-control", "")
    has_cache = "max-age" in cache_control or "public" in cache_control or "etag" in headers_lower

    score = 100
    issues = []

    # 1. Response Time Check
    if load_time > 2500:
        score -= 25
        issues.append({
            "metric": "Response Time (TTFB)",
            "value": f"{load_time} ms",
            "status": "Poor",
            "severity": "High",
            "recommendation": "Server response time exceeds 2.5s. Optimize backend database queries, enable server-side caching, or deploy edge CDN."
        })
    elif load_time > 1200:
        score -= 12
        issues.append({
            "metric": "Response Time (TTFB)",
            "value": f"{load_time} ms",
            "status": "Needs Improvement",
            "severity": "Medium",
            "recommendation": "Target under 800ms TTFB for optimal user perception and SEO indexing."
        })
    else:
        issues.append({
            "metric": "Response Time (TTFB)",
            "value": f"{load_time} ms",
            "status": "Good",
            "severity": "Info",
            "recommendation": "Fast server response time."
        })

    # 2. HTML Payload Size Check
    if page_size_kb > 500:
        score -= 18
        issues.append({
            "metric": "Initial HTML Size",
            "value": f"{page_size_kb} KB",
            "status": "Poor",
            "severity": "High",
            "recommendation": "HTML document exceeds 500 KB. Avoid inlining excessive base64 assets or large client state."
        })
    elif page_size_kb > 200:
        score -= 8
        issues.append({
            "metric": "Initial HTML Size",
            "value": f"{page_size_kb} KB",
            "status": "Warning",
            "severity": "Medium",
            "recommendation": "HTML document is above 200 KB. Consider code-splitting and asset compression."
        })
    else:
        issues.append({
            "metric": "Initial HTML Size",
            "value": f"{page_size_kb} KB",
            "status": "Good",
            "severity": "Info",
            "recommendation": "HTML payload is lightweight and bandwidth-friendly."
        })

    # 3. Compression Check
    if not is_compressed:
        score -= 15
        issues.append({
            "metric": "HTTP Content Encoding",
            "value": "Uncompressed",
            "status": "Failed",
            "severity": "High",
            "recommendation": "Enable Brotli or Gzip compression on web server / reverse proxy to reduce transfer weight by up to 70%."
        })
    else:
        issues.append({
            "metric": "HTTP Content Encoding",
            "value": compression.upper(),
            "status": "Good",
            "severity": "Info",
            "recommendation": "Modern compression enabled."
        })

    # 4. Render-blocking resources
    if len(head_render_blocking_scripts) > 0:
        score -= min(15, len(head_render_blocking_scripts) * 4)
        issues.append({
            "metric": "Render-Blocking Scripts",
            "value": f"{len(head_render_blocking_scripts)} scripts",
            "status": "Warning",
            "severity": "Medium",
            "recommendation": f"Add 'defer' or 'async' to {len(head_render_blocking_scripts)} <script> tags in <head> to prevent parser blocking."
        })
    else:
        issues.append({
            "metric": "Render-Blocking Scripts",
            "value": "0 detected in <head>",
            "status": "Good",
            "severity": "Info",
            "recommendation": "No synchronous parser-blocking scripts detected in document head."
        })

    # 5. Caching Headers
    if not has_cache:
        score -= 10
        issues.append({
            "metric": "Browser Caching",
            "value": "Missing / Ephemeral",
            "status": "Warning",
            "severity": "Medium",
            "recommendation": "Set explicit Cache-Control headers with appropriate max-age and ETag validation."
        })
    else:
        issues.append({
            "metric": "Browser Caching",
            "value": cache_control[:45] if cache_control else "ETag Active",
            "status": "Good",
            "severity": "Info",
            "recommendation": "Caching headers configured."
        })

    final_score = max(0, min(100, score))
    grade = "A" if final_score >= 90 else "B" if final_score >= 75 else "C" if final_score >= 60 else "D" if final_score >= 45 else "F"

    return {
        "score": final_score,
        "grade": grade,
        "load_time_ms": load_time,
        "page_size_kb": page_size_kb,
        "metrics": {
            "load_time_ms": load_time,
            "page_size_kb": page_size_kb,
            "scripts_count": len(scripts),
            "external_scripts": len(external_scripts),
            "render_blocking_scripts": len(head_render_blocking_scripts),
            "stylesheets_count": len(stylesheets),
            "images_count": len(images),
            "compression": compression.upper() if is_compressed else "None",
            "cache_control": cache_control if cache_control else "None"
        },
        "issues": issues
    }
