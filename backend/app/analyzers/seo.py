from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
import re
from urllib.parse import urlparse

def analyze_seo(crawl_data: Dict[str, Any]) -> Dict[str, Any]:
    pages = crawl_data.get("pages", [])
    robots_found = crawl_data.get("robots_txt_found", False)
    sitemaps = crawl_data.get("sitemap_urls", [])
    base_url = crawl_data.get("base_url", "")
    is_https = base_url.startswith("https://")

    checks: List[Dict[str, Any]] = []
    score = 100
    deductions = []

    if not pages:
        return {
            "score": 0,
            "grade": "F",
            "checks": [],
            "reasons": ["No pages could be crawled to evaluate SEO."],
            "open_graph": {},
            "twitter_card": {}
        }

    main_page = pages[0]
    main_html = main_page.get("html", "")
    soup = BeautifulSoup(main_html, "lxml")

    # 1. HTTPS Check
    if is_https:
        checks.append({
            "check": "HTTPS Security",
            "status": "Passed",
            "details": "Website uses modern encrypted HTTPS protocol.",
            "severity": "Info",
            "recommendation": "Maintain SSL certificate auto-renewals."
        })
    else:
        score -= 15
        deductions.append("Website does not enforce HTTPS (-15 pts)")
        checks.append({
            "check": "HTTPS Security",
            "status": "Failed",
            "details": "Website is serving content over unencrypted HTTP.",
            "severity": "High",
            "recommendation": "Configure SSL/TLS certificate and 301 redirect HTTP traffic to HTTPS."
        })

    # 2. Page Title
    title = main_page.get("title", "")
    if not title:
        score -= 15
        deductions.append("Main page title is missing (-15 pts)")
        checks.append({
            "check": "Page Title",
            "status": "Failed",
            "details": "No <title> tag detected on the home page.",
            "severity": "High",
            "recommendation": "Add an informative, concise <title> tag between 30 and 60 characters."
        })
    elif len(title) < 20:
        score -= 5
        deductions.append(f"Page title is short ({len(title)} chars) (-5 pts)")
        checks.append({
            "check": "Page Title Length",
            "status": "Warning",
            "details": f"Page title '{title}' is {len(title)} characters (recommended: 30-60 characters).",
            "severity": "Medium",
            "recommendation": "Expand page title with relevant brand keywords to maximize search snippet CTR."
        })
    elif len(title) > 70:
        score -= 5
        deductions.append(f"Page title is long ({len(title)} chars) (-5 pts)")
        checks.append({
            "check": "Page Title Length",
            "status": "Warning",
            "details": f"Page title '{title[:50]}...' is {len(title)} characters and may be truncated in SERPs.",
            "severity": "Low",
            "recommendation": "Shorten title to under 60 characters to avoid SERP truncation."
        })
    else:
        checks.append({
            "check": "Page Title",
            "status": "Passed",
            "details": f"Well-formed page title: '{title}' ({len(title)} chars).",
            "severity": "Info",
            "recommendation": "Keep title relevant and aligned with search intent."
        })

    # 3. Meta Description
    meta_desc = main_page.get("meta_description", "")
    if not meta_desc:
        score -= 12
        deductions.append("Meta description is missing on the main page (-12 pts)")
        checks.append({
            "check": "Meta Description",
            "status": "Failed",
            "details": "No meta description tag detected on the homepage.",
            "severity": "High",
            "recommendation": "Provide a descriptive summary between 120 and 160 characters for search engines."
        })
    elif len(meta_desc) < 70 or len(meta_desc) > 170:
        score -= 4
        deductions.append(f"Meta description length ({len(meta_desc)} chars) is suboptimal (-4 pts)")
        checks.append({
            "check": "Meta Description Length",
            "status": "Warning",
            "details": f"Description is {len(meta_desc)} characters (ideal: 120-160 characters).",
            "severity": "Medium",
            "recommendation": "Optimize meta description to between 120 and 160 characters with clear call-to-action."
        })
    else:
        checks.append({
            "check": "Meta Description",
            "status": "Passed",
            "details": f"Good meta description found ({len(meta_desc)} chars).",
            "severity": "Info",
            "recommendation": "Keep descriptions compelling for user engagement."
        })

    # 4. H1 Structure
    h1 = main_page.get("h1", "")
    h1_count = len(soup.find_all("h1"))
    if h1_count == 0:
        score -= 10
        deductions.append("No H1 heading found on main page (-10 pts)")
        checks.append({
            "check": "H1 Heading",
            "status": "Failed",
            "details": "Page lacks an <h1> heading element.",
            "severity": "High",
            "recommendation": "Add a single, semantic <h1> heading describing the page's core topic."
        })
    elif h1_count > 1:
        score -= 4
        deductions.append(f"Multiple H1 tags ({h1_count}) found (-4 pts)")
        checks.append({
            "check": "Multiple H1 Headings",
            "status": "Warning",
            "details": f"Found {h1_count} separate <h1> tags on the homepage.",
            "severity": "Medium",
            "recommendation": "Use a single <h1> heading per page for clean semantic hierarchy."
        })
    else:
        checks.append({
            "check": "H1 Heading",
            "status": "Passed",
            "details": f"Single semantic H1 heading present: '{h1[:60]}'",
            "severity": "Info",
            "recommendation": "Maintain unique H1 across distinct pages."
        })

    # 5. H2 Structure
    h2_tags = soup.find_all("h2")
    if len(h2_tags) == 0:
        score -= 4
        deductions.append("No secondary H2 headings detected (-4 pts)")
        checks.append({
            "check": "H2 Subheadings",
            "status": "Warning",
            "details": "No <h2> elements found to structure content sections.",
            "severity": "Low",
            "recommendation": "Organize article sections with semantic <h2> headings."
        })
    else:
        checks.append({
            "check": "H2 Subheadings",
            "status": "Passed",
            "details": f"Detected {len(h2_tags)} structural <h2> subheadings.",
            "severity": "Info",
            "recommendation": "Maintain orderly nested heading structure (H1 -> H2 -> H3)."
        })

    # 6. Canonical URL
    canonical = main_page.get("canonical_url", "")
    if not canonical:
        score -= 6
        deductions.append("Missing canonical URL tag (-6 pts)")
        checks.append({
            "check": "Canonical URL Tag",
            "status": "Warning",
            "details": "No <link rel='canonical'> detected.",
            "severity": "Medium",
            "recommendation": "Specify self-referential canonical URL to prevent duplicate content issues."
        })
    else:
        checks.append({
            "check": "Canonical URL Tag",
            "status": "Passed",
            "details": f"Canonical URL specified: {canonical}",
            "severity": "Info",
            "recommendation": "Ensure canonical link matches the preferred indexing URL."
        })

    # 7. Robots.txt
    if robots_found:
        checks.append({
            "check": "robots.txt File",
            "status": "Passed",
            "details": "Valid robots.txt file detected at root.",
            "severity": "Info",
            "recommendation": "Audit crawl directives regularly to ensure critical pages are not blocked."
        })
    else:
        score -= 5
        deductions.append("robots.txt not detected (-5 pts)")
        checks.append({
            "check": "robots.txt File",
            "status": "Warning",
            "details": "No robots.txt found at /robots.txt.",
            "severity": "Medium",
            "recommendation": "Create a robots.txt file to guide search engine crawlers."
        })

    # 8. Sitemap
    if sitemaps:
        checks.append({
            "check": "XML Sitemap",
            "status": "Passed",
            "details": f"Sitemap located: {', '.join(sitemaps[:2])}",
            "severity": "Info",
            "recommendation": "Submit sitemap to Google Search Console and Bing Webmaster Tools."
        })
    else:
        score -= 5
        deductions.append("XML sitemap not found (-5 pts)")
        checks.append({
            "check": "XML Sitemap",
            "status": "Warning",
            "details": "No sitemap referenced in robots.txt or standard /sitemap.xml path.",
            "severity": "Medium",
            "recommendation": "Generate an XML sitemap and reference it in robots.txt."
        })

    # 9. Open Graph & Social Cards
    og_title = soup.find("meta", property="og:title")
    og_image = soup.find("meta", property="og:image")
    og_desc = soup.find("meta", property="og:description")
    og_data = {
        "title": og_title.get("content", "") if og_title else "",
        "image": og_image.get("content", "") if og_image else "",
        "description": og_desc.get("content", "") if og_desc else ""
    }

    if og_title and og_image:
        checks.append({
            "check": "Open Graph Metadata",
            "status": "Passed",
            "details": "og:title and og:image social tags present for rich previews on Facebook/LinkedIn.",
            "severity": "Info",
            "recommendation": "Verify card previews with Facebook Sharing Debugger."
        })
    else:
        score -= 4
        deductions.append("Incomplete Open Graph tags (-4 pts)")
        checks.append({
            "check": "Open Graph Metadata",
            "status": "Warning",
            "details": "Missing key Open Graph tags (og:title or og:image) for social media previews.",
            "severity": "Low",
            "recommendation": "Add complete Open Graph meta tags (og:title, og:description, og:image, og:url)."
        })

    # 10. Twitter/X Card
    tw_card = soup.find("meta", attrs={"name": "twitter:card"})
    tw_title = soup.find("meta", attrs={"name": "twitter:title"})
    tw_data = {
        "card": tw_card.get("content", "") if tw_card else "",
        "title": tw_title.get("content", "") if tw_title else ""
    }
    if tw_card:
        checks.append({
            "check": "Twitter/X Card Metadata",
            "status": "Passed",
            "details": f"twitter:card configured as '{tw_data['card']}'.",
            "severity": "Info",
            "recommendation": "Ensure high resolution twitter:image is linked."
        })
    else:
        checks.append({
            "check": "Twitter/X Card Metadata",
            "status": "Warning",
            "details": "No twitter:card meta tag detected.",
            "severity": "Low",
            "recommendation": "Add <meta name='twitter:card' content='summary_large_image'>."
        })

    # 11. Image Alt Attributes across pages
    total_imgs = sum(p.get("images_count", 0) for p in pages)
    missing_alt = sum(p.get("images_without_alt", 0) for p in pages)
    if total_imgs > 0:
        alt_pct = round(((total_imgs - missing_alt) / total_imgs) * 100, 1)
        if missing_alt > 0:
            score -= min(10, int(missing_alt * 2))
            deductions.append(f"{missing_alt} images missing ALT attributes")
            checks.append({
                "check": "Image ALT Attributes",
                "status": "Warning",
                "details": f"{missing_alt} of {total_imgs} images ({alt_pct}% covered) are missing ALT text.",
                "severity": "Medium",
                "recommendation": "Add descriptive ALT attributes to all informational images."
            })
        else:
            checks.append({
                "check": "Image ALT Attributes",
                "status": "Passed",
                "details": f"All {total_imgs} scanned images contain ALT attributes.",
                "severity": "Info",
                "recommendation": "Ensure ALT descriptions remain accurate and helpful."
            })

    # 12. Robots Meta Tag
    robots_meta = soup.find("meta", attrs={"name": re.compile(r"^robots$", re.I)})
    if robots_meta:
        content = robots_meta.get("content", "").lower()
        if "noindex" in content:
            score -= 25
            deductions.append("Robots meta contains 'noindex' (-25 pts)")
            checks.append({
                "check": "Robots Indexing Meta",
                "status": "Failed",
                "details": f"Page specifies '{content}', blocking search engines from indexing.",
                "severity": "High",
                "recommendation": "Remove 'noindex' if this page is intended for public search indexing."
            })
        else:
            checks.append({
                "check": "Robots Indexing Meta",
                "status": "Passed",
                "details": f"Robots meta allows indexing: '{content}'.",
                "severity": "Info",
                "recommendation": "Keep robots directive updated."
            })
    else:
        checks.append({
            "check": "Robots Indexing Meta",
            "status": "Passed",
            "details": "No restricting robots meta tag; indexable by default.",
            "severity": "Info",
            "recommendation": "Standard default index, follow."
        })

    # 13. Duplicate titles across crawled pages
    titles = [p.get("title", "").strip() for p in pages if p.get("title")]
    duplicates = [t for t in set(titles) if titles.count(t) > 1 and len(t) > 0]
    if duplicates:
        score -= 5
        deductions.append(f"{len(duplicates)} duplicate page titles observed across pages")
        checks.append({
            "check": "Duplicate Titles",
            "status": "Warning",
            "details": f"Duplicate titles detected on multiple URLs: '{duplicates[0][:40]}...'",
            "severity": "Medium",
            "recommendation": "Provide unique, distinguishable titles for every individual page."
        })

    final_score = max(0, min(100, score))

    if final_score >= 90:
        grade = "A"
    elif final_score >= 80:
        grade = "B"
    elif final_score >= 70:
        grade = "C"
    elif final_score >= 55:
        grade = "D"
    else:
        grade = "F"

    return {
        "score": final_score,
        "grade": grade,
        "checks": checks,
        "reasons": deductions if deductions else ["All primary SEO baseline requirements passed."],
        "open_graph": og_data,
        "twitter_card": tw_data
    }
