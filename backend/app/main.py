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

# Enforce Security HTTP Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
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

# Mount production frontend build if present
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
            return {"detail": "Not Found"}
        target_path = os.path.join(dist_dir, full_path)
        if os.path.isfile(target_path):
            return FileResponse(target_path)
        return FileResponse(index_file)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
