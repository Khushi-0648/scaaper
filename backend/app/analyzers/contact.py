import re
import html
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Set
from urllib.parse import urlparse, unquote

# Advanced email regex pattern
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,8}\b')

# Obfuscated email patterns like: user [at] example [dot] com, user(at)example.com, info at domain dot com
OBFUSCATED_AT = re.compile(r'\b([a-zA-Z0-9._%+-]+)\s*(?:\[\s*at\s*\]|\(\s*at\s*\)|\bat\b|@)\s*([a-zA-Z0-9.-]+)\s*(?:\[\s*dot\s*\]|\(\s*dot\s*\)|\bdot\b|\.)\s*([a-zA-Z]{2,8})\b', re.I)

# Standard international & local phone regex patterns
PHONE_REGEX = re.compile(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}\b')

# WhatsApp patterns
WA_REGEX = re.compile(r'(?:https?://)?(?:wa\.me|api\.whatsapp\.com/send\?phone=)(\+?\d{8,16})', re.I)

IGNORED_EMAIL_DOMAINS = {
    "example.com", "yourdomain.com", "domain.com", "email.com",
    "sentry.io", "w3.org", "wixpress.com", "schema.org", "gravatar.com",
    "placeholder.com", "test.com", "sample.com"
}

IGNORED_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js",
    ".woff", ".woff2", ".ttf", ".eot", ".mp4", ".ico"
}

def clean_extracted_email(raw_email: str) -> str:
    if not raw_email:
        return ""
    em = unquote(raw_email).strip().lower()
    # Remove mailto prefix if present
    if em.startswith("mailto:"):
        em = em[7:]
    # Remove query params (?subject=...)
    em = em.split("?")[0].split("&")[0].strip()
    em = em.strip(".,;:()<>[]\"'")
    return em

def is_valid_email(email_str: str) -> bool:
    if not email_str or "@" not in email_str:
        return False
    parts = email_str.split("@")
    if len(parts) != 2:
        return False
    user, domain = parts
    if len(user) < 1 or len(domain) < 3 or "." not in domain:
        return False
    if domain in IGNORED_EMAIL_DOMAINS:
        return False
    if any(email_str.endswith(ext) for ext in IGNORED_EXTENSIONS):
        return False
    if "example" in domain or "test" in domain:
        return False
    return True

def extract_contact_info(pages: List[Dict[str, Any]], base_url: str) -> Dict[str, Any]:
    """
    Extracts comprehensive public contact details (emails, phone numbers, contact forms,
    addresses, social links, WhatsApp) from all crawled pages.
    """
    emails: Set[str] = set()
    phone_numbers: Set[str] = set()
    addresses: Set[str] = set()
    contact_urls: Set[str] = set()
    social_links: Dict[str, str] = {}
    whatsapp_numbers: Set[str] = set()

    social_domains = {
        "linkedin.com": "LinkedIn",
        "instagram.com": "Instagram",
        "facebook.com": "Facebook",
        "twitter.com": "Twitter / X",
        "x.com": "Twitter / X",
        "youtube.com": "YouTube",
        "tiktok.com": "TikTok",
        "github.com": "GitHub",
        "telegram.me": "Telegram",
        "t.me": "Telegram",
        "pinterest.com": "Pinterest",
        "medium.com": "Medium"
    }

    for page in pages:
        html_content = page.get("html", "")
        url = page.get("url", "")
        if not html_content:
            continue

        # Decode html entities
        decoded_html = html.unescape(html_content)
        soup = BeautifulSoup(decoded_html, "lxml")

        # 1. Inspect all <a> anchor links
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            href_lower = href.lower()

            # Mailto links
            if href_lower.startswith("mailto:"):
                clean_email = clean_extracted_email(href)
                if is_valid_email(clean_email):
                    emails.add(clean_email)

            # Tel links
            elif href_lower.startswith("tel:"):
                clean_phone = href[4:].split("?")[0].strip()
                digits_only = re.sub(r'\D', '', clean_phone)
                if 7 <= len(digits_only) <= 16:
                    phone_numbers.add(clean_phone)

            # WhatsApp links
            elif "wa.me/" in href_lower or "api.whatsapp.com" in href_lower or "whatsapp://send" in href_lower:
                match = WA_REGEX.search(href)
                if match:
                    wa_phone = match.group(1).strip()
                    whatsapp_numbers.add(f"https://wa.me/{re.sub(r'[^0-9+]', '', wa_phone)}")
                else:
                    whatsapp_numbers.add(href)

            # Contact pages
            elif any(c in href_lower for c in ["/contact", "/contact-us", "/reach-us", "/support", "/get-in-touch", "/about-us", "/about"]):
                full_c_url = href if href.startswith("http") else (url.rstrip("/") + "/" + href.lstrip("/"))
                contact_urls.add(full_c_url)

            # Social links
            for s_dom, s_label in social_domains.items():
                if s_dom in href_lower and s_label not in social_links:
                    # Ignore sharing links
                    if not any(sh in href_lower for sh in ["share", "sharer", "intent/tweet", "status/"]):
                        social_links[s_label] = href

        # 2. Text-based Regex extraction for Emails
        page_text = soup.get_text(" ", strip=True)
        found_emails = EMAIL_REGEX.findall(page_text)
        for em in found_emails:
            clean_em = clean_extracted_email(em)
            if is_valid_email(clean_em):
                emails.add(clean_em)

        # Obfuscated emails (e.g., info [at] company [dot] com)
        for m in OBFUSCATED_AT.finditer(page_text):
            candidate = f"{m.group(1)}@{m.group(2)}.{m.group(3)}".lower()
            clean_cand = clean_extracted_email(candidate)
            if is_valid_email(clean_cand):
                emails.add(clean_cand)

        # 3. Text-based Phone extraction (focused on contact / footer / header / hero areas)
        contact_containers = soup.find_all(attrs={"class": re.compile(r"contact|footer|header|phone|call|info|top-bar", re.I)})
        for container in contact_containers:
            c_text = container.get_text(" ", strip=True)
            for match in PHONE_REGEX.finditer(c_text):
                num = match.group(0).strip()
                digits_only = re.sub(r'\D', '', num)
                # Avoid dates / zip codes (filter strictly)
                if 8 <= len(digits_only) <= 15 and not (len(digits_only) == 8 and num.startswith("202")):
                    phone_numbers.add(num)

        # 4. Physical Address markup (<address> & Schema.org PostalAddress)
        for addr in soup.find_all("address"):
            txt = addr.get_text(" ", strip=True)
            if 8 < len(txt) < 200:
                addresses.add(txt)

        schema_addrs = soup.find_all(attrs={"itemtype": re.compile(r"PostalAddress", re.I)})
        for sa in schema_addrs:
            txt = sa.get_text(" ", strip=True)
            if 8 < len(txt) < 200:
                addresses.add(txt)

        # 5. Schema.org JSON-LD Contact Extraction
        for script in soup.find_all("script", attrs={"type": "application/ld+json"}):
            try:
                import json
                script_text = script.string or script.get_text()
                if script_text:
                    ld_data = json.loads(script_text)
                    items = ld_data if isinstance(ld_data, list) else [ld_data]
                    for item in items:
                        if isinstance(item, dict):
                            # Email
                            ld_email = item.get("email")
                            if ld_email and isinstance(ld_email, str):
                                clean_ld_em = clean_extracted_email(ld_email)
                                if is_valid_email(clean_ld_em):
                                    emails.add(clean_ld_em)
                            # Telephone
                            ld_tel = item.get("telephone")
                            if ld_tel and isinstance(ld_tel, str):
                                phone_numbers.add(ld_tel.strip())
                            # Address
                            ld_addr = item.get("address")
                            if isinstance(ld_addr, dict):
                                street = ld_addr.get("streetAddress", "")
                                locality = ld_addr.get("addressLocality", "")
                                region = ld_addr.get("addressRegion", "")
                                postal = ld_addr.get("postalCode", "")
                                full_addr = f"{street}, {locality}, {region} {postal}".strip(" ,")
                                if full_addr:
                                    addresses.add(full_addr)
                            # SameAs (Social profiles)
                            same_as = item.get("sameAs", [])
                            if isinstance(same_as, str):
                                same_as = [same_as]
                            if isinstance(same_as, list):
                                for s_url in same_as:
                                    if isinstance(s_url, str):
                                        for s_dom, s_label in social_domains.items():
                                            if s_dom in s_url.lower() and s_label not in social_links:
                                                social_links[s_label] = s_url
            except Exception:
                pass

    return {
        "emails": sorted(list(emails))[:10],
        "phone_numbers": sorted(list(phone_numbers))[:10],
        "whatsapp": sorted(list(whatsapp_numbers))[:6],
        "addresses": sorted(list(addresses))[:6],
        "contact_pages": sorted(list(contact_urls))[:6],
        "social_profiles": social_links
    }
