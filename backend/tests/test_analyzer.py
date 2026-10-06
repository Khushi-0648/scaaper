import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from app.crawler.validator import validate_and_normalize_url, is_private_ip
from app.analyzers.features import detect_features
from app.analyzers.seo import analyze_seo
from app.analyzers.technical import analyze_technical
from app.analyzers.performance import analyze_performance
from app.analyzers.accessibility import analyze_accessibility

def test_url_ssrf_blocking():
    # Localhost and private IPs must be blocked
    valid, err, _ = validate_and_normalize_url("http://localhost:8000")
    assert not valid
    assert "internal host" in err or "private" in err

    valid, err, _ = validate_and_normalize_url("http://127.0.0.1/admin")
    assert not valid

    valid, err, _ = validate_and_normalize_url("http://192.168.1.1")
    assert not valid

    valid, err, _ = validate_and_normalize_url("http://10.0.0.5")
    assert not valid

def test_url_normalization():
    valid, norm, domain = validate_and_normalize_url("example.com/test#anchor")
    assert valid
    assert norm == "https://example.com/test"
    assert domain == "example.com"

def test_feature_detection_mock():
    mock_html = """
    <!DOCTYPE html>
    <html lang="en">
    <head><title>Test Shop</title></head>
    <body>
        <nav><a href="/">Home</a><a href="/cart">Cart (0)</a></nav>
        <form role="search"><input type="search" name="q" placeholder="Search products..."></form>
        <form action="/login"><input type="password" name="pwd"><button type="submit">Log in</button></form>
        <a href="https://twitter.com/test">Twitter</a>
    </body>
    </html>
    """
    mock_pages = [{"url": "https://example.com", "html": mock_html, "headers": {}}]
    features = detect_features(mock_pages)
    
    detected = {f["feature"]: f["status"] for f in features}
    assert detected["Search"] == "Detected"
    assert detected["Login"] == "Detected"
    assert detected["Shopping cart"] == "Detected"
    assert detected["Navigation menu"] == "Detected"
    assert detected["Dark mode"] == "Not detected"

def test_seo_scoring_calculation():
    mock_crawl = {
        "base_url": "https://example.com",
        "robots_txt_found": True,
        "sitemap_urls": ["https://example.com/sitemap.xml"],
        "pages": [{
            "url": "https://example.com",
            "title": "Example Domain - Official Portal for Web Standards",
            "meta_description": "This domain is established to be used for illustrative examples in documents. You may use this in examples.",
            "h1": "Example Domain",
            "canonical_url": "https://example.com",
            "images_count": 0,
            "images_without_alt": 0,
            "html": "<html><head><title>Example Domain - Official Portal for Web Standards</title><meta name='description' content='This domain is established to be used for illustrative examples in documents.'></head><body><h1>Example Domain</h1><h2>Overview</h2></body></html>"
        }]
    }
    seo_res = analyze_seo(mock_crawl)
    assert seo_res["score"] >= 80
    assert seo_res["grade"] in ["A", "B"]

if __name__ == "__main__":
    test_url_ssrf_blocking()
    test_url_normalization()
    test_feature_detection_mock()
    test_seo_scoring_calculation()
    print("All unit tests passed successfully!")
