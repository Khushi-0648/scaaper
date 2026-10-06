# Website Analyzer 🔍

A modern, professional full-stack web application that allows users to input any publicly accessible website URL, crawl and audit its pages, extract comprehensive technical metrics and 30+ interactive features, identify evidence-based advantages and drawbacks, and export complete reports into a multi-sheet Microsoft Excel (`.xlsx`) workbook.

---

## 🌟 Key Features

1. **Intelligent Web Crawler**
   - Configurable limits (10, 25, 50, 100 pages), crawl delays, and domain restrictions.
   - Respects `robots.txt` guidelines and extracts `/sitemap.xml` entries.
   - Non-blocking asynchronous background execution with real-time progress updates.

2. **30+ Website Features Detection**
   - Inspects DOM, scripts, and network endpoints to detect capabilities: Login, Registration, Search, Shopping Cart, Checkout, Payment Gateways (Stripe, PayPal, etc.), Newsletter, Contact Form, Blog, Comments, Reviews, Dark Mode, Language Pickers, Video, Maps, and more.
   - Every detected feature provides exact **Evidence**, **Detected On URL**, and **Confidence Level** (High, Medium, Low).

3. **In-Depth SEO Audit (0–100 Score)**
   - Audits Title length, Meta Description, H1/H2 heading hierarchy, Canonical tags, Open Graph cards (Facebook/LinkedIn), Twitter/X Card meta, Image ALT tags ratio, robots indexing directives, and duplicate titles.

4. **Technical & Security Stack Fingerprinting**
   - Identifies frontend frameworks (React, Next.js, Vue, Angular), CMS (WordPress, Shopify), backends (Laravel, Django, Node.js), CSS frameworks (Tailwind, Bootstrap), and CDNs (Cloudflare, CloudFront, Fastly).
   - Audits essential HTTP security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy).

5. **Performance & Accessibility Auditing**
   - Measures response latency (TTFB in milliseconds), initial HTML weight, asset counts, render-blocking `<head>` scripts, and compression (Brotli/Gzip).
   - Audits WCAG baselines: missing image ALT tags, document `lang` attributes, unlabeled form controls, empty icon buttons, and heading outlines.

6. **Evidence-Grounded Advantages & Drawbacks**
   - **Advantages:** Highlights confirmed positive attributes (e.g. mobile responsive viewport, valid TLS, fast TTFB).
   - **Drawbacks:** Categorized into *Confirmed Issue*, *Potential Issue*, or *Not Detected* with concrete evidence.
   - **Missing Features Checklist:** Uses neutral status *"Not detected during the crawl"* rather than assuming defects.

7. **AI Analysis Layer (Configurable)**
   - Synthesizes executive summaries, UX observations, SEO strategies, and prioritized recommendations.
   - Supports live **Google Gemini API** (`GEMINI_API_KEY`) or an offline deterministic synthesis engine.

8. **Comprehensive 10-Sheet Excel Export (`.xlsx`)**
   - Generates professionally styled workbooks using `openpyxl`:
     - Sheet 1: **Overview** (Target URL, domain, scores, technologies, timestamp)
     - Sheet 2: **Features** (Feature name, status, category, confidence, evidence)
     - Sheet 3: **Pages** (URLs, HTTP status, title, H1, word count, internal/external links)
     - Sheet 4: **SEO** (Checks, status, severity, recommendations)
     - Sheet 5: **Technical** (Detected technologies, security headers)
     - Sheet 6: **Performance** (Metrics, response time, compression, issues)
     - Sheet 7: **Accessibility** (Deficiencies, severity, affected pages, recommendations)
     - Sheet 8: **Advantages** (Verified positive characteristics and evidence)
     - Sheet 9: **Drawbacks** (Classified issues with severity and remediation)
     - Sheet 10: **Recommendations** (Prioritized actionable improvements)
   - Auto-fitted column widths, freeze panes, bold styled headers, and auto-filters.

9. **Analysis History & Persistence**
   - Stores all analyses in local SQLite (`backend/data/analyzer.db`).
   - Reopen past analysis dashboards or redownload generated Excel reports anytime.

10. **SSRF & Security Safeguards**
    - Blocks private IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, loopbacks 127.0.0.1, ::1).
    - Protects local infrastructure and blocks malicious redirects.

---

## 🛠️ Technology Stack

- **Backend:** Python 3.12, FastAPI, Uvicorn, Requests, BeautifulSoup4, lxml, openpyxl, Pandas, Pydantic
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React icons
- **Database:** SQLite3
- **Export Engine:** openpyxl

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Python 3.10+ (Python 3.12 recommended)
- Node.js 18+ & npm

### Method 1: One-Click Startup (Windows)
Double-click `run.bat` in the project root:
```bat
run.bat
```
This automatically starts both the backend on `http://127.0.0.1:8000` and the React frontend on `http://localhost:5173`.

---

### Method 2: Manual Terminal Startup

#### 1. Start the Backend
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI documentation is accessible at `http://127.0.0.1:8000/docs`.

#### 2. Start the Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## ⚙️ Environment Configuration

In `backend/.env` (or copy from `.env.example`):
```env
PORT=8000
HOST=0.0.0.0

# Optional: Google Gemini API Key
# If omitted, the deterministic evidence synthesis engine runs offline with zero API keys required.
GEMINI_API_KEY=
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/validate-url` | Validates URL format and tests SSRF safety |
| `POST` | `/api/analyze` | Initiates asynchronous crawl and analysis job |
| `GET` | `/api/analyze/{id}/status` | Polls progress percentage and live step logs |
| `GET` | `/api/analyze/{id}/results` | Retrieves complete analysis JSON data payload |
| `GET` | `/api/analyze/{id}/excel` | Downloads generated Microsoft Excel report (`.xlsx`) |
| `GET` | `/api/analyze/{id}/json` | Downloads full analysis in JSON format |
| `GET` | `/api/analyze/{id}/csv` | Downloads list of crawled pages in CSV format |
| `GET` | `/api/history` | Lists all historical analysis records |
| `DELETE`| `/api/history/{id}` | Deletes analysis record and corresponding Excel file |
| `GET` | `/health` | Health check endpoint |

---

## 🧪 Running Tests

Run the backend unit test suite:
```bash
cd backend
venv\Scripts\python tests\test_analyzer.py
```

Tests cover:
- SSRF prevention (blocking localhost, private IP subnets, loopback addresses)
- URL normalization & scheme sanitization
- Feature detection logic on synthetic DOM fixtures
- SEO score calculation and grade deduction rules

---

## 🔒 Security Principles
- **No SSRF / Intranet Scanning:** Target hosts are checked via DNS resolution before connection.
- **Safe HTML Parsing:** Built with BeautifulSoup using `lxml` parser with bounded memory read limits (5 MB per page).
- **Public Data Only:** Does not bypass access controls, CAPTCHAs, or authentication layers.
