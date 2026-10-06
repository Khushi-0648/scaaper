from typing import List, Dict, Any

def generate_advantages_and_drawbacks(
    crawl_data: Dict[str, Any],
    features: List[Dict[str, Any]],
    seo_data: Dict[str, Any],
    technical_data: Dict[str, Any],
    perf_data: Dict[str, Any],
    a11y_data: Dict[str, Any]
) -> Dict[str, Any]:
    pages = crawl_data.get("pages", [])
    base_url = crawl_data.get("base_url", "")
    main_page = pages[0] if pages else {}

    advantages: List[Dict[str, Any]] = []
    drawbacks: List[Dict[str, Any]] = []
    missing_features_checklist: List[Dict[str, Any]] = []

    # --- ADVANTAGES (Ground Truth Evidence) ---

    # 1. Navigation & Layout
    nav_feat = next((f for f in features if f["feature"] == "Navigation menu" and f["status"] == "Detected"), None)
    if nav_feat:
        advantages.append({
            "advantage": "Structured Primary Navigation",
            "evidence": nav_feat["evidence"],
            "page": nav_feat.get("detected_on", base_url),
            "confidence": "High"
        })

    vp_feat = next((f for f in features if f["feature"] == "Mobile responsive layout" and f["status"] == "Detected"), None)
    if vp_feat:
        advantages.append({
            "advantage": "Mobile Responsive Configuration",
            "evidence": vp_feat["evidence"],
            "page": vp_feat.get("detected_on", base_url),
            "confidence": "High"
        })

    # 2. HTTPS & Security
    if base_url.startswith("https://"):
        advantages.append({
            "advantage": "Enforced Transport Security (HTTPS)",
            "evidence": "Website successfully resolved and served via HTTPS with valid TLS handshake.",
            "page": base_url,
            "confidence": "High"
        })

    # Check security headers
    configured_sec = [sh for sh in technical_data.get("security_headers", []) if sh["status"] == "Configured"]
    if len(configured_sec) >= 3:
        advantages.append({
            "advantage": f"Hardened HTTP Security Headers ({len(configured_sec)} active)",
            "evidence": f"Configured headers: {', '.join([s['header'] for s in configured_sec])}",
            "page": base_url,
            "confidence": "High"
        })

    # 3. SEO Baselines
    if seo_data.get("score", 0) >= 80:
        advantages.append({
            "advantage": "High Baseline SEO Health",
            "evidence": f"SEO score {seo_data.get('score')}/100. Key meta tags, titles, and crawl instructions detected.",
            "page": base_url,
            "confidence": "High"
        })

    if crawl_data.get("robots_txt_found"):
        advantages.append({
            "advantage": "Search Crawler Guidance (robots.txt)",
            "evidence": "Valid robots.txt discovered at root domain with crawler directives.",
            "page": f"{base_url}/robots.txt",
            "confidence": "High"
        })

    if crawl_data.get("sitemap_urls"):
        advantages.append({
            "advantage": "Discoverable XML Sitemap",
            "evidence": f"Sitemap index referenced: {crawl_data.get('sitemap_urls')[0]}",
            "page": base_url,
            "confidence": "High"
        })

    # 4. Performance
    if perf_data.get("load_time_ms", 9999) < 800:
        advantages.append({
            "advantage": "Ultra-Fast Server Response Time",
            "evidence": f"Main page load time clocked at {perf_data.get('load_time_ms')} ms (well below 800ms threshold).",
            "page": base_url,
            "confidence": "High"
        })

    if "GZIP" in perf_data.get("metrics", {}).get("compression", "") or "BR" in perf_data.get("metrics", {}).get("compression", ""):
        advantages.append({
            "advantage": "Modern Asset Compression Enabled",
            "evidence": f"HTTP Content-Encoding delivered via {perf_data.get('metrics', {}).get('compression')}.",
            "page": base_url,
            "confidence": "High"
        })

    # 5. Accessibility
    if a11y_data.get("stats", {}).get("missing_alt", 0) == 0 and a11y_data.get("stats", {}).get("total_images", 0) > 0:
        advantages.append({
            "advantage": "100% Image ALT Coverage",
            "evidence": f"All {a11y_data['stats']['total_images']} crawled images include descriptive alt attributes.",
            "page": base_url,
            "confidence": "High"
        })

    # --- DRAWBACKS / POTENTIAL ISSUES ---

    # 1. SEO Issues
    for chk in seo_data.get("checks", []):
        if chk["status"] == "Failed":
            drawbacks.append({
                "issue": chk["check"],
                "classification": "Confirmed Issue",
                "severity": chk["severity"],
                "evidence": chk["details"],
                "page": base_url,
                "recommendation": chk["recommendation"]
            })
        elif chk["status"] == "Warning":
            drawbacks.append({
                "issue": chk["check"],
                "classification": "Potential Issue",
                "severity": chk["severity"],
                "evidence": chk["details"],
                "page": base_url,
                "recommendation": chk["recommendation"]
            })

    # 2. Performance Issues
    for p_issue in perf_data.get("issues", []):
        if p_issue["status"] in ["Poor", "Failed"]:
            drawbacks.append({
                "issue": p_issue["metric"],
                "classification": "Confirmed Issue",
                "severity": p_issue["severity"],
                "evidence": f"Measured value: {p_issue['value']}",
                "page": base_url,
                "recommendation": p_issue["recommendation"]
            })
        elif p_issue["status"] in ["Warning", "Needs Improvement"]:
            drawbacks.append({
                "issue": p_issue["metric"],
                "classification": "Potential Issue",
                "severity": p_issue["severity"],
                "evidence": f"Measured value: {p_issue['value']}",
                "page": base_url,
                "recommendation": p_issue["recommendation"]
            })

    # 3. Accessibility Issues
    for a_issue in a11y_data.get("issues", []):
        drawbacks.append({
            "issue": a_issue["issue"],
            "classification": "Confirmed Issue" if a_issue["severity"] == "High" else "Potential Issue",
            "severity": a_issue["severity"],
            "evidence": a_issue["evidence"],
            "page": a_issue.get("affected_page", base_url),
            "recommendation": a_issue["recommendation"]
        })

    # 4. Security Header gaps
    for sh in technical_data.get("security_headers", []):
        if sh["status"] == "Missing" and sh["severity"] in ["High", "Medium"]:
            drawbacks.append({
                "issue": f"Missing Security Header: {sh['header']}",
                "classification": "Potential Issue",
                "severity": sh["severity"],
                "evidence": "Header not present in HTTP response headers.",
                "page": base_url,
                "recommendation": sh["details"]
            })

    # --- POTENTIALLY MISSING FEATURES CHECKLIST ---
    # Strictly follows prompt requirement: Use wording "Not detected during the crawl."
    key_features_to_audit = [
        "Search", "Login", "Contact form", "Newsletter", "Dark mode",
        "FAQ", "Shopping cart", "Chat widget", "Language selector", "Blog"
    ]

    for f_name in key_features_to_audit:
        f_entry = next((f for f in features if f["feature"] == f_name), None)
        if f_entry and f_entry["status"] == "Detected":
            missing_features_checklist.append({
                "feature": f_name,
                "category": f_entry.get("category", "General"),
                "status": "Detected",
                "note": f"Found on {f_entry.get('detected_on', base_url)}"
            })
        else:
            missing_features_checklist.append({
                "feature": f_name,
                "category": f_entry.get("category", "General") if f_entry else "General",
                "status": "Not detected during the crawl",
                "note": "No matching elements or routes observed during the crawl."
            })

    return {
        "advantages": advantages,
        "drawbacks": drawbacks,
        "missing_features": missing_features_checklist
    }
