import uuid
import time
import threading
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor
from app.crawler.validator import validate_and_normalize_url
from app.crawler.pipeline import execute_analysis_job
from app.database.db import (
    create_batch_job,
    update_batch_job_progress,
    get_batch_job,
    create_analysis,
    update_business_analysis_link
)

class BatchAnalysisManager:
    def __init__(self, max_concurrency: int = 2):
        self.max_concurrency = max_concurrency
        self.executor = ThreadPoolExecutor(max_workers=max_concurrency)

    def start_batch_job(self, title: str, items: List[Dict[str, Any]], search_id: Optional[str] = None) -> Dict[str, Any]:
        """
        items: list of dicts: {"business_id": "...", "website": "...", "business_name": "..."}
        """
        batch_id = str(uuid.uuid4())
        
        # Prepare items with status
        batch_items = []
        for it in items:
            raw_url = it.get("website", "").strip()
            if not raw_url:
                continue
            is_valid, norm_url, domain = validate_and_normalize_url(raw_url)
            batch_items.append({
                "business_id": it.get("business_id"),
                "business_name": it.get("business_name", domain),
                "raw_url": raw_url,
                "url": norm_url if is_valid else raw_url,
                "domain": domain if is_valid else "",
                "valid": is_valid,
                "status": "queued",
                "analysis_id": None,
                "error": None if is_valid else "Invalid URL format"
            })

        record = create_batch_job(batch_id, title, batch_items, search_id)

        # Launch supervisor thread
        t = threading.Thread(target=self._process_batch, args=(batch_id, batch_items), daemon=True)
        t.start()

        return record

    def _process_batch(self, batch_id: str, items: List[Dict[str, Any]]):
        total = len(items)
        completed = 0
        failed = 0

        # Mark initially running
        update_batch_job_progress(batch_id, completed=0, running=1, queued=total, failed=0, status="running", items=items)

        for i, item in enumerate(items):
            if not item.get("valid"):
                item["status"] = "failed"
                failed += 1
                update_batch_job_progress(batch_id, completed=completed, running=1, queued=total - completed - failed, failed=failed, status="running", items=items)
                continue

            item["status"] = "running"
            analysis_id = str(uuid.uuid4())
            item["analysis_id"] = analysis_id
            
            if item.get("business_id"):
                update_business_analysis_link(item["business_id"], analysis_id, "running")

            update_batch_job_progress(batch_id, completed=completed, running=1, queued=total - completed - failed - 1, failed=failed, status="running", items=items)

            create_analysis(analysis_id, item["url"], item["domain"])

            try:
                # Execute single crawl with gentle limits
                opts = {
                    "max_pages": 10,
                    "crawl_delay": 0.3,
                    "same_domain_only": True,
                    "follow_external": False,
                    "js_rendering": "auto"
                }
                execute_analysis_job(analysis_id, item["url"], item["domain"], opts)
                item["status"] = "completed"
                completed += 1
                if item.get("business_id"):
                    update_business_analysis_link(item["business_id"], analysis_id, "completed")
            except Exception as e:
                item["status"] = "failed"
                item["error"] = str(e)
                failed += 1
                if item.get("business_id"):
                    update_business_analysis_link(item["business_id"], analysis_id, "failed")

            # Pause between batch items to protect network & rate limits
            time.sleep(1.0)
            update_batch_job_progress(batch_id, completed=completed, running=0, queued=max(0, total - completed - failed), failed=failed, status="running", items=items)

        final_status = "completed" if failed == 0 else ("failed" if completed == 0 else "partial")
        update_batch_job_progress(batch_id, completed=completed, running=0, queued=0, failed=failed, status=final_status, items=items)

batch_manager = BatchAnalysisManager()
