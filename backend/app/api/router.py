import uuid
import os
import io
import json
import pandas as pd
from threading import Thread
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel, HttpUrl
from typing import Optional, List, Dict, Any

from app.crawler.validator import validate_and_normalize_url
from app.crawler.pipeline import execute_analysis_job, REPORTS_DIR
from app.providers.manager import search_manager, normalize_business_query
from app.services.batch_manager import batch_manager
from app.analyzers.competitor import compare_competitors
from app.exporters.excel_exporter import generate_business_excel_report
from app.exporters.pdf_exporter import generate_business_pdf_report
from app.database.db import (
    create_analysis,
    get_analysis,
    get_all_analyses,
    delete_analysis,
    save_business_search,
    get_business_search,
    get_all_business_searches,
    delete_business_search,
    clear_all_business_searches,
    get_all_businesses,
    get_batch_job,
    get_all_batch_jobs,
    get_dashboard_stats
)

router = APIRouter(prefix="/api")

import re
from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, List, Dict, Any

def sanitize_filename(name: str) -> str:
    clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', str(name)).strip('_')
    return clean[:100] or "report"

def validate_safe_id(id_val: str) -> str:
    if not id_val or not re.match(r'^[a-zA-Z0-9_-]{1,64}$', id_val):
        raise HTTPException(status_code=400, detail="Invalid resource identifier format.")
    return id_val

def safe_report_path(filename: str) -> str:
    full_path = os.path.abspath(os.path.join(REPORTS_DIR, filename))
    if not full_path.startswith(os.path.abspath(REPORTS_DIR)):
        raise HTTPException(status_code=400, detail="Path traversal violation detected.")
    return full_path

# ================= DATA MODELS =================

class AnalyzeRequest(BaseModel):
    url: str = Field(..., max_length=2048)
    max_pages: Optional[int] = Field(25, ge=1, le=50)
    crawl_delay: Optional[float] = Field(0.2, ge=0.0, le=5.0)
    same_domain_only: Optional[bool] = True
    follow_external: Optional[bool] = False
    js_rendering: Optional[str] = "auto"

class ValidateUrlRequest(BaseModel):
    url: str = Field(..., max_length=2048)

class BusinessSearchRequest(BaseModel):
    query: Optional[str] = Field(None, max_length=250)
    location: Optional[str] = Field(None, max_length=150)
    keyword: Optional[str] = Field(None, max_length=150)
    radius_km: Optional[int] = Field(10, ge=1, le=100)
    limit: Optional[int] = Field(50, ge=1, le=50)
    provider: Optional[str] = None
    refresh: Optional[bool] = False
    offset: Optional[int] = Field(0, ge=0, le=500)
    exclude_names: Optional[List[str]] = Field([], max_length=100)

class BatchAnalyzeRequest(BaseModel):
    title: Optional[str] = Field("Batch Website Analysis", max_length=200)
    search_id: Optional[str] = Field(None, max_length=64)
    items: List[Dict[str, Any]] = Field(..., max_length=50)

class CompetitorCompareRequest(BaseModel):
    analysis_ids: List[str]

# ================= DASHBOARD & VALIDATION =================

@router.get("/dashboard/stats")
def get_stats():
    return get_dashboard_stats()

@router.post("/validate-url")
def validate_url_endpoint(req: ValidateUrlRequest):
    is_valid, norm_url_or_err, domain = validate_and_normalize_url(req.url)
    if not is_valid:
        return {"valid": False, "error": norm_url_or_err}
    return {"valid": True, "normalized_url": norm_url_or_err, "domain": domain}

# ================= MODULE 1: WEBSITE ANALYZER =================

@router.post("/analyze")
@router.post("/websites/analyze")
def start_analysis(req: AnalyzeRequest):
    is_valid, norm_url_or_err, domain = validate_and_normalize_url(req.url)
    if not is_valid:
        raise HTTPException(status_code=400, detail=norm_url_or_err)

    analysis_id = str(uuid.uuid4())
    create_analysis(analysis_id, norm_url_or_err, domain)

    options = {
        "max_pages": req.max_pages or 25,
        "crawl_delay": req.crawl_delay if req.crawl_delay is not None else 0.2,
        "same_domain_only": req.same_domain_only if req.same_domain_only is not None else True,
        "follow_external": req.follow_external or False,
        "js_rendering": req.js_rendering or "auto"
    }

    # Execute in background thread to never block FastAPI event loop
    thread = Thread(target=execute_analysis_job, args=(analysis_id, norm_url_or_err, domain, options), daemon=True)
    thread.start()

    return {
        "id": analysis_id,
        "status": "pending",
        "url": norm_url_or_err,
        "domain": domain,
        "message": "Analysis started successfully in background."
    }

@router.get("/analyze/{analysis_id}/status")
@router.get("/websites/{analysis_id}/status")
def get_analysis_status(analysis_id: str):
    record = get_analysis(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis ID not found.")

    return {
        "id": record["id"],
        "status": record["status"],
        "progress_percent": record["progress_percent"],
        "current_step": record["current_step"],
        "step_logs": record["step_logs"],
        "error_message": record["error_message"],
        "completed_at": record["completed_at"],
        "pages_count": record["pages_count"]
    }

@router.get("/analyze/{analysis_id}/results")
@router.get("/websites/{analysis_id}")
def get_analysis_results(analysis_id: str):
    record = get_analysis(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis ID not found.")

    if record["status"] == "failed":
        return {
            "id": record["id"],
            "status": "failed",
            "error_message": record["error_message"]
        }

    if record["status"] != "completed":
        return {
            "id": record["id"],
            "status": record["status"],
            "progress_percent": record["progress_percent"],
            "current_step": record["current_step"]
        }

    return record["full_data"]

@router.get("/analyze/{analysis_id}/excel")
@router.get("/websites/{analysis_id}/excel")
def download_excel(analysis_id: str):
    validate_safe_id(analysis_id)
    record = get_analysis(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis ID not found.")

    excel_path = safe_report_path(f"{analysis_id}.xlsx")
    if not os.path.exists(excel_path):
        raise HTTPException(status_code=404, detail="Excel report not generated or missing.")

    filename = f"{sanitize_filename(record['domain'])}_webintel_report.xlsx"
    return FileResponse(
        path=excel_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/analyze/{analysis_id}/pdf")
@router.get("/websites/{analysis_id}/pdf")
def download_pdf(analysis_id: str):
    validate_safe_id(analysis_id)
    record = get_analysis(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis ID not found.")

    pdf_path = safe_report_path(f"{analysis_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF report not generated or missing.")

    filename = f"{sanitize_filename(record['domain'])}_webintel_audit.pdf"
    return FileResponse(
        path=pdf_path,
        filename=filename,
        media_type="application/pdf"
    )

@router.get("/analyze/{analysis_id}/json")
@router.get("/websites/{analysis_id}/json")
def download_json(analysis_id: str):
    validate_safe_id(analysis_id)
    record = get_analysis(analysis_id)
    if not record or not record.get("full_data"):
        raise HTTPException(status_code=404, detail="Analysis data not found.")

    content = json.dumps(record["full_data"], indent=2)
    filename = f"{sanitize_filename(record['domain'])}_analysis.json"
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/analyze/{analysis_id}/csv")
@router.get("/websites/{analysis_id}/csv")
def download_csv(analysis_id: str):
    validate_safe_id(analysis_id)
    record = get_analysis(analysis_id)
    if not record or not record.get("full_data"):
        raise HTTPException(status_code=404, detail="Analysis data not found.")

    pages = record["full_data"].get("pages", [])
    df = pd.DataFrame(pages)
    csv_str = df.to_csv(index=False)
    filename = f"{sanitize_filename(record['domain'])}_pages.csv"
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# ================= MODULE 2: BUSINESS FINDER =================

@router.post("/business/search")
@router.post("/businesses/search")
def search_businesses_endpoint(req: BusinessSearchRequest):
    location, keyword, radius_km = normalize_business_query(
        raw_query=req.query or "",
        raw_location=req.location or "",
        raw_keyword=req.keyword or "",
        radius_km=req.radius_km or 10
    )

    try:
        businesses = search_manager.search(
            location=location,
            keyword=keyword,
            radius_km=radius_km,
            limit=req.limit or 50,
            provider_preference=req.provider,
            refresh=req.refresh or False,
            offset=req.offset or 0,
            exclude_names=req.exclude_names or []
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    detected_provider = "google_places" if (req.provider == "google" or search_manager.google_provider.api_key) else "osm_global"
    search_id = str(uuid.uuid4())
    saved_record = save_business_search(
        search_id=search_id,
        query=f"{keyword} in {location}",
        location=location,
        keyword=keyword,
        radius_km=radius_km,
        businesses=[b.model_dump() for b in businesses],
        provider=detected_provider
    )

    return saved_record

@router.get("/business/search/{search_id}")
def get_business_search_endpoint(search_id: str):
    record = get_business_search(search_id)
    if not record:
        raise HTTPException(status_code=404, detail="Business search not found.")
    return record

@router.get("/business/searches")
def get_all_business_searches_endpoint():
    return get_all_business_searches()

@router.delete("/business/search/{search_id}")
def delete_business_search_endpoint(search_id: str):
    validate_safe_id(search_id)
    success = delete_business_search(search_id)
    if not success:
        raise HTTPException(status_code=404, detail="Business search not found or already deleted.")
    return {"status": "deleted", "id": search_id}

@router.delete("/business/searches")
def clear_all_business_searches_endpoint():
    clear_all_business_searches()
    return {"status": "all_cleared", "message": "All recent business searches cleared successfully"}

@router.get("/business/search/{search_id}/excel")
def download_business_excel(search_id: str):
    validate_safe_id(search_id)
    record = get_business_search(search_id)
    if not record:
        raise HTTPException(status_code=404, detail="Business search not found.")

    output_path = safe_report_path(f"business_{search_id}.xlsx")
    generate_business_excel_report(record, output_path)

    loc = sanitize_filename(record.get('location', 'location'))
    kw = sanitize_filename(record.get('keyword', 'businesses'))
    filename = f"{loc}_{kw}_businesses.xlsx"
    return FileResponse(
        path=output_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/business/export/all/excel")
def download_all_businesses_excel():
    businesses = get_all_businesses()
    if not businesses:
        raise HTTPException(status_code=404, detail="No businesses found in directory.")

    output_path = safe_report_path("all_businesses_directory.xlsx")
    search_data = {
        "query": "All Discovered Businesses",
        "location": "Global Directory",
        "keyword": "All Categories",
        "businesses": businesses,
        "provider": "Google Places / Global Directory"
    }
    generate_business_excel_report(search_data, output_path)
    return FileResponse(
        path=output_path,
        filename="All_Discovered_Businesses.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/business/search/{search_id}/pdf")
def download_business_pdf(search_id: str):
    validate_safe_id(search_id)
    record = get_business_search(search_id)
    if not record:
        raise HTTPException(status_code=404, detail="Business search not found.")

    output_path = safe_report_path(f"business_{search_id}.pdf")
    generate_business_pdf_report(record, output_path)

    loc = sanitize_filename(record.get('location', 'location'))
    kw = sanitize_filename(record.get('keyword', 'opportunities'))
    filename = f"{loc}_{kw}_opportunities.pdf"
    return FileResponse(
        path=output_path,
        filename=filename,
        media_type="application/pdf"
    )

# ================= BRIDGE: BATCH ANALYSIS =================

@router.post("/business/batch-analyze")
def start_batch_analysis_endpoint(req: BatchAnalyzeRequest):
    if not req.items:
        raise HTTPException(status_code=400, detail="No businesses or website URLs provided for batch analysis.")

    job = batch_manager.start_batch_job(
        title=req.title or "Batch Website Analysis",
        items=req.items,
        search_id=req.search_id
    )
    return job

@router.get("/batch/{batch_id}")
@router.get("/batch/{batch_id}/status")
def get_batch_status_endpoint(batch_id: str):
    record = get_batch_job(batch_id)
    if not record:
        raise HTTPException(status_code=404, detail="Batch job not found.")
    return record

@router.get("/batch-jobs")
def get_all_batch_jobs_endpoint():
    return get_all_batch_jobs()

# ================= COMPETITOR COMPARISON =================

@router.post("/competitor/compare")
def compare_competitors_endpoint(req: CompetitorCompareRequest):
    if len(req.analysis_ids) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 analysis IDs to perform competitor benchmarking.")

    analyses = []
    for aid in req.analysis_ids[:5]:
        record = get_analysis(aid)
        if record and record.get("full_data"):
            analyses.append(record["full_data"])

    if len(analyses) < 2:
        raise HTTPException(status_code=400, detail="Could not load completed analyses for the selected IDs.")

    return compare_competitors(analyses)

# ================= HISTORY & SETTINGS =================

@router.get("/history")
def list_history():
    return get_all_analyses()

@router.delete("/history/{analysis_id}")
def remove_history(analysis_id: str):
    validate_safe_id(analysis_id)
    success = delete_analysis(analysis_id)
    if not success:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    # Remove excel / pdf safely if exists
    for ext in [".xlsx", ".pdf"]:
        p = safe_report_path(f"{analysis_id}{ext}")
        if os.path.exists(p):
            try:
                os.remove(p)
            except Exception:
                pass

    return {"deleted": True, "id": analysis_id}

@router.get("/reports")
def list_reports():
    analyses = get_all_analyses()
    searches = get_all_business_searches()
    
    reports = []
    for a in analyses:
        if a.get("status") == "completed":
            reports.append({
                "id": a["id"],
                "type": "website",
                "title": f"Website Audit — {a['domain']}",
                "date": a.get("completed_at") or a.get("created_at"),
                "excel_url": f"/api/websites/{a['id']}/excel",
                "pdf_url": f"/api/websites/{a['id']}/pdf",
                "json_url": f"/api/websites/{a['id']}/json"
            })
    for s in searches:
        reports.append({
            "id": s["id"],
            "type": "business",
            "title": f"Business Intelligence — {s['keyword']} in {s['location']}",
            "date": s.get("created_at"),
            "excel_url": f"/api/business/search/{s['id']}/excel",
            "pdf_url": f"/api/business/search/{s['id']}/pdf",
            "json_url": None
        })
    return reports
