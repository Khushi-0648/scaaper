from bs4 import BeautifulSoup
from typing import List, Dict, Any, Optional
import re

FEATURE_DEFINITIONS = [
    {"name": "Login", "category": "Authentication"},
    {"name": "Registration", "category": "Authentication"},
    {"name": "Authentication", "category": "Authentication"},
    {"name": "Search", "category": "Interaction"},
    {"name": "Contact form", "category": "Lead Generation"},
    {"name": "Newsletter", "category": "Lead Generation"},
    {"name": "Shopping cart", "category": "E-Commerce"},
    {"name": "Checkout", "category": "E-Commerce"},
    {"name": "Payment interface", "category": "E-Commerce"},
    {"name": "Pricing page", "category": "E-Commerce"},
    {"name": "User dashboard", "category": "Portal"},
    {"name": "Blog", "category": "Content"},
    {"name": "Comments", "category": "Engagement"},
    {"name": "Reviews", "category": "Engagement"},
    {"name": "Ratings", "category": "Engagement"},
    {"name": "Social sharing", "category": "Marketing"},
    {"name": "Social media links", "category": "Marketing"},
    {"name": "Video", "category": "Media"},
    {"name": "Image gallery", "category": "Media"},
    {"name": "Maps", "category": "Location"},
    {"name": "Chat widget", "category": "Support"},
    {"name": "FAQ", "category": "Support"},
    {"name": "Dark mode", "category": "UX"},
    {"name": "Language selector", "category": "Localization"},
    {"name": "Notifications", "category": "Engagement"},
    {"name": "File upload", "category": "Utility"},
    {"name": "Download functionality", "category": "Utility"},
    {"name": "Booking functionality", "category": "Services"},
    {"name": "Subscription", "category": "Monetization"},
    {"name": "Navigation menu", "category": "Navigation"},
    {"name": "Mobile responsive layout", "category": "UX"}
]

def detect_features(pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Examines crawled pages and inspects HTML, URLs, and structures to detect
    30+ distinct web features with strict evidence-based confidence.
    """
    results: List[Dict[str, Any]] = []

    # Aggregates across pages
    for feat in FEATURE_DEFINITIONS:
        name = feat["name"]
        detected = False
        evidence = ""
        detected_on = ""
        confidence = "Low"

        for p in pages:
            url = p.get("url", "")
            html = p.get("html", "")
            if not html:
                continue

            soup = BeautifulSoup(html, "lxml")

            if name == "Login":
                # Check for login links, form actions, auth inputs
                login_btn = soup.find(lambda tag: tag.name in ["a", "button"] and re.search(r"\b(log\s*in|sign\s*in)\b", tag.get_text(), re.I))
                login_form = soup.find("form", action=re.compile(r"login|signin|auth", re.I))
                pwd_input = soup.find("input", type="password")
                if login_btn:
                    detected = True
                    evidence = f"Found login button/link with text '{login_btn.get_text().strip()[:30]}'"
                    detected_on = url
                    confidence = "High"
                    break
                elif login_form:
                    detected = True
                    evidence = f"Found form element targeting auth/login route '{login_form.get('action', '')}'"
                    detected_on = url
                    confidence = "High"
                    break
                elif pwd_input:
                    detected = True
                    evidence = "Found password input field indicating login/credential form"
                    detected_on = url
                    confidence = "Medium"
                    break

            elif name == "Registration":
                reg_btn = soup.find(lambda tag: tag.name in ["a", "button"] and re.search(r"\b(sign\s*up|register|create\s*account|join\s*free)\b", tag.get_text(), re.I))
                reg_form = soup.find("form", action=re.compile(r"register|signup|join", re.I))
                if reg_btn:
                    detected = True
                    evidence = f"Registration action element detected: '{reg_btn.get_text().strip()[:30]}'"
                    detected_on = url
                    confidence = "High"
                    break
                elif reg_form:
                    detected = True
                    evidence = f"Account creation form element detected targeting '{reg_form.get('action', '')}'"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Authentication":
                if any(soup.find_all("input", type="password")) or "/auth" in url or "/oauth" in html:
                    detected = True
                    evidence = "Password credentials or OAuth endpoints observed in page structure"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Search":
                search_input = soup.find("input", attrs={"type": re.compile(r"search", re.I)}) or \
                               soup.find("input", attrs={"name": re.compile(r"^(q|query|search|s|keyword)$", re.I)})
                search_form = soup.find("form", role=re.compile(r"search", re.I)) or soup.find("div", role=re.compile(r"search", re.I))
                if search_input:
                    detected = True
                    evidence = f"Search input element found: <input name='{search_input.get('name', '')}' type='{search_input.get('type', '')}'>"
                    detected_on = url
                    confidence = "High"
                    break
                elif search_form:
                    detected = True
                    evidence = "Search container element with role='search' detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Contact form":
                contact_form = soup.find("form", attrs={"action": re.compile(r"contact|feedback|inquiry", re.I)}) or \
                               soup.find("form", attrs={"id": re.compile(r"contact|feedback", re.I)})
                email_input = soup.find("input", attrs={"type": "email"})
                textarea = soup.find("textarea")
                if contact_form:
                    detected = True
                    evidence = f"Dedicated contact form detected (<form id='{contact_form.get('id', '')}'>)"
                    detected_on = url
                    confidence = "High"
                    break
                elif email_input and textarea:
                    detected = True
                    evidence = "Form containing both email input and message textarea detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Newsletter":
                nl_input = soup.find("input", placeholder=re.compile(r"newsletter|subscribe|email address", re.I)) or \
                           soup.find("button", string=re.compile(r"subscribe|newsletter", re.I)) or \
                           soup.find(attrs={"class": re.compile(r"newsletter|subscribe", re.I)})
                if nl_input:
                    detected = True
                    evidence = "Newsletter subscription input or widget detected in page markup"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Shopping cart":
                cart_el = soup.find(lambda tag: tag.name in ["a", "button", "div"] and re.search(r"\b(cart|basket|bag)\b", tag.get("class", [""])[0] if tag.get("class") else "", re.I)) or \
                          soup.find(attrs={"href": re.compile(r"/cart|/basket", re.I)}) or \
                          soup.find(attrs={"id": re.compile(r"cart|basket", re.I)})
                if cart_el:
                    detected = True
                    evidence = "Shopping cart icon/link or e-commerce cart badge detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Checkout":
                checkout_link = soup.find("a", href=re.compile(r"/checkout", re.I)) or \
                                soup.find(lambda tag: tag.name in ["a", "button"] and re.search(r"\bcheckout\b", tag.get_text(), re.I))
                if checkout_link:
                    detected = True
                    evidence = f"Direct checkout CTA/route observed: '{checkout_link.get('href', checkout_link.get_text())}'"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Payment interface":
                payment_markers = ["stripe.com", "paypal.com", "razorpay", "square.com", "adyen", "braintree", "pay.google.com"]
                found_marker = [m for m in payment_markers if m in html]
                if found_marker:
                    detected = True
                    evidence = f"Payment gateway scripts/APIs detected: {', '.join(found_marker)}"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Pricing page":
                pricing_link = soup.find("a", href=re.compile(r"/pricing|/plans|/prices", re.I)) or \
                               soup.find(lambda tag: tag.name in ["h1", "h2", "h3"] and re.search(r"\bpricing\b|\bplans\b", tag.get_text(), re.I))
                if pricing_link:
                    detected = True
                    evidence = "Pricing or subscription tier tables/links identified"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "User dashboard":
                dash_link = soup.find("a", href=re.compile(r"/dashboard|/app|/account|/portal", re.I))
                if dash_link:
                    detected = True
                    evidence = f"User portal or dashboard link detected: '{dash_link.get('href', '')}'"
                    detected_on = url
                    confidence = "Medium"
                    break

            elif name == "Blog":
                blog_link = soup.find("a", href=re.compile(r"/blog|/posts|/articles|/news", re.I)) or \
                            soup.find(attrs={"class": re.compile(r"post-content|blog-entry|article-body", re.I)})
                if blog_link:
                    detected = True
                    evidence = "Blog / editorial article section or route detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Comments":
                comments_el = soup.find(attrs={"id": re.compile(r"comments|disqus_thread", re.I)}) or \
                              soup.find(attrs={"class": re.compile(r"comment-list|comments-area", re.I)})
                if comments_el:
                    detected = True
                    evidence = "Comments section or interactive thread container detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Reviews":
                reviews_el = soup.find(attrs={"class": re.compile(r"reviews|testimonial|customer-review", re.I)}) or \
                             soup.find(attrs={"itemprop": "review"})
                if reviews_el:
                    detected = True
                    evidence = "Customer reviews/testimonials markup or schema detected"
                    detected_on = url
                    confidence = "Medium"
                    break

            elif name == "Ratings":
                rating_el = soup.find(attrs={"class": re.compile(r"star-rating|ratings|rating-stars", re.I)}) or \
                            soup.find(attrs={"itemprop": "ratingValue"})
                if rating_el:
                    detected = True
                    evidence = "Star rating widgets or Schema.org ratingValue metadata detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Social sharing":
                share_el = soup.find(attrs={"class": re.compile(r"share-button|social-share|share-icons", re.I)}) or \
                           soup.find("a", href=re.compile(r"twitter\.com/intent/tweet|facebook\.com/sharer|linkedin\.com/shareArticle", re.I))
                if share_el:
                    detected = True
                    evidence = "Social share buttons / intent share endpoints detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Social media links":
                social_domains = ["twitter.com", "x.com", "github.com", "facebook.com", "linkedin.com", "instagram.com", "youtube.com", "discord.gg"]
                found_socials = [s for s in social_domains if any(s in a.get("href", "") for a in soup.find_all("a", href=True))]
                if found_socials:
                    detected = True
                    evidence = f"Social profile links found for: {', '.join(found_socials[:4])}"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Video":
                video_el = soup.find("video") or soup.find("iframe", src=re.compile(r"youtube\.com|vimeo\.com|wistia", re.I))
                if video_el:
                    detected = True
                    tag_type = video_el.name
                    evidence = f"HTML5 <video> tag or embedded video player ({tag_type}) detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Image gallery":
                gallery_el = soup.find(attrs={"class": re.compile(r"gallery|carousel|slider|swiper", re.I)})
                if gallery_el:
                    detected = True
                    evidence = f"Image carousel/gallery container detected with class '{gallery_el.get('class', [''])[0]}'"
                    detected_on = url
                    confidence = "Medium"
                    break

            elif name == "Maps":
                map_el = soup.find("iframe", src=re.compile(r"maps\.google|openstreetmap|mapbox", re.I)) or \
                         soup.find(attrs={"id": re.compile(r"map|google-map", re.I)})
                if map_el:
                    detected = True
                    evidence = "Embedded interactive map (Google Maps / Mapbox / OpenStreetMap) detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Chat widget":
                chat_markers = ["intercom", "crisp.chat", "tawk.to", "drift.com", "zendesk", "livechat", "freshchat", "hubspot-messages"]
                found_chat = [c for c in chat_markers if c in html.lower()]
                if found_chat:
                    detected = True
                    evidence = f"Live chat support integration detected: {found_chat[0]}"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "FAQ":
                faq_el = soup.find(attrs={"class": re.compile(r"faq|accordion|questions", re.I)}) or \
                         soup.find("a", href=re.compile(r"/faq", re.I)) or \
                         soup.find(lambda tag: tag.name in ["h1", "h2", "h3"] and "faq" in tag.get_text().lower())
                if faq_el:
                    detected = True
                    evidence = "Frequently Asked Questions (FAQ) section or accordion items detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Dark mode":
                dark_toggle = soup.find(attrs={"id": re.compile(r"dark-mode|theme-toggle|color-scheme", re.I)}) or \
                              soup.find(attrs={"class": re.compile(r"dark-toggle|theme-switch", re.I)}) or \
                              "data-theme" in html or "prefers-color-scheme" in html
                if dark_toggle:
                    detected = True
                    evidence = "Dark mode switcher button / CSS theme attributes detected"
                    detected_on = url
                    confidence = "Medium"
                    break

            elif name == "Language selector":
                lang_el = soup.find(attrs={"class": re.compile(r"lang-select|language-picker|language-switch", re.I)}) or \
                          soup.find("select", attrs={"name": re.compile(r"lang", re.I)}) or \
                          soup.find("link", rel="alternate", hreflang=True)
                if lang_el:
                    detected = True
                    evidence = "Multi-language selector element or hreflang alternate links detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Notifications":
                notif_el = soup.find(attrs={"class": re.compile(r"notification-bell|alerts-dropdown|badge-notice", re.I)})
                if notif_el:
                    detected = True
                    evidence = "In-app notifications bell or alert badge container detected"
                    detected_on = url
                    confidence = "Medium"
                    break

            elif name == "File upload":
                upload_el = soup.find("input", type="file")
                if upload_el:
                    detected = True
                    evidence = "HTML file upload input (<input type='file'>) detected"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Download functionality":
                dl_el = soup.find("a", attrs={"download": True}) or \
                        soup.find("a", href=re.compile(r"\.(pdf|zip|tar\.gz|exe|dmg|apk|csv|xlsx)$", re.I))
                if dl_el:
                    detected = True
                    evidence = f"Download link detected targeting file: '{dl_el.get('href', '')[:50]}'"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Booking functionality":
                booking_markers = ["calendly.com", "acuityscheduling", "book-now", "reservation", "booking-form"]
                found_book = [b for b in booking_markers if b in html.lower()]
                if found_book:
                    detected = True
                    evidence = f"Online booking widget / scheduler integration detected ({found_book[0]})"
                    detected_on = url
                    confidence = "Medium"
                    break

            elif name == "Subscription":
                sub_el = soup.find(lambda tag: tag.name in ["button", "a", "h2", "h3"] and re.search(r"\b(monthly|annual|subscribe now|subscription plan)\b", tag.get_text(), re.I))
                if sub_el:
                    detected = True
                    evidence = f"Subscription billing or recurring membership plan reference: '{sub_el.get_text().strip()[:40]}'"
                    detected_on = url
                    confidence = "Medium"
                    break

            elif name == "Navigation menu":
                nav_el = soup.find("nav") or soup.find(attrs={"role": "navigation"}) or soup.find(attrs={"id": re.compile(r"menu|navbar", re.I)})
                if nav_el:
                    detected = True
                    evidence = f"Semantic primary navigation structure (<{nav_el.name}>) present"
                    detected_on = url
                    confidence = "High"
                    break

            elif name == "Mobile responsive layout":
                meta_vp = soup.find("meta", attrs={"name": "viewport"})
                if meta_vp and "width=device-width" in meta_vp.get("content", "").lower():
                    detected = True
                    evidence = f"Viewport meta tag configured for mobile devices: '{meta_vp.get('content', '')}'"
                    detected_on = url
                    confidence = "High"
                    break

        if detected:
            results.append({
                "feature": name,
                "category": feat["category"],
                "status": "Detected",
                "evidence": evidence,
                "detected_on": detected_on,
                "confidence": confidence
            })
        else:
            results.append({
                "feature": name,
                "category": feat["category"],
                "status": "Not detected",
                "evidence": "No matching HTML elements, forms, or script signatures observed during the crawl.",
                "detected_on": "-",
                "confidence": "High"
            })

    return results
