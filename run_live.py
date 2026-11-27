#!/usr/bin/env python3
"""
ParaBondhu - Production Supervisor Script
Runs both FastAPI Backend and Vite Frontend concurrently with auto-restart and health monitoring.
"""

import os
import sys
import time
import subprocess
import signal

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

# Platform python binary
if sys.platform == "win32":
    PYTHON_EXE = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
    NPM_CMD = "npm.cmd"
else:
    PYTHON_EXE = os.path.join(BACKEND_DIR, "venv", "bin", "python")
    NPM_CMD = "npm"

if not os.path.exists(PYTHON_EXE):
    PYTHON_EXE = sys.executable

def start_backend():
    print("[ParaBondhu] Starting FastAPI backend on http://127.0.0.1:8000 ...")
    cmd = [
        PYTHON_EXE,
        "-m",
        "uvicorn",
        "backend.app.main:app",
        "--host",
        "0.0.0.0",
        "--port",
        "8000"
    ]
    return subprocess.Popen(cmd, cwd=ROOT_DIR)

def start_frontend():
    print("[ParaBondhu] Starting Vite React frontend on http://127.0.0.1:5173 ...")
    cmd = [NPM_CMD, "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
    return subprocess.Popen(cmd, cwd=FRONTEND_DIR)

def main():
    print("=" * 65)
    print("  🇧🇩 ParaBondhu (পাড়াবন্ধু) - Continuous Production Runner")
    print("=" * 65)

    backend_proc = start_backend()
    time.sleep(2)
    frontend_proc = start_frontend()

    print("\n[ParaBondhu] Both services are running LIVE:")
    print("  -> Frontend: http://localhost:5173")
    print("  -> Backend API: http://localhost:8000")
    print("  -> API Docs: http://localhost:8000/docs")
    print("\nPress Ctrl+C to gracefully stop.\n")

    def shutdown(sig, frame):
        print("\n[ParaBondhu] Shutting down services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, shutdown)

    # Monitor and auto-heal
    while True:
        time.sleep(5)
        if backend_proc.poll() is not None:
            print("[Warning] Backend stopped. Auto-restarting...")
            backend_proc = start_backend()
        if frontend_proc.poll() is not None:
            print("[Warning] Frontend stopped. Auto-restarting...")
            frontend_proc = start_frontend()

if __name__ == "__main__":
    main()
