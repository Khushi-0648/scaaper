from typing import List, Dict, Any

def compare_competitors(analyses_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Compares 2-5 websites side-by-side across health scores, features, and tech stacks.
    """
    comparison_metrics = []
    
    for item in analyses_data:
        summary = item.get("summary", {})
        seo = item.get("seo", {})
        perf = item.get("performance", {})
        a11y = item.get("accessibility", {})
        tech = item.get("technical", {})
        features = item.get("features", [])
        detected_features = [f["feature"] for f in features if f.get("status") == "Detected"]
        
        overall = round((seo.get("score", 70) + perf.get("score", 70) + a11y.get("score", 70) + tech.get("security_score", 70)) / 4)
        
        comparison_metrics.append({
            "id": item.get("id"),
            "domain": item.get("domain"),
            "url": item.get("url"),
            "overall_score": overall,
            "seo_score": seo.get("score", 0),
            "performance_score": perf.get("score", 0),
            "accessibility_score": a11y.get("score", 0),
            "security_score": tech.get("security_score", 0),
            "ux_score": 80 if "Mobile responsive layout" in detected_features else 60,
            "load_time_ms": summary.get("load_time_ms", 0),
            "pages_count": len(item.get("pages", [])),
            "features_count": len(detected_features),
            "technologies": [t["technology"] for t in tech.get("technologies", [])],
            "key_features": detected_features[:6],
            "is_https": summary.get("is_https", False)
        })

    # Determine highest performers
    best_overall = max(comparison_metrics, key=lambda x: x["overall_score"]) if comparison_metrics else None
    fastest = min(comparison_metrics, key=lambda x: x["load_time_ms"]) if comparison_metrics else None
    best_seo = max(comparison_metrics, key=lambda x: x["seo_score"]) if comparison_metrics else None

    return {
        "competitors": comparison_metrics,
        "leaderboard": {
            "best_overall": best_overall["domain"] if best_overall else None,
            "fastest_site": fastest["domain"] if fastest else None,
            "seo_leader": best_seo["domain"] if best_seo else None
        },
        "score_comparison": [
            {
                "metric": "Overall Health",
                **{c["domain"]: c["overall_score"] for c in comparison_metrics}
            },
            {
                "metric": "SEO Score",
                **{c["domain"]: c["seo_score"] for c in comparison_metrics}
            },
            {
                "metric": "Performance Score",
                **{c["domain"]: c["performance_score"] for c in comparison_metrics}
            },
            {
                "metric": "Accessibility Score",
                **{c["domain"]: c["accessibility_score"] for c in comparison_metrics}
            },
            {
                "metric": "Security Score",
                **{c["domain"]: c["security_score"] for c in comparison_metrics}
            }
        ]
    }
