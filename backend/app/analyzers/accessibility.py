from bs4 import BeautifulSoup
from typing import List, Dict, Any
import re

GENERIC_LINK_TEXTS = {"click here", "read more", "more", "link", "here", "learn more", "details", "view"}

def analyze_accessibility(crawl_data: Dict[str, Any]) -> Dict[str, Any]:
    pages = crawl_data.get("pages", [])
    if not pages:
        return {
            "score": 0,
            "grade": "F",
            "issues": [],
            "stats": {}
        }

    score = 100
    issues: List[Dict[str, Any]] = []

    total_images = 0
    total_missing_alt = 0
    total_unlabeled_inputs = 0
    total_empty_buttons = 0
    total_vague_links = 0

    for idx, page in enumerate(pages):
        url = page.get("url", "")
        html = page.get("html", "")
        if not html:
            continue

        soup = BeautifulSoup(html, "lxml")

        # 1. HTML lang attribute (Checked primarily on main page)
        if idx == 0:
            html_tag = soup.find("html")
            lang = html_tag.get("lang") if html_tag else None
            if not lang or not lang.strip():
                score -= 10
                issues.append({
                    "issue": "Missing <html> Language Attribute",
                    "severity": "High",
                    "affected_page": url,
                    "evidence": "<html> tag has no 'lang' attribute defined.",
                    "recommendation": "Add a valid ISO language code to the <html> tag (e.g., <html lang='en'>) so screen readers pronounce text correctly."
                })

            # Viewport pinch-to-zoom check
            meta_vp = soup.find("meta", attrs={"name": "viewport"})
            if meta_vp:
                vp_content = meta_vp.get("content", "").lower()
                if "user-scalable=no" in vp_content or "maximum-scale=1" in vp_content:
                    score -= 8
                    issues.append({
                        "issue": "Pinch-to-Zoom Disabled",
                        "severity": "Medium",
                        "affected_page": url,
                        "evidence": f"Viewport disables zoom: '{vp_content}'",
                        "recommendation": "Remove 'user-scalable=no' and 'maximum-scale=1' to allow low-vision users to zoom web content."
                    })

        # 2. Images missing ALT
        imgs = soup.find_all("img")
        page_missing_alt = 0
        for img in imgs:
            total_images += 1
            alt = img.get("alt")
            if alt is None or (isinstance(alt, str) and not alt.strip() and not img.get("aria-hidden") == "true"):
                page_missing_alt += 1
                total_missing_alt += 1

        if page_missing_alt > 0:
            score -= min(15, page_missing_alt * 2)
            issues.append({
                "issue": f"{page_missing_alt} Image(s) Missing Accessible ALT Text",
                "severity": "High" if page_missing_alt > 3 else "Medium",
                "affected_page": url,
                "evidence": f"Found {page_missing_alt} <img> elements without meaningful 'alt' or 'aria-hidden' attributes.",
                "recommendation": "Add descriptive 'alt' text to all informative images, or alt='' / aria-hidden='true' for purely decorative assets."
            })

        # 3. Form inputs without labels
        inputs = soup.find_all(["input", "textarea", "select"])
        page_unlabeled = 0
        for inp in inputs:
            inp_type = inp.get("type", "text").lower()
            if inp_type in ["hidden", "submit", "button", "reset", "image"]:
                continue
            inp_id = inp.get("id")
            has_label = False
            if inp_id and soup.find("label", attrs={"for": inp_id}):
                has_label = True
            elif inp.find_parent("label"):
                has_label = True
            elif inp.get("aria-label") or inp.get("aria-labelledby") or inp.get("title"):
                has_label = True

            if not has_label:
                page_unlabeled += 1
                total_unlabeled_inputs += 1

        if page_unlabeled > 0:
            score -= min(12, page_unlabeled * 3)
            issues.append({
                "issue": f"{page_unlabeled} Form Input(s) Missing Accessible Labels",
                "severity": "High",
                "affected_page": url,
                "evidence": f"Found {page_unlabeled} input field(s) without an associated <label> or aria-label.",
                "recommendation": "Associate every form control with an explicit <label for='...'> or provide an aria-label attribute."
            })

        # 4. Buttons without accessible names
        buttons = soup.find_all(["button", "a"])
        page_empty_btns = 0
        for b in buttons:
            if b.name == "button" or (b.name == "a" and b.get("role") == "button"):
                text = b.get_text(strip=True)
                aria_label = b.get("aria-label", "").strip()
                title_attr = b.get("title", "").strip()
                if not text and not aria_label and not title_attr and not b.find("img", alt=True):
                    page_empty_btns += 1
                    total_empty_buttons += 1

        if page_empty_btns > 0:
            score -= min(10, page_empty_btns * 2)
            issues.append({
                "issue": f"{page_empty_btns} Interactive Button(s) Without Text or Accessible Name",
                "severity": "High",
                "affected_page": url,
                "evidence": "Found button elements containing only icons or empty tags with no screen-reader text.",
                "recommendation": "Include an aria-label='...' attribute or hidden .sr-only descriptive text on icon buttons."
            })

        # 5. Heading hierarchy structure
        headings = [h.name for h in soup.find_all(re.compile(r"^h[1-6]$"))]
        levels = [int(h[1]) for h in headings]
        skipped_levels = False
        for i in range(len(levels) - 1):
            if levels[i+1] > levels[i] + 1:
                skipped_levels = True
                break
        if skipped_levels:
            score -= 5
            issues.append({
                "issue": "Skipped Heading Level Hierarchy",
                "severity": "Medium",
                "affected_page": url,
                "evidence": f"Heading hierarchy contains skipped levels (e.g. h1 followed directly by h3): {' -> '.join(headings[:6])}",
                "recommendation": "Nest heading tags sequentially without skipping levels to preserve document outline structure."
            })

        # 6. Ambiguous / vague link texts
        vague_count = 0
        for a in soup.find_all("a", href=True):
            txt = a.get_text(strip=True).lower()
            if txt in GENERIC_LINK_TEXTS:
                vague_count += 1
                total_vague_links += 1

        if vague_count > 2:
            score -= 4
            issues.append({
                "issue": f"{vague_count} Generic / Ambiguous Link Texts",
                "severity": "Low",
                "affected_page": url,
                "evidence": f"Encountered repetitive ambiguous anchor text like 'click here' or 'read more' without surrounding context.",
                "recommendation": "Use self-descriptive anchor text explaining destination content (e.g., 'Read our privacy policy' instead of 'click here')."
            })

    final_score = max(0, min(100, score))
    grade = "A" if final_score >= 90 else "B" if final_score >= 75 else "C" if final_score >= 60 else "D" if final_score >= 45 else "F"

    return {
        "score": final_score,
        "grade": grade,
        "issues": issues,
        "stats": {
            "total_images": total_images,
            "missing_alt": total_missing_alt,
            "unlabeled_inputs": total_unlabeled_inputs,
            "empty_buttons": total_empty_buttons,
            "vague_links": total_vague_links
        }
    }
