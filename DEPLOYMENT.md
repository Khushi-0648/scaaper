# 🚀 WebIntel AI — Deployment Guide & Production Architecture

This guide covers all deployment pathways for WebIntel AI (Docker, Docker Compose, Render, Railway, AWS, and unified single-container deployment).

---

## 🏗️ Architecture Overview

```
                      [ Client (Browser / Mobile) ]
                                   │
                                   ▼
                   [ Nginx / Cloudflare CDN Reverse Proxy ]
                     │                                 │
                     ▼                                 ▼
      [ Frontend SPA (React + Tailwind) ]    [ FastAPI Backend (Python 3.12) ]
                                                       │
                                          ┌────────────┴────────────┐
                                          ▼                         ▼
                                   [ SQLite DB / ]           [ Local / S3 ]
                                   [ PostgreSQL ]          [ Excel Reports ]
```

---

## 🐳 Pathway 1: One-Click Docker Compose (Recommended for VPS / Cloud VMs)

### Prerequisites:
- Docker & Docker Compose installed on your server.

### Steps:
```bash
# 1. Clone repository & enter directory
git clone <your-repo-url>
cd website-analyzer

# 2. Configure environment
cp backend/.env.example backend/.env
# (Optional: Edit backend/.env to add GEMINI_API_KEY)

# 3. Build & launch containers in background
docker compose up -d --build

# 4. Check container status
docker compose ps
```

* **Frontend UI**: `http://<your-server-ip>:80` (or `http://localhost:3000`)
* **Backend API Docs**: `http://<your-server-ip>:8000/docs`
* **Health Check**: `http://<your-server-ip>:8000/health`

---

## ☁️ Pathway 2: Free / Low-Cost PaaS (Render, Railway, or Fly.io)

### Unified Monolithic Container on Render / Railway:
WebIntel AI is configured so that FastAPI automatically serves the built React frontend (`frontend/dist`) directly from the backend server!

1. In Render or Railway, create a **New Web Service**.
2. Connect your Git repository.
3. Configure settings:
   - **Environment**: `Python 3.12` or `Docker`
   - **Build Command**:
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
4. Set Environment Variables:
   - `PORT` = `8000` (or host provided)
   - `GEMINI_API_KEY` = `(optional)`

---

## ⚡ Pathway 3: Decoupled (Vercel Frontend + Render Backend)

### Deploy Backend (FastAPI):
- Root Directory: `backend`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Deploy Frontend (Vercel / Netlify):
- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_URL` = `https://your-backend.onrender.com`

---

## 🛠️ Production Verification Checklist

- [x] **Smart Security Shield Handler**: Websites with Cloudflare/WAF bot protection are gracefully recognized with full security telemetry.
- [x] **Top Priority Contact Intelligence**: Multi-pattern email regex, obfuscation decoding, WhatsApp parsing, and click-to-call phone discovery.
- [x] **Single-Sheet Master Excel Export**: Complete audit datasets and business intelligence exported in one clean, unified Excel worksheet.
- [x] **Mobile Responsive UI**: Responsive tables, touch-friendly tap targets, and smooth animations.
- [x] **Production Nginx Proxy**: Reverse proxying `/api/` requests and supporting HTML5 pushState SPA routing.
- [x] **CORS Security**: Strict HTTP methods and headers enabled for production safety.
