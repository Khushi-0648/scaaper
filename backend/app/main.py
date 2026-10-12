import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from app.database.db import init_db
from app.api.router import router

app = FastAPI(
    title="WebIntel AI API",
    description="WebIntel AI — Discover Businesses. Analyze Websites. Find Opportunities.",
    version="2.0.0"
)

# Enable CORS securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

import time
from collections import defaultdict
from fastapi.responses import JSONResponse

# Simple, high-performance in-memory sliding rate limiter
# Tracks timestamp window per client IP
RATE_LIMIT_STORE = defaultdict(list)
HEAVY_ENDPOINTS = {"/api/websites/analyze", "/api/analyze", "/api/business/search", "/api/business/batch-analyze"}

# Enforce Request Size & Rate Limiting Middleware
@app.middleware("http")
async def security_and_rate_limiting_middleware(request: Request, call_next):
    # 1. Enforce Maximum Request Body Size (2 MB)
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > 2 * 1024 * 1024:
        return JSONResponse(
            status_code=413,
            content={"detail": "Request payload too large. Maximum permitted size is 2 MB."}
        )

    # 2. Rate Limiting per Client IP
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    path = request.url.path

    # Clean requests older than 60 seconds
    ip_history = RATE_LIMIT_STORE[client_ip]
    RATE_LIMIT_STORE[client_ip] = [ts for ts in ip_history if now - ts < 60]

    # Limit check: 120 req/min for general, 25 req/min for expensive crawler/search jobs
    limit = 25 if any(path.startswith(ep) for ep in HEAVY_ENDPOINTS) else 120
    if len(RATE_LIMIT_STORE[client_ip]) >= limit:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please slow down and try again shortly."},
            headers={"Retry-After": "60"}
        )

    RATE_LIMIT_STORE[client_ip].append(now)

    response = await call_next(request)

    # 3. Security HTTP Response Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["X-Permitted-Cross-Domain-Policies"] = "none"

    if path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"

    return response

# Initialize database tables
@app.on_event("startup")
def on_startup():
    init_db()

# Mount API routes
app.include_router(router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "WebIntel AI API", "version": "2.0.0"}

# Mount production frontend build with strict Path Traversal protection
dist_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist"))
assets_dir = os.path.join(dist_dir, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

if os.path.exists(dist_dir):
    index_file = os.path.join(dist_dir, "index.html")
    
    @app.get("/{full_path:path}")
    async def serve_spa_frontend(request: Request, full_path: str):
        # Do not intercept /api or /health routes
        if full_path.startswith("api/") or full_path == "health":
            return JSONResponse(status_code=404, content={"detail": "Not Found"})

        # Canonicalize path and prevent Path Traversal attacks
        target_path = os.path.abspath(os.path.join(dist_dir, full_path))
        if target_path.startswith(dist_dir) and os.path.isfile(target_path):
            return FileResponse(target_path)

        return FileResponse(index_file)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

