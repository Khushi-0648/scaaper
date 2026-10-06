import re
from bs4 import BeautifulSoup
from typing import List, Dict, Any, Set
from urllib.parse import urlparse

# Standard email regex ignoring static assets and font extensions
EMAIL_REGEX = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b')

# Standard international & local phone regex patterns
PHONE_REGEX = re.compile(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}\b')

IGNORED_EMAIL_DOMAINS = {"example.com", "yourdomain.com", "domain.com", "email.com", "sentry.io", "w3.org"}
IGNORED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js"}

def extract_contact_info(pages: List[Dict[str, Any]], base_url: str) -> Dict[str, Any]:
    """
    Extracts public contact details (emails, phone numbers, contact forms,
    addresses, social links, whatsapp) from all crawled pages.
    """
    emails: Set[str] = set()
    phone_numbers: Set[str] = set()
    addresses: Set[str] = set()
    contact_urls: Set[str] = set()
    social_links: Dict[str, str] = {}
    whatsapp_numbers: Set[str] = set()

    social_domains = {
        "twitter.com": "Twitter / X",
        "x.com": "Twitter / X",
        "linkedin.com": "LinkedIn",
        "facebook.com": "Facebook",
        "instagram.com": "Instagram",
        "youtube.com": "YouTube",
        "github.com": "GitHub",
        "tiktok.com": "TikTok"
    }

    for page in pages:
        html = page.get("html", "")
        url = page.get("url", "")
        if not html:
            continue

        soup = BeautifulSoup(html, "lxml")

        # 1. Mailto links
        for a in soup.find_all("a", href=True):
            href = a["href"].strip()
            if href.lower().startswith("mailto:"):
                clean_email = href[7:].split("?")[0].strip().lower()
                if clean_email and "@" in clean_email:
                    domain = clean_email.split("@")[-1]
                    if domain not in IGNORED_EMAIL_DOMAINS and not any(clean_email.endswith(ext) for ext in IGNORED_EXTENSIONS):
                        emails.add(clean_email)

            # Tel links
            elif href.lower().startswith("tel:"):
                clean_phone = href[4:].split("?")[0].strip()
                if len(re.sub(r'\D', '', clean_phone)) >= 7:
                    phone_numbers.add(clean_phone)

            # WhatsApp
            elif "wa.me/" in href.lower() or "api.whatsapp.com" in href.lower():
                whatsapp_numbers.add(href)

            # Contact pages
            elif any(c in href.lower() for c in ["/contact", "/contact-us", "/reach-us", "/support"]):
                contact_urls.add(href if href.startswith("http") else url)

            # Social links
            for s_dom, s_label in social_domains.items():
                if s_dom in href.lower() and s_label not in social_links:
                    social_links[s_label] = href

        # 2. Text-based Regex extraction for Emails
        page_text = soup.get_text(" ", strip=True)
        found_emails = EMAIL_REGEX.findall(page_text)
        for em in found_emails:
            em_clean = em.lower().strip()
            domain = em_clean.split("@")[-1]
            if domain not in IGNORED_EMAIL_DOMAINS and not any(em_clean.endswith(ext) for ext in IGNORED_EXTENSIONS):
                emails.add(em_clean)

        # 3. Text-based Phone extraction (focused on contact / footer / header areas)
        contact_containers = soup.find_all(attrs={"class": re.compile(r"contact|footer|header|phone|call", re.I)})
        for container in contact_containers:
            c_text = container.get_text(" ", strip=True)
            for match in PHONE_REGEX.finditer(c_text):
                num = match.group(0).strip()
                digits_only = re.sub(r'\D', '', num)
                if 8 <= len(digits_only) <= 15:
                    phone_numbers.add(num)

        # 4. Physical Address markup
        address_tags = soup.find_all("address")
        for addr in address_tags:
            txt = addr.get_text(" ", strip=True)
            if len(txt) > 8:
                addresses.add(txt[:140])

        # Schema.org PostalAddress
        schema_addrs = soup.find_all(attrs={"itemtype": re.compile(r"PostalAddress", re.I)})
        for sa in schema_addrs:
            txt = sa.get_text(" ", strip=True)
            if len(txt) > 8:
                addresses.add(txt[:140])

    return {
        "emails": sorted(list(emails))[:8],
        "phone_numbers": sorted(list(phone_numbers))[:8],
        "whatsapp": sorted(list(whatsapp_numbers))[:4],
        "addresses": sorted(list(addresses))[:4],
        "contact_pages": sorted(list(contact_urls))[:4],
        "social_profiles": social_links
    }
