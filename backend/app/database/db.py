import sqlite3
import json
import os
from datetime import datetime
from typing import Optional, List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "analyzer.db")

def get_connection():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. analyses table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            url TEXT NOT NULL,
            domain TEXT NOT NULL,
            status TEXT NOT NULL, -- pending, running, completed, failed
            created_at TEXT NOT NULL,
            completed_at TEXT,
            crawl_duration REAL DEFAULT 0,
            progress_percent INTEGER DEFAULT 0,
            current_step TEXT DEFAULT 'Initialized',
            step_logs TEXT DEFAULT '[]', -- JSON array of log steps
            error_message TEXT,
            pages_count INTEGER DEFAULT 0,
            seo_score INTEGER DEFAULT 0,
            performance_score INTEGER DEFAULT 0,
            accessibility_score INTEGER DEFAULT 0,
            security_score INTEGER DEFAULT 0,
            ux_score INTEGER DEFAULT 0,
            content_score INTEGER DEFAULT 0,
            overall_score INTEGER DEFAULT 0,
            summary_json TEXT, -- JSON summary metrics
            full_data_json TEXT -- Full analysis JSON payload
        )
    """)

    # 2. business_searches table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS business_searches (
            id TEXT PRIMARY KEY,
            query TEXT NOT NULL,
            location TEXT NOT NULL,
            keyword TEXT NOT NULL,
            radius_km INTEGER DEFAULT 10,
            results_count INTEGER DEFAULT 0,
            websites_count INTEGER DEFAULT 0,
            provider TEXT DEFAULT 'osm_overpass',
            status TEXT DEFAULT 'completed',
            created_at TEXT NOT NULL
        )
    """)

    # 3. businesses table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS businesses (
            id TEXT PRIMARY KEY,
            search_id TEXT NOT NULL,
            name TEXT NOT NULL,
            category TEXT,
            address TEXT,
            phone TEXT,
            website TEXT,
            rating REAL,
            review_count INTEGER,
            hours TEXT,
            latitude REAL,
            longitude REAL,
            profile_url TEXT,
            social_links_json TEXT,
            source TEXT DEFAULT 'osm',
            created_at TEXT NOT NULL,
            analysis_id TEXT, -- Link to Website Analyzer if analyzed
            analysis_status TEXT, -- pending, running, completed, failed
            analysis_scores_json TEXT, -- Cached scores {overall, seo, perf, a11y, sec}
            opportunity_signals_json TEXT, -- Generated opportunity signals
            FOREIGN KEY (search_id) REFERENCES business_searches (id) ON DELETE CASCADE
        )
    """)

    # 4. batch_jobs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS batch_jobs (
            id TEXT PRIMARY KEY,
            search_id TEXT,
            title TEXT NOT NULL,
            total_items INTEGER DEFAULT 0,
            completed_items INTEGER DEFAULT 0,
            running_items INTEGER DEFAULT 0,
            queued_items INTEGER DEFAULT 0,
            failed_items INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending', -- pending, running, completed, partial, failed
            created_at TEXT NOT NULL,
            completed_at TEXT,
            items_json TEXT DEFAULT '[]' -- List of business ids and website URLs
        )
    """)

    # 5. reports table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            report_type TEXT NOT NULL, -- website_analysis, business_finder, batch_analysis
            format TEXT NOT NULL, -- xlsx, pdf, json, csv
            file_path TEXT NOT NULL,
            entity_id TEXT, -- analysis_id or search_id or batch_id
            created_at TEXT NOT NULL
        )
    """)

    # Safe migration for existing analyses table columns
    cursor.execute("PRAGMA table_info(analyses)")
    existing_cols = {col["name"] for col in cursor.fetchall()}
    columns_to_add = [
        ("security_score", "INTEGER DEFAULT 0"),
        ("ux_score", "INTEGER DEFAULT 0"),
        ("content_score", "INTEGER DEFAULT 0"),
        ("overall_score", "INTEGER DEFAULT 0"),
    ]
    for col_name, col_def in columns_to_add:
        if col_name not in existing_cols:
            try:
                cursor.execute(f"ALTER TABLE analyses ADD COLUMN {col_name} {col_def}")
            except Exception:
                pass

    # Reset any tasks that were running during a previous crash/restart
    try:
        cursor.execute("UPDATE analyses SET status = 'failed', error_message = 'Task interrupted by server reload' WHERE status IN ('running', 'pending')")
        cursor.execute("UPDATE batch_jobs SET status = 'partial', running_items = 0 WHERE status = 'running'")
    except Exception:
        pass

    conn.commit()
    conn.close()

# ----------------- ANALYSES CRUD -----------------

def create_analysis(analysis_id: str, url: str, domain: str) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO analyses (
            id, url, domain, status, created_at, progress_percent, current_step, step_logs
        ) VALUES (?, ?, ?, 'pending', ?, 0, 'Validated URL', ?)
    """, (analysis_id, url, domain, now, json.dumps(["URL validated and queued"])))
    conn.commit()
    conn.close()
    return get_analysis(analysis_id)

def update_progress(analysis_id: str, percent: int, step: str, log_message: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT step_logs FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    logs = json.loads(row["step_logs"]) if row and row["step_logs"] else []
    if log_message:
        logs.append(log_message)
    cursor.execute("""
        UPDATE analyses
        SET progress_percent = ?, current_step = ?, step_logs = ?, status = 'running'
        WHERE id = ?
    """, (percent, step, json.dumps(logs), analysis_id))
    conn.commit()
    conn.close()

def complete_analysis(
    analysis_id: str,
    crawl_duration: float,
    pages_count: int,
    seo_score: int,
    performance_score: int,
    accessibility_score: int,
    security_score: int = 0,
    ux_score: int = 0,
    content_score: int = 0,
    overall_score: int = 0,
    summary: dict = None,
    full_data: dict = None
):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute("""
        UPDATE analyses
        SET status = 'completed',
            completed_at = ?,
            crawl_duration = ?,
            progress_percent = 100,
            current_step = 'Analysis complete',
            pages_count = ?,
            seo_score = ?,
            performance_score = ?,
            accessibility_score = ?,
            security_score = ?,
            ux_score = ?,
            content_score = ?,
            overall_score = ?,
            summary_json = ?,
            full_data_json = ?
        WHERE id = ?
    """, (
        now,
        crawl_duration,
        pages_count,
        seo_score,
        performance_score,
        accessibility_score,
        security_score,
        ux_score,
        content_score,
        overall_score,
        json.dumps(summary or {}),
        json.dumps(full_data or {}),
        analysis_id
    ))

    # Also update any business in the database linked to this website
    if full_data and full_data.get("url"):
        target_url = full_data["url"].rstrip("/")
        cursor.execute("SELECT id, website FROM businesses WHERE analysis_id = ? OR website LIKE ?", 
                       (analysis_id, f"%{full_data.get('domain', '')}%"))
        biz_rows = cursor.fetchall()
        scores = {
            "overall": overall_score,
            "seo": seo_score,
            "performance": performance_score,
            "accessibility": accessibility_score,
            "security": security_score,
            "ux": ux_score
        }
        for b in biz_rows:
            cursor.execute("""
                UPDATE businesses 
                SET analysis_id = ?, analysis_status = 'completed', analysis_scores_json = ?
                WHERE id = ?
            """, (analysis_id, json.dumps(scores), b["id"]))

    conn.commit()
    conn.close()

def fail_analysis(analysis_id: str, error_message: str):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute("""
        UPDATE analyses
        SET status = 'failed',
            completed_at = ?,
            error_message = ?,
            current_step = 'Analysis failed'
        WHERE id = ?
    """, (now, error_message, analysis_id))
    conn.commit()
    conn.close()

def get_analysis(analysis_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    data = dict(row)
    data["step_logs"] = json.loads(data["step_logs"]) if data["step_logs"] else []
    data["summary"] = json.loads(data["summary_json"]) if data["summary_json"] else None
    data["full_data"] = json.loads(data["full_data_json"]) if data["full_data_json"] else None
    return data

def get_all_analyses() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, url, domain, status, created_at, completed_at, crawl_duration,
               pages_count, seo_score, performance_score, accessibility_score,
               security_score, ux_score, overall_score,
               error_message, current_step, progress_percent
        FROM analyses
        ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_analysis(analysis_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM analyses WHERE id = ?", (analysis_id,))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

# ----------------- BUSINESS FINDER CRUD -----------------

def save_business_search(search_id: str, query: str, location: str, keyword: str, radius_km: int, 
                         businesses: List[Dict[str, Any]], provider: str = "osm_overpass") -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    
    websites_count = sum(1 for b in businesses if b.get("website"))
    cursor.execute("""
        INSERT INTO business_searches (
            id, query, location, keyword, radius_km, results_count, websites_count, provider, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
    """, (search_id, query, location, keyword, radius_km, len(businesses), websites_count, provider, now))
    
    for b in businesses:
        socials = json.dumps(b.get("social_links", {}))
        opps = json.dumps(b.get("opportunity_signals", []))
        cursor.execute("""
            INSERT INTO businesses (
                id, search_id, name, category, address, phone, email, website, rating, review_count,
                hours, latitude, longitude, profile_url, social_links_json, source, created_at,
                opportunity_signals_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            b.get("id"), search_id, b.get("name"), b.get("category"), b.get("address"),
            b.get("phone"), b.get("email"), b.get("website"), b.get("rating"), b.get("review_count"),
            b.get("hours"), b.get("latitude"), b.get("longitude"), b.get("profile_url"),
            socials, b.get("source", "osm"), now, opps
        ))
    
    conn.commit()
    conn.close()
    return get_business_search(search_id)

def get_business_search(search_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM business_searches WHERE id = ?", (search_id,))
    search_row = cursor.fetchone()
    if not search_row:
        conn.close()
        return None
    
    search_data = dict(search_row)
    cursor.execute("SELECT * FROM businesses WHERE search_id = ? ORDER BY name ASC", (search_id,))
    biz_rows = cursor.fetchall()
    conn.close()
    
    businesses = []
    for r in biz_rows:
        item = dict(r)
        item["social_links"] = json.loads(item["social_links_json"]) if item["social_links_json"] else {}
        item["analysis_scores"] = json.loads(item["analysis_scores_json"]) if item["analysis_scores_json"] else None
        item["opportunity_signals"] = json.loads(item["opportunity_signals_json"]) if item["opportunity_signals_json"] else []
        businesses.append(item)
        
    search_data["businesses"] = businesses
    return search_data

def get_all_business_searches() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, query, location, keyword, radius_km, results_count, websites_count, provider, status, created_at
        FROM business_searches
        ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_business_search(search_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM businesses WHERE search_id = ?", (search_id,))
    cursor.execute("DELETE FROM business_searches WHERE id = ?", (search_id,))
    affected = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return affected

def clear_all_business_searches() -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM businesses")
    cursor.execute("DELETE FROM business_searches")
    conn.commit()
    conn.close()
    return True

def get_all_businesses() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT b.*, s.location as search_location, s.keyword as search_keyword, s.query as search_query
        FROM businesses b
        LEFT JOIN business_searches s ON b.search_id = s.id
        ORDER BY b.created_at DESC, b.name ASC
    """)
    rows = cursor.fetchall()
    conn.close()
    businesses = []
    for r in rows:
        item = dict(r)
        item["social_links"] = json.loads(item["social_links_json"]) if item.get("social_links_json") else {}
        item["analysis_scores"] = json.loads(item["analysis_scores_json"]) if item.get("analysis_scores_json") else None
        item["opportunity_signals"] = json.loads(item["opportunity_signals_json"]) if item.get("opportunity_signals_json") else []
        businesses.append(item)
    return businesses

def get_business_by_id(biz_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM businesses WHERE id = ?", (biz_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    item = dict(row)
    item["social_links"] = json.loads(item["social_links_json"]) if item["social_links_json"] else {}
    item["analysis_scores"] = json.loads(item["analysis_scores_json"]) if item["analysis_scores_json"] else None
    item["opportunity_signals"] = json.loads(item["opportunity_signals_json"]) if item["opportunity_signals_json"] else []
    return item

def update_business_analysis_link(biz_id: str, analysis_id: str, status: str = "running"):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE businesses
        SET analysis_id = ?, analysis_status = ?
        WHERE id = ?
    """, (analysis_id, status, biz_id))
    conn.commit()
    conn.close()

# ----------------- BATCH ANALYSIS CRUD -----------------

def create_batch_job(batch_id: str, title: str, items: List[Dict[str, Any]], search_id: Optional[str] = None) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO batch_jobs (
            id, search_id, title, total_items, completed_items, running_items,
            queued_items, failed_items, status, created_at, items_json
        ) VALUES (?, ?, ?, ?, 0, 0, ?, 0, 'queued', ?, ?)
    """, (batch_id, search_id, title, len(items), len(items), now, json.dumps(items)))
    conn.commit()
    conn.close()
    return get_batch_job(batch_id)

def update_batch_job_progress(batch_id: str, completed: int, running: int, queued: int, failed: int, 
                              status: str, items: List[Dict[str, Any]]):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() if status in ('completed', 'failed', 'partial') else None
    cursor.execute("""
        UPDATE batch_jobs
        SET completed_items = ?, running_items = ?, queued_items = ?, failed_items = ?,
            status = ?, items_json = ?, completed_at = COALESCE(?, completed_at)
        WHERE id = ?
    """, (completed, running, queued, failed, status, json.dumps(items), now, batch_id))
    conn.commit()
    conn.close()

def get_batch_job(batch_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM batch_jobs WHERE id = ?", (batch_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    data = dict(row)
    data["items"] = json.loads(data["items_json"]) if data["items_json"] else []
    return data

def get_all_batch_jobs() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, search_id, title, total_items, completed_items, running_items, queued_items, failed_items, status, created_at, completed_at
        FROM batch_jobs
        ORDER BY created_at DESC
    """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ----------------- DASHBOARD STATS -----------------

def get_dashboard_stats() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    # Total analyses
    cursor.execute("SELECT COUNT(*), AVG(overall_score), AVG(seo_score) FROM analyses WHERE status = 'completed'")
    res = cursor.fetchone()
    total_analyzed = res[0] or 0
    avg_score = round(res[1] or 0)
    
    # Total businesses found
    cursor.execute("SELECT COUNT(*) FROM businesses")
    total_businesses = cursor.fetchone()[0] or 0
    
    # Total searches
    cursor.execute("SELECT COUNT(*) FROM business_searches")
    total_searches = cursor.fetchone()[0] or 0
    
    # Issues detected
    cursor.execute("SELECT full_data_json FROM analyses WHERE status = 'completed' LIMIT 50")
    rows = cursor.fetchall()
    total_issues = 0
    for r in rows:
        if r["full_data_json"]:
            try:
                data = json.loads(r["full_data_json"])
                issues = data.get("advantages_drawbacks", {}).get("drawbacks", [])
                total_issues += len(issues)
            except Exception:
                pass
                
    # Recent activity
    cursor.execute("""
        SELECT id, url, domain, overall_score, seo_score, performance_score, created_at, 'website' as type
        FROM analyses
        ORDER BY created_at DESC
        LIMIT 6
    """)
    recent_analyses = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("""
        SELECT id, query, location, keyword, results_count, websites_count, created_at, 'search' as type
        FROM business_searches
        ORDER BY created_at DESC
        LIMIT 6
    """)
    recent_searches = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    
    return {
        "total_websites_analyzed": total_analyzed,
        "total_businesses_found": total_businesses,
        "total_searches": total_searches,
        "total_issues_detected": total_issues,
        "average_website_score": avg_score,
        "recent_analyses": recent_analyses,
        "recent_searches": recent_searches
    }
