from typing import List, Dict, Any

def generate_opportunity_signals(
    business: Dict[str, Any],
    website_analysis: Dict[str, Any] = None
) -> List[Dict[str, Any]]:
    """
    Identifies high-value digital opportunity signals for a business.
    Clearly labeled as 'Opportunity Signals', not guaranteed sales leads.
    """
    signals = []

    # 1. Business Presence Signals
    website_url = business.get("website")
    if not website_url:
        signals.append({
            "category": "Web Presence",
            "signal": "Business has no public website",
            "severity": "HIGH",
            "priority": "HIGH",
            "evidence": "No website URL declared on public business directories or search listings",
            "recommendation": "High-value candidate for modern website development, digital ordering, and custom domain setup."
        })

    phone = business.get("phone")
    if not phone:
        signals.append({
            "category": "Lead Capture",
            "signal": "Missing direct telephone contact",
            "severity": "MEDIUM",
            "priority": "MEDIUM",
            "evidence": "No phone number available on public directory profile",
            "recommendation": "Configure direct click-to-call or WhatsApp business contact integration."
        })

    # 2. Website Analysis Signals (if website has been audited)
    if website_analysis:
        seo_score = website_analysis.get("seo", {}).get("score", 100)
        perf_score = website_analysis.get("performance", {}).get("score", 100)
        a11y_score = website_analysis.get("accessibility", {}).get("score", 100)
        sec_score = website_analysis.get("technical", {}).get("security_score", 100)
        summary = website_analysis.get("summary", {})
        
        # SEO
        if seo_score < 60:
            signals.append({
                "category": "SEO",
                "signal": f"Low SEO Score ({seo_score}/100)",
                "severity": "HIGH",
                "priority": "HIGH",
                "evidence": f"Audited SEO health evaluated at {seo_score}/100 with deficiencies in meta descriptions and heading structure",
                "recommendation": "Complete on-page SEO overhaul to rank for high-intent local search queries."
            })
            
        # Performance
        if perf_score < 60:
            signals.append({
                "category": "Performance",
                "signal": f"Poor Page Performance ({perf_score}/100)",
                "severity": "HIGH",
                "priority": "HIGH",
                "evidence": f"Response latency clocked at {summary.get('load_time_ms', 0)}ms with unoptimized assets",
                "recommendation": "Implement modern compression, CDN caching, and Core Web Vitals remediation."
            })
            
        # Accessibility
        missing_alts = 0
        pages = website_analysis.get("pages", [])
        if pages:
            missing_alts = pages[0].get("images_without_alt", 0)
        if missing_alts > 5 or a11y_score < 65:
            signals.append({
                "category": "Accessibility",
                "signal": f"Accessibility Deficiencies ({missing_alts} images missing ALT)",
                "severity": "MEDIUM",
                "priority": "MEDIUM",
                "evidence": f"{missing_alts} informative images lack alternative text on primary layout",
                "recommendation": "Remediate image descriptions and form labels to satisfy WCAG 2.1 compliance."
            })
            
        # Security
        is_https = summary.get("is_https", True)
        if not is_https:
            signals.append({
                "category": "Security",
                "signal": "Website does NOT enforce HTTPS",
                "severity": "HIGH",
                "priority": "HIGH",
                "evidence": "Website serves content over unencrypted plain HTTP",
                "recommendation": "Deploy TLS/SSL certificate immediately to protect user data and eliminate browser warnings."
            })
        elif sec_score < 60:
            signals.append({
                "category": "Security",
                "signal": "Missing Critical Security Headers",
                "severity": "MEDIUM",
                "priority": "MEDIUM",
                "evidence": f"Security score evaluated at {sec_score}/100 with HSTS or CSP missing",
                "recommendation": "Harden server configuration with HSTS, X-Frame-Options, and Content-Security-Policy."
            })
            
        # Missing conversion features
        features = website_analysis.get("features", [])
        detected_feats = {f["feature"] for f in features if f.get("status") == "Detected"}
        if "Contact form" not in detected_feats and "Call to Action button" not in detected_feats:
            signals.append({
                "category": "Conversion",
                "signal": "No direct lead capture or contact form detected",
                "severity": "MEDIUM",
                "priority": "MEDIUM",
                "evidence": "No interactive contact form or call-to-action button found in page markup",
                "recommendation": "Add a modern interactive lead capture funnel to boost website inquiries."
            })

    return signals
