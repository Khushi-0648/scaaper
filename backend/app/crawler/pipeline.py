import os
import traceback
from typing import Dict, Any
from app.crawler.crawler import WebCrawler, CrawlOptions
from app.analyzers.features import detect_features
from app.analyzers.broken_links import detect_broken_links
from app.analyzers.contact import extract_contact_info
from app.analyzers.seo import analyze_seo
from app.analyzers.technical import analyze_technical
from app.analyzers.performance import analyze_performance
from app.analyzers.accessibility import analyze_accessibility
from app.analyzers.advantages_drawbacks import generate_advantages_and_drawbacks
from app.analyzers.opportunities import generate_opportunity_signals
from app.crawler.sitemap_builder import build_visual_sitemap
from app.agents.hub import (
    run_seo_agent,
    run_performance_agent,
    run_accessibility_agent,
    run_security_agent,
    run_technology_agent,
    run_ux_agent,
    run_content_agent,
    run_feature_gap_agent,
    run_advantage_agent,
    run_issue_drawback_agent,
    run_master_ai_agent
)
from app.ai.ai_analyzer import run_ai_analysis
from app.exporters.excel_exporter import generate_excel_report
from app.exporters.pdf_exporter import generate_pdf_report
from app.database.db import update_progress, complete_analysis, fail_analysis

REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

def execute_analysis_job(analysis_id: str, raw_url: str, domain: str, options_dict: Dict[str, Any]):
    try:
        crawl_options = CrawlOptions(
            max_pages=options_dict.get("max_pages", 25),
            crawl_delay=options_dict.get("crawl_delay", 0.2),
            same_domain_only=options_dict.get("same_domain_only", True),
            follow_external=options_dict.get("follow_external", False),
            js_rendering=options_dict.get("js_rendering", "auto")
        )

        update_progress(analysis_id, 5, "Connecting to target website", f"Initializing connection to {domain}")

        def crawler_progress(pct: int, step_name: str, message: str):
            update_progress(analysis_id, pct, step_name, message)

        crawler = WebCrawler(base_url=raw_url, domain=domain, options=crawl_options)
        crawl_data = crawler.crawl(progress_callback=crawler_progress)

        pages = crawl_data.get("pages", [])
        if not pages:
            fail_analysis(analysis_id, "Unable to retrieve any content from the specified URL. The server may be unreachable or offline.")
            return

        main_page = pages[0]
        sec_shield = crawl_data.get("security_shield_details") or main_page.get("security_shield") or {}
        is_shielded = crawl_data.get("security_shield_detected", False) or bool(sec_shield) or main_page.get("status_code") in (403, 503, 495)

        # 1. Feature Detection
        update_progress(analysis_id, 60, "Detecting features", "Scanning page elements for 30+ interactive features...")
        features = detect_features(pages)

        # 2. Broken Links Detection
        update_progress(analysis_id, 64, "Detecting broken links", "Auditing internal and external hyperlink validity...")
        broken_links = detect_broken_links(pages)

        # 3. Contact Details Extraction (TOP PRIORITY)
        update_progress(analysis_id, 68, "Extracting contact details", "Extracting public emails, telephone numbers, and addresses...")
        contact_details = extract_contact_info(pages, raw_url)

        # 4. SEO Analysis
        update_progress(analysis_id, 72, "Auditing SEO signals", "Auditing title tags, meta descriptions, headings, canonicals, and sitemaps...")
        seo_data = analyze_seo(crawl_data)

        # 5. Technical Stack Analysis
        update_progress(analysis_id, 76, "Fingerprinting technology stack", "Fingerprinting frameworks, CMS, CDNs, and security headers...")
        tech_data = analyze_technical(crawl_data)

        # 6. Performance & Accessibility
        update_progress(analysis_id, 80, "Measuring performance & accessibility", "Auditing response latency, asset compression, image ALT coverage, and form labels...")
        perf_data = analyze_performance(crawl_data)
        a11y_data = analyze_accessibility(crawl_data)

        # 7. Advantages & Drawbacks
        update_progress(analysis_id, 84, "Evaluating advantages and drawbacks", "Correlating evidence-based strengths, bottlenecks, and missing features...")
        adv_draw = generate_advantages_and_drawbacks(crawl_data, features, seo_data, tech_data, perf_data, a11y_data)

        # 8. Visual Sitemap
        update_progress(analysis_id, 87, "Generating visual sitemap", "Constructing hierarchical tree structure of crawled site pages...")
        visual_sitemap = build_visual_sitemap(pages, domain)

        # 9. Execute Specialized AI Agents
        update_progress(analysis_id, 90, "Running Specialized AI Agents", "Deploying SEO, Performance, Accessibility, Security, UX, Content, and Tech agents...")
        agent_seo = run_seo_agent(crawl_data, seo_data)
        agent_perf = run_performance_agent(crawl_data, perf_data)
        agent_a11y = run_accessibility_agent(crawl_data, a11y_data)
        agent_sec = run_security_agent(crawl_data, tech_data)
        agent_tech = run_technology_agent(tech_data)
        agent_ux = run_ux_agent(crawl_data, features)
        agent_content = run_content_agent(crawl_data)
        agent_gap = run_feature_gap_agent(features)
        agent_adv = run_advantage_agent(features, seo_data.get("score", 70), perf_data.get("score", 70))
        agent_draw = run_issue_drawback_agent(seo_data, perf_data, a11y_data, tech_data)

        specialist_agents = [
            agent_seo, agent_perf, agent_a11y, agent_sec, agent_tech,
            agent_ux, agent_content, agent_gap, agent_adv, agent_draw
        ]

        # 10. Master AI Agent
        update_progress(analysis_id, 93, "Synthesizing Master AI Agent intelligence", "Master Agent synthesizing executive overview and priority action matrix...")
        master_ai = run_master_ai_agent(specialist_agents, domain)

        # Health Scores Calculation
        seo_s = seo_data.get("score", 70)
        perf_s = perf_data.get("score", 70)
        a11y_s = a11y_data.get("score", 70)
        sec_s = 98 if is_shielded else tech_data.get("security_score", 75)
        ux_s = agent_ux["score"]
        content_s = agent_content["score"]
        overall_s = master_ai["overall_health_score"]

        if is_shielded:
            overall_s = max(overall_s, 82)

        health_scores = {
            "overall": overall_s,
            "seo": seo_s,
            "performance": perf_s,
            "accessibility": a11y_s,
            "security": sec_s,
            "ux": ux_s,
            "content": content_s,
            "technical": agent_tech["score"]
        }

        # Page Title & Description formatting
        title_val = main_page.get("title", "")
        if not title_val or any(t in title_val.lower() for t in ["just a moment", "attention required", "access denied", "403 forbidden"]):
            if is_shielded:
                title_val = f"{domain} (Enterprise Shield Protected)"
            else:
                title_val = domain

        meta_desc_val = main_page.get("meta_description", "")
        if not meta_desc_val and is_shielded:
            provider_name = sec_shield.get("provider", "Enterprise Cloud Firewall / WAF")
            meta_desc_val = f"This website is protected by {provider_name}. Automated bots and external scrapers are filtered by the enterprise security shield."

        # 12. Summary Object
        summary = {
            "title": title_val,
            "meta_description": meta_desc_val,
            "category": "Enterprise Protected Asset" if is_shielded else ("Web Application" if any(f["status"] == "Detected" for f in features if f["feature"] in ["Login", "Shopping cart", "User dashboard"]) else "Informational Website"),
            "language": main_page.get("headers", {}).get("Content-Language", "en"),
            "pages_count": len(pages),
            "internal_links_count": crawl_data.get("internal_links_count", 0),
            "external_links_count": crawl_data.get("external_links_count", 0),
            "load_time_ms": perf_data.get("load_time_ms", 0),
            "content_length": main_page.get("content_length", 0),
            "robots_txt_found": crawl_data.get("robots_txt_found", False),
            "sitemap_urls": crawl_data.get("sitemap_urls", []),
            "is_https": raw_url.startswith("https://"),
            "is_security_protected": is_shielded,
            "security_shield": sec_shield,
            "contact_details": contact_details,
            "health_scores": health_scores
        }

        # Legacy AI Synthesis
        ai_input = {
            "url": raw_url,
            "domain": domain,
            "title": title_val,
            "meta_description": meta_desc_val,
            "pages_count": len(pages),
            "features": features,
            "technologies": tech_data.get("technologies", []),
            "seo_score": seo_s,
            "performance_score": perf_s,
            "accessibility_score": a11y_s,
            "load_time_ms": perf_data.get("load_time_ms", 0)
        }
        legacy_ai = run_ai_analysis(ai_input)

        # 13. Opportunity Signals
        opp_signals = generate_opportunity_signals({"website": raw_url, "phone": contact_details.get("phone_numbers", [""])[0] if contact_details.get("phone_numbers") else ""}, {
            "seo": seo_data,
            "performance": perf_data,
            "accessibility": a11y_data,
            "technical": tech_data,
            "features": features,
            "pages": pages,
            "summary": summary
        })

        # Clean pages
        clean_pages = []
        for p in pages:
            clean_pages.append({
                "url": p.get("url", ""),
                "status_code": p.get("status_code", 0),
                "crawl_status": p.get("crawl_status", ""),
                "title": p.get("title", ""),
                "h1": p.get("h1", ""),
                "h2_list": p.get("h2_list", []),
                "meta_description": p.get("meta_description", ""),
                "canonical_url": p.get("canonical_url", ""),
                "word_count": p.get("word_count", 0),
                "internal_links_count": p.get("internal_links_count", 0),
                "external_links_count": p.get("external_links_count", 0),
                "images_count": p.get("images_count", 0),
                "images_without_alt": p.get("images_without_alt", 0),
                "load_time_ms": p.get("load_time_ms", 0),
                "content_length": p.get("content_length", 0)
            })

        # Assemble full payload
        full_payload = {
            "id": analysis_id,
            "url": raw_url,
            "domain": domain,
            "created_at": crawl_data.get("created_at", ""),
            "crawl_duration": crawl_data.get("duration", 0),
            "summary": summary,
            "contact_details": contact_details,
            "health_scores": health_scores,
            "is_security_protected": is_shielded,
            "security_shield": sec_shield,
            "pages": clean_pages,
            "features": features,
            "seo": seo_data,
            "technical": tech_data,
            "performance": perf_data,
            "accessibility": a11y_data,
            "advantages_drawbacks": adv_draw,
            "ai": legacy_ai,
            "broken_links": broken_links,
            "visual_sitemap": visual_sitemap,
            "opportunity_signals": opp_signals,
            "agents": {
                "specialists": specialist_agents,
                "master": master_ai
            }
        }

        # 14. Generate Single-Sheet Excel & PDF Reports
        update_progress(analysis_id, 96, "Generating Single-Sheet Excel & PDF reports", "Compiling unified single-sheet Excel report and PDF document...")
        excel_path = os.path.join(REPORTS_DIR, f"{analysis_id}.xlsx")
        pdf_path = os.path.join(REPORTS_DIR, f"{analysis_id}.pdf")
        
        try:
            generate_excel_report(full_payload, excel_path)
        except Exception as ex:
            print("Excel gen warning:", ex)

        try:
            generate_pdf_report(full_payload, pdf_path)
        except Exception as ex:
            print("PDF gen warning:", ex)

        # 15. Complete analysis in database
        complete_analysis(
            analysis_id=analysis_id,
            crawl_duration=crawl_data.get("duration", 0),
            pages_count=len(pages),
            seo_score=seo_s,
            performance_score=perf_s,
            accessibility_score=a11y_s,
            security_score=sec_s,
            ux_score=ux_s,
            content_score=content_s,
            overall_score=overall_s,
            summary=summary,
            full_data=full_payload
        )
    except Exception as e:
        err_msg = f"Analysis error: {str(e)}\n{traceback.format_exc()}"
        print(err_msg)
        fail_analysis(analysis_id, str(e))
