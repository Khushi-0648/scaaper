import socket
import ipaddress
from urllib.parse import urlparse, urlunparse
from typing import Tuple

def is_private_ip(ip_str: str) -> bool:
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private or
            ip.is_loopback or
            ip.is_reserved or
            ip.is_link_local or
            ip.is_multicast or
            str(ip) in ("0.0.0.0", "255.255.255.255")
        )
    except ValueError:
        return True

def validate_and_normalize_url(raw_url: str) -> Tuple[bool, str, str]:
    """
    Validates URL scheme, resolves IP to block SSRF / local / private networks,
    and returns (is_valid, normalized_url_or_error, host_domain).
    """
    if not raw_url or not isinstance(raw_url, str):
        return False, "URL cannot be empty.", ""

    raw_url = raw_url.strip()
    if not (raw_url.startswith("http://") or raw_url.startswith("https://")):
        raw_url = "https://" + raw_url

    try:
        parsed = urlparse(raw_url)
    except Exception as e:
        return False, f"Malformed URL syntax: {str(e)}", ""

    if parsed.scheme not in ("http", "https"):
        return False, f"Invalid scheme '{parsed.scheme}'. Only http and https are permitted.", ""

    hostname = parsed.hostname
    if not hostname:
        return False, "URL does not contain a valid hostname.", ""

    hostname_lower = hostname.lower()

    # Block localhost and typical internal aliases
    blocked_hosts = {"localhost", "127.0.0.1", "0.0.0.0", "::1", "local", "internal", "lan", "corp"}
    if hostname_lower in blocked_hosts or hostname_lower.endswith(".local") or hostname_lower.endswith(".internal"):
        return False, f"Security restriction: Access to internal host '{hostname}' is forbidden.", ""

    # DNS Resolution check against SSRF
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        ips = {item[4][0] for item in addr_info}
        for ip in ips:
            if is_private_ip(ip):
                return False, f"Security restriction (SSRF Prevention): '{hostname}' resolves to private/internal IP address {ip}.", ""
    except socket.gaierror:
        return False, f"DNS resolution failed: Host '{hostname}' could not be resolved. Please verify the domain name.", ""
    except Exception as e:
        return False, f"URL validation error: {str(e)}", ""

    # Normalize URL: strip fragment, standard path
    normalized_path = parsed.path if parsed.path else "/"
    normalized_url = urlunparse((
        parsed.scheme,
        parsed.netloc.lower(),
        normalized_path,
        parsed.params,
        parsed.query,
        ""  # Strip fragment
    ))

    return True, normalized_url, hostname_lower
