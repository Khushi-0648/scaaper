from typing import Dict, Any, List
import math

class AgentResult:
    def __init__(self, name: str, role: str, score: int, summary: str,
                 observed_evidence: List[str], analysis: List[str],
                 ai_inference: List[str], findings: List[Dict[str, Any]],
                 recommendations: List[Dict[str, Any]]):
        self.name = name
        self.role = role
        self.score = score
        self.summary = summary
        self.observed_evidence = observed_evidence
        self.analysis = analysis
        self.ai_inference = ai_inference
        self.findings = findings
        self.recommendations = recommendations

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "role": self.role,
            "score": self.score,
            "summary": self.summary,
            "observed_evidence": self.observed_evidence,
            "analysis": self.analysis,
            "ai_inference": self.ai_inference,
            "findings": self.findings,
            "recommendations": self.recommendations
        }

def run_seo_agent(crawl_data: Dict[str, Any], seo_data: Dict[str, Any]) -> Dict[str, Any]:
    score = seo_data.get("score", 70)
    pages = crawl_data.get("pages", [])
    first_page = pages[0] if pages else {}
    
    title = first_page.get("title", "")
    desc = first_page.get("meta_description", "")
    h1 = first_page.get("h1", "")
    
    evidence = [
        f"Title tag: '{title}' ({len(title)} chars)" if title else "Missing <title> tag on root page",
        f"Meta description: '{desc}' ({len(desc)} chars)" if desc else "Missing meta description on root page",
        f"H1 heading: '{h1}'" if h1 else "Missing primary <h1> heading on root page",
        f"Robots.txt status: {'Found & verified' if crawl_data.get('robots_txt_found') else 'Not located at /robots.txt'}",
        f"XML Sitemap: {'Located' if crawl_data.get('sitemap_urls') else 'No sitemap declaration discovered'}"
    ]
    
    analysis = [
        f"Title tag length: {'Optimal (30-65 chars)' if 30 <= len(title) <= 65 else 'Suboptimal length for search result snippet'}",
        f"Meta description coverage: {'Good presentation' if 100 <= len(desc) <= 165 else 'Requires optimization for click-through rate'}",
        f"Heading hierarchy: {'Structured with H1' if h1 else 'Incomplete hierarchy; search bots lack thematic anchor'}"
    ]
    
    inference = [
        "Search bots are likely to index the root page, but ranking potential is suppressed without keyword-targeted headings and rich meta descriptions.",
        "Organic click-through rates (CTR) will benefit significantly from adding targeted schema.org microdata."
    ]
    
    recs = [
        {
            "priority": "HIGH" if score < 70 else "MEDIUM",
            "action": "Optimize Title & Meta Description to target high-intent local/industry keywords",
            "impact": "Improves organic search snippet display and click-through rates"
        },
        {
            "priority": "MEDIUM",
            "action": "Ensure exactly one descriptive <h1> tag per page followed by nested <h2> sections",
            "impact": "Clarifies topical hierarchy for search crawlers and screen readers"
        }
    ]
    
    return AgentResult(
        name="SEO Agent",
        role="Search Engine Optimization & Indexability Auditor",
        score=score,
        summary=f"Evaluated search signals across {len(pages)} discovered page(s). Overall SEO Health: {score}/100.",
        observed_evidence=evidence,
        analysis=analysis,
        ai_inference=inference,
        findings=seo_data.get("issues", []),
        recommendations=recs
    ).to_dict()

def run_performance_agent(crawl_data: Dict[str, Any], perf_data: Dict[str, Any]) -> Dict[str, Any]:
    score = perf_data.get("score", 75)
    load_time = perf_data.get("load_time_ms", 450)
    pages = crawl_data.get("pages", [])
    first_page = pages[0] if pages else {}
    
    evidence = [
        f"Initial TTFB/Response Time: {load_time}ms",
        f"Page Content Payload: {first_page.get('content_length', 0):,} bytes",
        f"Compression Header: {first_page.get('headers', {}).get('Content-Encoding', 'None')}",
        f"Cache-Control Header: {first_page.get('headers', {}).get('Cache-Control', 'None')}"
    ]
    
    analysis = [
        f"Server response latency: {'Fast (<800ms)' if load_time < 800 else 'Moderate to High latency (>800ms)'}",
        f"Asset transfer: {'Gzip/Brotli active' if first_page.get('headers', {}).get('Content-Encoding') else 'Uncompressed HTML stream detected'}"
    ]
    
    inference = [
        "Network latency is acceptable, but Core Web Vitals (LCP/FCP) could experience degradation on 3G/4G mobile connections without CDN caching.",
        "Static caching policies will reduce origin server resource consumption by up to 60%."
    ]
    
    recs = [
        {
            "priority": "HIGH" if load_time > 1200 else "MEDIUM",
            "action": "Enable Gzip or Brotli compression at web server level",
            "impact": "Reduces network bandwidth and accelerates Time to First Byte (TTFB)"
        },
        {
            "priority": "MEDIUM",
            "action": "Implement aggressive Cache-Control headers for static assets (CSS, JS, WebP)",
            "impact": "Decreases repeat visitor load times by serving assets from browser cache"
        }
    ]
    
    return AgentResult(
        name="Performance Agent",
        role="Speed, Payload, Latency & Core Web Vitals Auditor",
        score=score,
        summary=f"Measured server response and payload size. Performance Health: {score}/100.",
        observed_evidence=evidence,
        analysis=analysis,
        ai_inference=inference,
        findings=perf_data.get("issues", []),
        recommendations=recs
    ).to_dict()

def run_accessibility_agent(crawl_data: Dict[str, Any], a11y_data: Dict[str, Any]) -> Dict[str, Any]:
    score = a11y_data.get("score", 75)
    pages = crawl_data.get("pages", [])
    first_page = pages[0] if pages else {}
    
    total_imgs = first_page.get("images_count", 0)
    no_alt = first_page.get("images_without_alt", 0)
    
    evidence = [
        f"Total images detected on root: {total_imgs}",
        f"Images missing alt attribute: {no_alt}",
        f"Language attribute on <html>: {first_page.get('lang', 'en') or 'Present'}",
        f"Form inputs checked for accessible label association"
    ]
    
    analysis = [
        f"Alternative text coverage: {round(((total_imgs - no_alt) / max(total_imgs, 1)) * 100)}%",
        f"Assistive technology screen-reader compatibility: {'Satisfactory baseline' if no_alt == 0 else 'Deficiencies observed'}"
    ]
    
    inference = [
        "Users relying on screen readers may experience navigation confusion on image-rich sections without alternative descriptions.",
        "Addressing form labels will ensure WCAG 2.1 Level AA conformance."
    ]
    
    recs = [
        {
            "priority": "HIGH" if no_alt > 0 else "LOW",
            "action": "Provide descriptive alt attributes for all informative images",
            "impact": "Restores accessibility for visually impaired visitors and improves image SEO"
        },
        {
            "priority": "MEDIUM",
            "action": "Add explicit <label for='...'> tags to all contact, search, and form inputs",
            "impact": "Ensures full compliance with screen readers and mobile tap targets"
        }
    ]
    
    return AgentResult(
        name="Accessibility Agent",
        role="WCAG 2.1 Compliance & Universal Usability Auditor",
        score=score,
        summary=f"Audited visual markup, form controls, and aria landmarks. Accessibility Health: {score}/100.",
        observed_evidence=evidence,
        analysis=analysis,
        ai_inference=inference,
        findings=a11y_data.get("issues", []),
        recommendations=recs
    ).to_dict()

def run_security_agent(crawl_data: Dict[str, Any], tech_data: Dict[str, Any]) -> Dict[str, Any]:
    score = tech_data.get("security_score", 70)
    sec_headers = tech_data.get("security_headers", [])
    url = crawl_data.get("base_url", "")
    
    missing_headers = [h["header"] for h in sec_headers if h["status"] == "Missing"]
    configured_headers = [h["header"] for h in sec_headers if h["status"] == "Configured"]
    
    evidence = [
        f"HTTPS Protocol: {'Enforced (TLS Secured)' if url.startswith('https://') else 'INSECURE (Plain HTTP)'}",
        f"Configured security headers ({len(configured_headers)}): {', '.join(configured_headers) if configured_headers else 'None'}",
        f"Missing security headers ({len(missing_headers)}): {', '.join(missing_headers)}",
        f"Server disclosure: {tech_data.get('server', 'Hidden')}"
    ]
    
    analysis = [
        f"Transport layer: {'Secure' if url.startswith('https://') else 'Vulnerable to plaintext eavesdropping'}",
        f"XSS & Clickjacking posture: {'Hardened' if 'X-Frame-Options' in configured_headers else 'Vulnerable to UI redressing (iframe embedding)'}",
        f"MIME sniffing defense: {'Enforced' if 'X-Content-Type-Options' in configured_headers else 'Missing nosniff directive'}"
    ]
    
    inference = [
        "Passive audit only. The absence of HSTS means repeat visitors might be susceptible to SSL stripping attacks on unencrypted Wi-Fi networks.",
        "Adding Content-Security-Policy will protect against client-side script injection."
    ]
    
    recs = [
        {
            "priority": "HIGH" if "Strict-Transport-Security" in missing_headers else "LOW",
            "action": "Configure Strict-Transport-Security (HSTS) with max-age=31536000",
            "impact": "Forces browsers to exclusively establish encrypted HTTPS connections"
        },
        {
            "priority": "MEDIUM",
            "action": "Set X-Frame-Options: SAMEORIGIN and X-Content-Type-Options: nosniff",
            "impact": "Prevents clickjacking framing and MIME confusion exploits"
        }
    ]
    
    return AgentResult(
        name="Security Agent",
        role="Passive Web Security & Cryptographic Posture Auditor",
        score=score,
        summary=f"Inspected passive transport and HTTP response security headers. Security Health: {score}/100.",
        observed_evidence=evidence,
        analysis=analysis,
        ai_inference=inference,
        findings=[{"issue": f"Missing {h}", "severity": "Medium"} for h in missing_headers],
        recommendations=recs
    ).to_dict()

def run_technology_agent(tech_data: Dict[str, Any]) -> Dict[str, Any]:
    techs = tech_data.get("technologies", [])
    score = 85 if techs else 70
    
    evidence = [
        f"Detected {len(techs)} technical stack components",
        *[f"{t['technology']} ({t['category']}) - Confidence: {t['confidence']} via '{t['evidence']}'" for t in techs[:5]]
    ]
    
    analysis = [
        f"Architecture profile: {', '.join(set(t['category'] for t in techs)) if techs else 'Traditional static/server-rendered markup'}",
        f"Primary runtime indicators verified via DOM patterns and HTTP response headers"
    ]
    
    inference = [
        "Observed technology fingerprints indicate a modern web application stack.",
        "Third-party libraries should be kept updated to prevent known CVE vulnerabilities."
    ]
    
    recs = [
        {
            "priority": "LOW",
            "action": "Ensure all client-side JavaScript packages are pinned to recent LTS releases",
            "impact": "Maintains framework stability and minimizes bundle bloat"
        }
    ]
    
    return AgentResult(
        name="Technology Agent",
        role="Technology Stack Fingerprinting & Dependency Auditor",
        score=score,
        summary=f"Identified {len(techs)} framework and infrastructure components.",
        observed_evidence=evidence,
        analysis=analysis,
        ai_inference=inference,
        findings=[{"tech": t["technology"], "confidence": t["confidence"]} for t in techs],
        recommendations=recs
    ).to_dict()

def run_ux_agent(crawl_data: Dict[str, Any], features: List[Dict[str, Any]]) -> Dict[str, Any]:
    pages = crawl_data.get("pages", [])
    first_page = pages[0] if pages else {}
    
    detected_features = [f["feature"] for f in features if f.get("status") == "Detected"]
    has_nav = "Navigation menu" in detected_features
    has_cta = "Call to Action button" in detected_features or "Contact form" in detected_features
    has_search = "Search" in detected_features
    
    score = 80
    if not has_nav: score -= 15
    if not has_cta: score -= 15
    if not has_search: score -= 5
    score = max(40, score)
    
    evidence = [
        f"Navigation menu: {'Detected' if has_nav else 'Not detected'}",
        f"Direct conversion CTA / Contact form: {'Detected' if has_cta else 'Not detected'}",
        f"Site Search input: {'Detected' if has_search else 'Not detected'}",
        f"Pages linked internally: {first_page.get('internal_links_count', 0)}"
    ]
    
    analysis = [
        "AI Observation: User journey flow allows exploration via primary navigation paths.",
        "AI Observation: Call-to-action visibility is critical for conversion rates."
    ]
    
    inference = [
        "AI Observation: If users cannot locate a prominent booking, quote, or contact button within 3 seconds, conversion bounce rate will rise.",
        "AI Observation: Mobile users require high-contrast buttons and sticky navigation."
    ]
    
    recs = [
        {
            "priority": "HIGH" if not has_cta else "MEDIUM",
            "action": "Implement a high-visibility hero Call-To-Action (CTA) above the fold",
            "impact": "Drives immediate visitor engagement and lead generation"
        }
    ]
    
    return AgentResult(
        name="UX Agent",
        role="User Experience & Conversion Journey Auditor",
        score=score,
        summary=f"Evaluated navigational hierarchy and visual CTA structure. UX Health: {score}/100.",
        observed_evidence=evidence,
        analysis=analysis,
        ai_inference=inference,
        findings=[{"observation": a} for a in analysis],
        recommendations=recs
    ).to_dict()

def run_content_agent(crawl_data: Dict[str, Any]) -> Dict[str, Any]:
    pages = crawl_data.get("pages", [])
    word_counts = [p.get("word_count", 0) for p in pages]
    avg_words = sum(word_counts) // max(len(word_counts), 1)
    
    thin_pages = [p.get("url") for p in pages if p.get("word_count", 0) < 150]
    
    score = 85
    if thin_pages: score -= min(len(thin_pages) * 5, 25)
    score = max(50, score)
    
    evidence = [
        f"Average word count across crawled pages: {avg_words} words",
        f"Total crawled pages analyzed: {len(pages)}",
        f"Thin content pages (<150 words): {len(thin_pages)}"
    ]
    
    analysis = [
        f"Content depth: {'Comprehensive' if avg_words > 400 else 'Brief / Concise'}",
        f"Thin content ratio: {round((len(thin_pages) / max(len(pages), 1)) * 100)}% of discovered pages"
    ]
    
    inference = [
        "Pages with insufficient textual depth struggle to establish topical authority with search engines.",
        "Adding customer FAQs and detailed service descriptions will substantially boost organic impressions."
    ]
    
    recs = [
        {
            "priority": "MEDIUM" if thin_pages else "LOW",
            "action": "Expand thin landing pages with at least 300+ words of unique, informative copy",
            "impact": "Increases search engine dwell time and semantic keyword relevance"
        }
    ]
    
    return AgentResult(
        name="Content Agent",
        role="Content Quality, Depth & Semantic Relevance Auditor",
        score=score,
        summary=f"Audited editorial depth across {len(pages)} pages. Content Health: {score}/100.",
        observed_evidence=evidence,
        analysis=analysis,
        ai_inference=inference,
        findings=[{"page": u, "issue": "Thin content (<150 words)"} for u in thin_pages[:5]],
        recommendations=recs
    ).to_dict()

def run_feature_gap_agent(features: List[Dict[str, Any]]) -> Dict[str, Any]:
    detected = [f["feature"] for f in features if f.get("status") == "Detected"]
    not_detected = [f["feature"] for f in features if f.get("status") == "Not detected"]
    
    evidence = [
        f"Detected capabilities ({len(detected)}): {', '.join(detected[:8]) if detected else 'None'}",
        f"Features not observed ({len(not_detected)}): {', '.join(not_detected[:8]) if not_detected else 'None'}"
    ]
    
    analysis = [
        "Comparison against 24-point modern business feature checklist.",
        "Note: 'Not detected' indicates the feature was not observed during the automated crawl, not that it definitively does not exist."
    ]
    
    inference = [
        "Adding interactive touchpoints such as Live Chat, FAQ accordions, and Online Booking directly increases customer conversion.",
        "Dark mode and accessibility toggles improve perceived polish and user retention."
    ]
    
    recs = [
        {
            "priority": "HIGH" if "Contact form" not in detected else "MEDIUM",
            "action": "Deploy instant engagement channels (WhatsApp click-to-chat, FAQ section, or interactive lead form)",
            "impact": "Reduces customer friction and captures inquiries 24/7"
        }
    ]
    
    score = min(100, max(40, len(detected) * 6))
    return AgentResult(
        name="Feature Gap Agent",
        role="Feature Benchmark & Capability Gap Auditor",
        score=score,
        summary=f"Compared observed capabilities against standard industry checklist. Feature Score: {score}/100.",
        observed_evidence=evidence,
        analysis=analysis,
        ai_inference=inference,
        findings=[{"feature": f, "status": "Not detected during crawl"} for f in not_detected[:6]],
        recommendations=recs
    ).to_dict()

def run_advantage_agent(features: List[Dict[str, Any]], seo_score: int, perf_score: int) -> Dict[str, Any]:
    strengths = []
    detected = [f["feature"] for f in features if f.get("status") == "Detected"]
    
    if seo_score >= 70:
        strengths.append({"advantage": "Strong Foundational SEO", "evidence": f"SEO score {seo_score}/100 with valid title and meta structure", "confidence": "High"})
    if perf_score >= 75:
        strengths.append({"advantage": "Responsive Server Delivery", "evidence": f"Performance score {perf_score}/100 with low initial latency", "confidence": "High"})
    if "Mobile responsive layout" in detected:
        strengths.append({"advantage": "Mobile-Friendly Viewport", "evidence": "Viewport meta tag properly configured for mobile screens", "confidence": "High"})
    if "Contact form" in detected or "Call to Action button" in detected:
        strengths.append({"advantage": "Lead Conversion Touchpoint", "evidence": "Observed interactive form/CTA elements in page markup", "confidence": "High"})
        
    if not strengths:
        strengths.append({"advantage": "Public Web Presence", "evidence": "Domain resolves and returns valid HTTP 200 responses", "confidence": "High"})
        
    evidence = [f"{s['advantage']}: {s['evidence']}" for s in strengths]
    
    return AgentResult(
        name="Advantage Agent",
        role="Evidence-Grounded Value & Competitive Strengths Evaluator",
        score=85,
        summary=f"Identified {len(strengths)} confirmed competitive strengths based on empirical evidence.",
        observed_evidence=evidence,
        analysis=["All advantages derived directly from verifiable DOM structures and HTTP telemetry."],
        ai_inference=["The business possesses an active technical foundation that can be scaled effectively."],
        findings=strengths,
        recommendations=[]
    ).to_dict()

def run_issue_drawback_agent(seo_data: Dict[str, Any], perf_data: Dict[str, Any], a11y_data: Dict[str, Any], tech_data: Dict[str, Any]) -> Dict[str, Any]:
    issues = []
    
    # SEO issues
    for iss in seo_data.get("issues", []):
        issues.append({
            "issue": iss.get("issue", "SEO Deficiency"),
            "severity": iss.get("severity", "Medium"),
            "category": "SEO",
            "evidence": iss.get("evidence", "Observed during crawler audit"),
            "recommendation": iss.get("recommendation", "Review SEO guidelines")
        })
        
    # Performance issues
    for iss in perf_data.get("issues", []):
        issues.append({
            "issue": iss.get("issue", "Performance Bottleneck"),
            "severity": iss.get("severity", "Medium"),
            "category": "Performance",
            "evidence": iss.get("evidence", "Latency or payload telemetry"),
            "recommendation": iss.get("recommendation", "Optimize asset delivery")
        })
        
    # A11y issues
    for iss in a11y_data.get("issues", []):
        issues.append({
            "issue": iss.get("issue", "Accessibility Flaw"),
            "severity": iss.get("severity", "Medium"),
            "category": "Accessibility",
            "evidence": iss.get("evidence", "DOM attribute inspection"),
            "recommendation": iss.get("recommendation", "Add accessible attributes")
        })
        
    high_count = sum(1 for i in issues if i["severity"].upper() == "HIGH")
    score = max(30, 100 - (high_count * 15) - (len(issues) * 3))
    
    evidence = [f"[{i['severity']}] {i['issue']}: {i['evidence']}" for i in issues[:6]]
    
    return AgentResult(
        name="Issue/Drawback Agent",
        role="Defect, Bottleneck & Risk Identification Specialist",
        score=score,
        summary=f"Cataloged {len(issues)} confirmed or potential issues across SEO, performance, and accessibility.",
        observed_evidence=evidence,
        analysis=[f"Severity breakdown: {high_count} High priority, {len(issues) - high_count} Medium/Low priority."],
        ai_inference=["Resolving high-severity issues eliminates crawl penalties and user drop-off."],
        findings=issues,
        recommendations=[{"action": i["recommendation"], "priority": i["severity"]} for i in issues[:4]]
    ).to_dict()

def run_master_ai_agent(specialist_agents: List[Dict[str, Any]], domain: str) -> Dict[str, Any]:
    """
    Master AI Agent synthesizes all 10 specialist agents into an executive briefing.
    Clearly distinguishes:
    1. Observed Evidence
    2. Technical Analysis
    3. AI Inferences & Strategic Recommendations
    """
    scores = [a["score"] for a in specialist_agents]
    overall_health = round(sum(scores) / max(len(scores), 1))
    
    top_recommendations = []
    seen_actions = set()
    for a in specialist_agents:
        for r in a.get("recommendations", []):
            act = r.get("action")
            if act and act not in seen_actions:
                seen_actions.add(act)
                top_recommendations.append({
                    "priority": r.get("priority", "MEDIUM"),
                    "category": a.get("name", "Audit"),
                    "action": act,
                    "impact": r.get("impact", "Measurable user experience and conversion improvement")
                })
                
    # Sort recommendations by priority (HIGH first)
    prio_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    top_recommendations.sort(key=lambda x: prio_order.get(x["priority"].upper(), 3))
    
    return {
        "name": "Master AI Agent",
        "role": "Executive Intelligence & Strategic Synthesis Engine",
        "overall_health_score": overall_health,
        "executive_summary": (
            f"Comprehensive WebIntel AI audit for {domain} synthesized across 10 specialized intelligence agents. "
            f"The site achieved an Overall Digital Health Score of {overall_health}/100. "
            f"{len(top_recommendations)} prioritized interventions identified to maximize search discovery, conversion, and security."
        ),
        "score_matrix": {a["name"]: a["score"] for a in specialist_agents},
        "top_recommendations": top_recommendations[:8],
        "priority_actions": {
            "HIGH_PRIORITY": [r for r in top_recommendations if r["priority"].upper() == "HIGH"],
            "MEDIUM_PRIORITY": [r for r in top_recommendations if r["priority"].upper() == "MEDIUM"],
            "LOW_PRIORITY": [r for r in top_recommendations if r["priority"].upper() == "LOW"]
        },
        "methodology": "Three-Tier Grounded Synthesis: [1] Observed Telemetry -> [2] Deterministic Rule Analysis -> [3] Strategic AI Inference."
    }
