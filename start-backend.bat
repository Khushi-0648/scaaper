@echo off
echo ========================================================
echo Starting Website Analyzer FastAPI Backend on port 8000...
echo ========================================================
cd backend
call venv\Scripts\activate
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
