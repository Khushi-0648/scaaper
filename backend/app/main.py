import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from app.database.db import init_db
from app.api.router import router

app = FastAPI(
    title="Website Analyzer API",
    description="Professional Web Crawler, SEO, Technical, Accessibility & Feature Analyzer API",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables
@app.on_event("startup")
def on_startup():
    init_db()

# Mount API routes
app.include_router(router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Website Analyzer API"}

# Mount production frontend build if present
dist_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "dist"))
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
