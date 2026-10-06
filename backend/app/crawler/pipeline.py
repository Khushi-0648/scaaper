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
from app.ai.ai_analyzer import run_ai_analysis
from app.exporters.excel_exporter import generate_excel_report
from app.database.db import update_progress, complete_analysis, fail_analysis

REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "reports")


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

        if not crawl_data.get("pages"):
            fail_analysis(analysis_id, "Unable to retrieve any content from the specified URL. The server may be down or blocking automated requests.")
            return

        # Feature Detection
        update_progress(analysis_id, 65, "Detecting features", "Scanning page elements for known features...")
        features = detect_features(crawl_data["pages"])

        # Broken Links Detection
        update_progress(analysis_id, 68, "Detecting broken links", "Scanning for dead internal/external links...")
        broken_links = detect_broken_links(crawl_data["pages"])

        # Contact Details Extraction
        update_progress(analysis_id, 70, "Extracting contact details", "Scanning for public emails, phone numbers, and addresses...")
        contact_details = extract_contact_info(crawl_data["pages"], raw_url)

        # SEO Analysis
        update_progress(analysis_id, 75, "Analyzing SEO parameters", "Auditing title tags, meta descriptions, headings, canonicals, and sitemaps...")
        seo_data = analyze_seo(crawl_data)

        # Technical Analysis
        update_progress(analysis_id, 82, "Inspecting technical architecture", "Fingerprinting web frameworks, CDNs, HTTP headers, and security policies...")
        tech_data = analyze_technical(crawl_data)

        # Performance & Accessibility
        update_progress(analysis_id, 88, "Measuring performance & accessibility", "Auditing load time, compression, image ALT coverage, and form labels...")
        perf_data = analyze_performance(crawl_data)
        a11y_data = analyze_accessibility(crawl_data)

        # Advantages & Drawbacks
        update_progress(analysis_id, 92, "Evaluating advantages and drawbacks", "Correlating evidence-based strengths, defects, and missing features...")
        adv_draw = generate_advantages_and_drawbacks(crawl_data, features, seo_data, tech_data, perf_data, a11y_data)

        # AI Insights Layer
        update_progress(analysis_id, 95, "Synthesizing AI analysis", "Synthesizing observed evidence into architectural insights...")
        main_page = crawl_data["pages"][0]
        ai_input = {
            "url": raw_url,
            "domain": domain,
            "title": main_page.get("title", ""),
            "meta_description": main_page.get("meta_description", ""),
            "pages_count": len(crawl_data["pages"]),
            "features": features,
            "technologies": tech_data.get("technologies", []),
            "seo_score": seo_data.get("score", 0),
            "performance_score": perf_data.get("score", 0),
            "accessibility_score": a11y_data.get("score", 0),
            "load_time_ms": perf_data.get("load_time_ms", 0)
        }
        ai_data = run_ai_analysis(ai_input)

        # Overview summary object
        summary = {
            "title": main_page.get("title", ""),
            "meta_description": main_page.get("meta_description", ""),
            "category": "Web Application" if any(f["status"] == "Detected" for f in features if f["feature"] in ["Login", "Shopping cart", "User dashboard"]) else "Informational Website",
            "language": main_page.get("headers", {}).get("Content-Language", "en"),
            "pages_count": len(crawl_data["pages"]),
            "internal_links_count": crawl_data.get("internal_links_count", 0),
            "external_links_count": crawl_data.get("external_links_count", 0),
            "load_time_ms": perf_data.get("load_time_ms", 0),
            "content_length": main_page.get("content_length", 0),
            "robots_txt_found": crawl_data.get("robots_txt_found", False),
            "sitemap_urls": crawl_data.get("sitemap_urls", []),
            "is_https": raw_url.startswith("https://"),
            "contact_details": contact_details
        }

        # Prepare clean pages representation
        clean_pages = []
        for p in crawl_data["pages"]:
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
            "pages": clean_pages,
            "features": features,
            "seo": seo_data,
            "technical": tech_data,
            "performance": perf_data,
            "accessibility": a11y_data,
            "advantages_drawbacks": adv_draw,
            "ai": ai_data,
            "broken_links": broken_links
        }

        # Generate Excel Report
        update_progress(analysis_id, 98, "Generating Excel report", "Compiling 10-sheet structured Excel workbook...")
        excel_path = os.path.join(REPORTS_DIR, f"{analysis_id}.xlsx")
        generate_excel_report(full_payload, excel_path)

        # Mark Complete
        complete_analysis(
            analysis_id=analysis_id,
            crawl_duration=crawl_data.get("duration", 0),
            pages_count=len(crawl_data["pages"]),
            seo_score=seo_data.get("score", 0),
            performance_score=perf_data.get("score", 0),
            accessibility_score=a11y_data.get("score", 0),
            summary=summary,
            full_data=full_payload
        )
    except Exception as e:
        err_msg = f"Analysis error: {str(e)}\n{traceback.format_exc()}"
        fail_analysis(analysis_id, str(e))
