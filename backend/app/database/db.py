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
            summary_json TEXT, -- JSON summary metrics
            full_data_json TEXT -- Full analysis JSON payload
        )
    """)
    conn.commit()
    conn.close()

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
    summary: dict,
    full_data: dict
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
        json.dumps(summary),
        json.dumps(full_data),
        analysis_id
    ))
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
