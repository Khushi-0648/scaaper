@echo off
echo ========================================================
echo Website Analyzer - Full Stack Startup
echo ========================================================
start "Website Analyzer Backend" cmd /k "start-backend.bat"
start "Website Analyzer Frontend" cmd /k "start-frontend.bat"
echo Both servers initiated:
echo - Backend: http://127.0.0.1:8000
echo - Frontend: http://localhost:5173
echo Opening browser...
timeout /t 3 >nul
start http://localhost:5173
