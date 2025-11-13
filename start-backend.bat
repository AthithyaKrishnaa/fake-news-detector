@echo off
cd /d "C:\Users\HP\fake-news-detection\fake-news-detector"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
pause
