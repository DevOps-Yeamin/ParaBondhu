# ParaBondhu 1-Click Startup Script for Windows PowerShell
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  ParaBondhu (পাড়াবন্ধু) - Starting Full-Stack Platform" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# 1. Start Backend in background process
$BackendProcess = Start-Process -FilePath "backend\venv\Scripts\python.exe" `
    -ArgumentList "-m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000" `
    -PassThru

Write-Host "[✓] Backend running on http://127.0.0.1:8000" -ForegroundColor Cyan

# 2. Start Frontend
Set-Location frontend
Write-Host "[✓] Starting Frontend on http://127.0.0.1:5173" -ForegroundColor Cyan
npm run dev -- --host 0.0.0.0 --port 5173
