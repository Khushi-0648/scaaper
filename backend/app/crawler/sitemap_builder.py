from urllib.parse import urlparse
from typing import List, Dict, Any

def build_visual_sitemap(pages: List[Dict[str, Any]], domain: str) -> Dict[str, Any]:
    """
    Constructs a nested hierarchical tree for visual sitemap rendering
    from crawled URLs.
    """
    root_node = {
        "name": "HOME (/)",
        "url": f"https://{domain}/",
        "path": "/",
        "children": [],
        "status_code": 200,
        "title": "Home Page"
    }

    url_to_node = {"/": root_node}

    # Sort pages by URL length
    clean_pages = sorted(pages, key=lambda x: len(x.get("url", "")))

    for p in clean_pages:
        raw_url = p.get("url", "")
        if not raw_url:
            continue
        parsed = urlparse(raw_url)
        path = parsed.path.strip("/")
        if not path:
            root_node["title"] = p.get("title") or "Home Page"
            root_node["status_code"] = p.get("status_code", 200)
            continue

        parts = path.split("/")
        current_path = ""
        parent_node = root_node

        for i, part in enumerate(parts):
            current_path += "/" + part
            if current_path not in url_to_node:
                display_name = part.replace("-", " ").replace("_", " ").title()
                is_leaf = (i == len(parts) - 1)
                new_node = {
                    "name": f"{display_name} ({current_path})",
                    "url": raw_url if is_leaf else "",
                    "path": current_path,
                    "children": [],
                    "status_code": p.get("status_code", 200) if is_leaf else 200,
                    "title": p.get("title", display_name) if is_leaf else display_name
                }
                url_to_node[current_path] = new_node
                parent_node["children"].append(new_node)
                parent_node = new_node
            else:
                parent_node = url_to_node[current_path]

    return root_node
