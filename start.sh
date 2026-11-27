#!/usr/bin/env bash
# ParaBondhu 1-Click Startup Script for Linux & macOS

echo "=========================================================="
echo "  ParaBondhu (পাড়াবন্ধু) - Starting Full-Stack Platform"
echo "=========================================================="

# Start backend in background
source backend/venv/bin/activate
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "[✓] Backend running on http://127.0.0.1:8000 (PID: $BACKEND_PID)"

# Start frontend
cd frontend
echo "[✓] Starting Frontend on http://127.0.0.1:5173"
npm run dev -- --host 0.0.0.0 --port 5173

# Trap exit to kill backend
trap "kill $BACKEND_PID" EXIT
