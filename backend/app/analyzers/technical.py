from typing import List, Dict, Any
import re
from bs4 import BeautifulSoup

TECH_SIGNATURES = [
    {
        "name": "React",
        "category": "Frontend Framework",
        "patterns": [r"react(?:\.production|\.development)?(?:\.min)?\.js", r"_reactRoot", r"data-reactroot", r"__reactFiber"],
        "header_patterns": []
    },
    {
        "name": "Next.js",
        "category": "Frontend Framework",
        "patterns": [r"/_next/static/", r"__NEXT_DATA__", r"id=[\"']__next[\"']"],
        "header_patterns": [(r"x-powered-by", r"next\.js")]
    },
    {
        "name": "Vue.js",
        "category": "Frontend Framework",
        "patterns": [r"vue(?:\.runtime|\.min)?\.js", r"data-v-[a-f0-9]{6,8}", r"__vue__"],
        "header_patterns": []
    },
    {
        "name": "Nuxt.js",
        "category": "Frontend Framework",
        "patterns": [r"/_nuxt/", r"__NUXT__"],
        "header_patterns": []
    },
    {
        "name": "Angular",
        "category": "Frontend Framework",
        "patterns": [r"ng-version=", r"ng-app=", r"angular(?:\.min)?\.js"],
        "header_patterns": []
    },
    {
        "name": "WordPress",
        "category": "CMS",
        "patterns": [r"/wp-content/", r"/wp-includes/", r"wp-json", r"name=[\"']generator[\"'] content=[\"']WordPress"],
        "header_patterns": [(r"x-powered-by", r"wordpress")]
    },
    {
        "name": "Shopify",
        "category": "E-Commerce",
        "patterns": [r"cdn\.shopify\.com", r"Shopify\.shop", r"shopify-features"],
        "header_patterns": [(r"x-shopify-stage", r".*"), (r"x-shopid", r".*")]
    },
    {
        "name": "Laravel",
        "category": "Backend Framework",
        "patterns": [r"csrf-token", r"laravel_session"],
        "header_patterns": [(r"set-cookie", r"laravel_session"), (r"x-powered-by", r"laravel")]
    },
    {
        "name": "Django",
        "category": "Backend Framework",
        "patterns": [r"csrfmiddlewaretoken"],
        "header_patterns": [(r"set-cookie", r"csrftoken")]
    },
    {
        "name": "PHP",
        "category": "Language / Runtime",
        "patterns": [r"\.php(?:[\?#]|$)"],
        "header_patterns": [(r"x-powered-by", r"php")]
    },
    {
        "name": "Node.js / Express",
        "category": "Backend Framework",
        "patterns": [],
        "header_patterns": [(r"x-powered-by", r"express")]
    },
    {
        "name": "ASP.NET",
        "category": "Backend Framework",
        "patterns": [r"__VIEWSTATE", r"__EVENTVALIDATION"],
        "header_patterns": [(r"x-powered-by", r"asp\.net"), (r"x-aspnet-version", r".*")]
    },
    {
        "name": "Bootstrap",
        "category": "CSS Framework",
        "patterns": [r"bootstrap(?:\.min)?\.(?:css|js)", r"class=[\"'][^\"']*\b(?:col-(?:xs|sm|md|lg|xl)-\d+|btn-(?:primary|secondary|danger))\b"],
        "header_patterns": []
    },
    {
        "name": "Tailwind CSS",
        "category": "CSS Framework",
        "patterns": [r"class=[\"'][^\"']*\b(?:flex|grid|items-center|justify-between|text-gray-|bg-slate-|rounded-lg)\b"],
        "header_patterns": []
    },
    {
        "name": "Cloudflare",
        "category": "CDN / Security",
        "patterns": [r"cdnjs\.cloudflare\.com", r"challenges\.cloudflare\.com"],
        "header_patterns": [(r"server", r"cloudflare"), (r"cf-ray", r".*"), (r"cf-cache-status", r".*")]
    },
    {
        "name": "Amazon CloudFront",
        "category": "CDN",
        "patterns": [r"cloudfront\.net"],
        "header_patterns": [(r"x-amz-cf-id", r".*"), (r"via", r".*cloudfront.*")]
    },
    {
        "name": "Fastly",
        "category": "CDN",
        "patterns": [],
        "header_patterns": [(r"x-served-by", r".*cache-.*"), (r"fastly-restarts", r".*")]
    },
    {
        "name": "Google Analytics",
        "category": "Analytics",
        "patterns": [r"google-analytics\.com/(?:analytics|gtag/js)", r"gtag\(['\"]config['\"], ['\"](G|UA)-"],
        "header_patterns": []
    },
    {
        "name": "Google Tag Manager",
        "category": "Tag Manager",
        "patterns": [r"googletagmanager\.com/gtm\.js\?id=GTM-", r"GTM-[A-Z0-9]+"],
        "header_patterns": []
    },
    {
        "name": "Hotjar",
        "category": "Analytics",
        "patterns": [r"static\.hotjar\.com", r"_hjSettings"],
        "header_patterns": []
    }
]

def analyze_technical(crawl_data: Dict[str, Any]) -> Dict[str, Any]:
    pages = crawl_data.get("pages", [])
    if not pages:
        return {
            "technologies": [],
            "server_headers": {},
            "security_headers": [],
            "compression": "None",
            "caching": "None"
        }

    main_page = pages[0]
    headers = main_page.get("headers", {})
    headers_lower = {k.lower(): str(v) for k, v in headers.items()}
    html = main_page.get("html", "")

    # 1. Technology Detection
    detected_tech: List[Dict[str, Any]] = []

    for item in TECH_SIGNATURES:
        name = item["name"]
        cat = item["category"]
        found = False
        evidence = ""
        confidence = "Low"

        # Check headers
        for h_name, h_regex in item["header_patterns"]:
            if h_name in headers_lower:
                val = headers_lower[h_name]
                if re.search(h_regex, val, re.I):
                    found = True
                    evidence = f"Header '{h_name}: {val}' matches signature"
                    confidence = "High"
                    break

        # Check HTML patterns if not yet found
        if not found and item["patterns"]:
            for pat in item["patterns"]:
                match = re.search(pat, html, re.I)
                if match:
                    found = True
                    evidence = f"Source markup match: '{match.group(0)[:45]}'"
                    confidence = "High" if len(match.group(0)) > 6 else "Medium"
                    break

        if found:
            detected_tech.append({
                "technology": name,
                "category": cat,
                "detected": True,
                "evidence": evidence,
                "confidence": confidence
            })

    # 2. Security Headers Audit
    security_headers_checklist = [
        {
            "header": "Strict-Transport-Security",
            "name": "HSTS (HTTP Strict Transport Security)",
            "purpose": "Enforces HTTPS connections and prevents SSL stripping attacks.",
            "recommended": "max-age=31536000; includeSubDomains; preload"
        },
        {
            "header": "Content-Security-Policy",
            "name": "CSP (Content Security Policy)",
            "purpose": "Restricts sources of executable scripts to mitigate XSS and injection.",
            "recommended": "default-src 'self' ..."
        },
        {
            "header": "X-Frame-Options",
            "name": "Clickjacking Protection",
            "purpose": "Prevents the website from being embedded in hostile iframes.",
            "recommended": "DENY or SAMEORIGIN"
        },
        {
            "header": "X-Content-Type-Options",
            "name": "MIME-Type Sniffing Protection",
            "purpose": "Prevents browsers from interpreting files as a different MIME type.",
            "recommended": "nosniff"
        },
        {
            "header": "Referrer-Policy",
            "name": "Referrer Policy",
            "purpose": "Protects private URL parameters from leaking to external destinations.",
            "recommended": "strict-origin-when-cross-origin"
        },
        {
            "header": "Permissions-Policy",
            "name": "Browser Features Permission",
            "purpose": "Controls access to browser APIs like geolocation, microphone, and camera.",
            "recommended": "camera=(), microphone=(), geolocation=()"
        }
    ]

    security_headers_results = []
    sec_score = 100
    for sh in security_headers_checklist:
        h_key = sh["header"].lower()
        if h_key in headers_lower:
            val = headers_lower[h_key]
            security_headers_results.append({
                "header": sh["header"],
                "name": sh["name"],
                "status": "Configured",
                "value": val[:120],
                "severity": "Info",
                "details": f"Properly defined: {val[:80]}"
            })
        else:
            sec_score -= 15
            security_headers_results.append({
                "header": sh["header"],
                "name": sh["name"],
                "status": "Missing",
                "value": "Not configured",
                "severity": "Medium" if sh["header"] in ["Strict-Transport-Security", "X-Content-Type-Options"] else "Low",
                "details": f"Missing header. Recommendation: {sh['recommended']}"
            })

    # 3. Mixed Content Check (Passive audit on HTTPS pages)
    base_url = crawl_data.get("base_url", "")
    is_https = base_url.startswith("https://")
    mixed_content_items = []
    if is_https and html:
        soup = BeautifulSoup(html, "lxml")
        # Check insecure images, scripts, styles, iframes
        for tag, attr in [("img", "src"), ("script", "src"), ("link", "href"), ("iframe", "src")]:
            for el in soup.find_all(tag):
                src_val = el.get(attr, "")
                if src_val.startswith("http://"):
                    mixed_content_items.append({
                        "tag": tag,
                        "resource": src_val[:100],
                        "type": "Insecure HTTP resource on HTTPS site"
                    })
        if mixed_content_items:
            sec_score -= 20

    # 4. Cookie Security Attributes Check
    cookie_headers = [v for k, v in headers.items() if k.lower() == "set-cookie"]
    cookie_audit = []
    for c_val in cookie_headers:
        c_lower = c_val.lower()
        has_secure = "secure" in c_lower
        has_httponly = "httponly" in c_lower
        has_samesite = "samesite" in c_lower
        c_name = c_val.split("=")[0].strip() if "=" in c_val else "Cookie"
        cookie_audit.append({
            "cookie": c_name[:40],
            "secure": has_secure,
            "httponly": has_httponly,
            "samesite": has_samesite,
            "status": "Hardened" if (has_secure and has_httponly) else "Needs Hardening"
        })
        if not has_secure or not has_httponly:
            sec_score -= 5

    # 5. Server Information Disclosure
    server_info = headers_lower.get("server", "Hidden / Not Disclosed")
    x_powered = headers_lower.get("x-powered-by", None)
    disclosures = []
    if server_info != "Hidden / Not Disclosed" and re.search(r"\d+\.\d+", server_info):
        disclosures.append(f"Server header exposes version: {server_info}")
        sec_score -= 5
    if x_powered and re.search(r"\d+\.\d+", x_powered):
        disclosures.append(f"X-Powered-By exposes version: {x_powered}")
        sec_score -= 5

    # Compression check
    content_encoding = headers_lower.get("content-encoding", "None")
    # Caching check
    cache_control = headers_lower.get("cache-control", headers_lower.get("pragma", "None"))

    return {
        "technologies": detected_tech,
        "security_headers": security_headers_results,
        "security_score": max(10, min(100, sec_score)),
        "is_https": is_https,
        "mixed_content": mixed_content_items[:10],
        "cookie_security": cookie_audit,
        "server_disclosures": disclosures,
        "server": server_info,
        "content_type": headers_lower.get("content-type", "Unknown"),
        "compression": content_encoding,
        "caching": cache_control,
        "all_headers": {k: v for k, v in headers.items() if not k.lower().startswith("set-cookie")}
    }
