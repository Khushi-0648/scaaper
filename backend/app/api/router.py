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
from app.database.db import (
    create_analysis,
    get_analysis,
    get_all_analyses,
    delete_analysis
)

router = APIRouter(prefix="/api")

class AnalyzeRequest(BaseModel):
    url: str
    max_pages: Optional[int] = 25
    crawl_delay: Optional[float] = 0.2
    same_domain_only: Optional[bool] = True
    follow_external: Optional[bool] = False
    js_rendering: Optional[str] = "auto"

class ValidateUrlRequest(BaseModel):
    url: str

@router.post("/validate-url")
def validate_url_endpoint(req: ValidateUrlRequest):
    is_valid, norm_url_or_err, domain = validate_and_normalize_url(req.url)
    if not is_valid:
        return {"valid": False, "error": norm_url_or_err}
    return {"valid": True, "normalized_url": norm_url_or_err, "domain": domain}

@router.post("/analyze")
def start_analysis(req: AnalyzeRequest, background_tasks: BackgroundTasks):
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
def download_excel(analysis_id: str):
    record = get_analysis(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis ID not found.")

    excel_path = os.path.join(REPORTS_DIR, f"{analysis_id}.xlsx")
    if not os.path.exists(excel_path):
        raise HTTPException(status_code=404, detail="Excel report not generated or missing.")

    filename = f"{record['domain']}_analysis.xlsx"
    return FileResponse(
        path=excel_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

@router.get("/analyze/{analysis_id}/json")
def download_json(analysis_id: str):
    record = get_analysis(analysis_id)
    if not record or not record.get("full_data"):
        raise HTTPException(status_code=404, detail="Analysis data not found.")

    content = json.dumps(record["full_data"], indent=2)
    filename = f"{record['domain']}_analysis.json"
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/analyze/{analysis_id}/csv")
def download_csv(analysis_id: str):
    record = get_analysis(analysis_id)
    if not record or not record.get("full_data"):
        raise HTTPException(status_code=404, detail="Analysis data not found.")

    pages = record["full_data"].get("pages", [])
    df = pd.DataFrame(pages)
    csv_str = df.to_csv(index=False)
    filename = f"{record['domain']}_pages.csv"
    return Response(
        content=csv_str,
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/history")
def list_history():
    return get_all_analyses()

@router.delete("/history/{analysis_id}")
def remove_history(analysis_id: str):
    success = delete_analysis(analysis_id)
    if not success:
        raise HTTPException(status_code=404, detail="Analysis record not found.")

    # Remove excel if exists
    excel_path = os.path.join(REPORTS_DIR, f"{analysis_id}.xlsx")
    if os.path.exists(excel_path):
        try:
            os.remove(excel_path)
        except Exception:
            pass

    return {"deleted": True, "id": analysis_id}
