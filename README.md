

Fake News Detection Web App
A futuristic, interactive platform that helps users detect misinformation in news articles instantly.

Features
- Paste suspicious news text to get instant fact-check results.
- Fetches detailed claims, verdicts, and verified sources powered by the Google Fact Check API.
- Clean, responsive UI with smooth animations using AOS.
- Displays relevant images related to fact-check claims (if available).

Why This Project Matters? 
- In today’s world flooded with misinformation, this tool empowers users to validate news quickly and avoid spreading fake news.

Tech Stack
- Backend: FastAPI (Python)
- Web Scraping: BeautifulSoup
 -Frontend: HTML, CSS, JavaScript
- Animations: AOS (Animate On Scroll) library
- API: Google Fact Check API

Prerequisites
- Python 3.7+
- FastAPI and dependencies (fastapi, uvicorn, requests, beautifulsoup4)
- A Google Fact Check API key

Quick start (local development)
1. Install Python dependencies for the backend (from the repo root):

```powershell
cd backend
python -m pip install -r requirements.txt
```

2. (Optional) Set your Google Fact Check API key. If you do not set it, the backend will run in a small "mock" mode that returns a sample result so you can test the UI.

Windows PowerShell example:

```powershell
#$env:GOOGLE_API_KEY = "YOUR_REAL_KEY_HERE"
setx GOOGLE_API_KEY "YOUR_REAL_KEY_HERE"
```

3. Start the backend (from repository root):

```powershell
# Run from the repo root. This starts the FastAPI app on 127.0.0.1:8000
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

4. Serve the frontend files from the `frontend` directory. Browsers sometimes restrict fetch() when opening `index.html` via the file:// protocol — so serve with a tiny static server. From the `frontend` folder run:

```powershell
cd frontend
python -m http.server 5500
# then open http://127.0.0.1:5500 in your browser
```

5. Open the app in your browser and paste sample text into the input and click "Check News". If the backend is running you'll see results. If you see "Could not reach the backend", ensure the backend (uvicorn) is running and accessible at http://127.0.0.1:8000.

Notes
- The backend honors the environment variable `GOOGLE_API_KEY`. When unset or left as the placeholder value the server returns a mocked single claim for easier local testing.
- CORS is enabled for local development, but in production you should restrict `allow_origins` to the known domain(s).

Thank you!


C:\Users\HP\fake-news-detection\fake-news-detector\backend> uvicorn main:app --reload --port 8080

C:\Users\HP\fake-news-detection\fake-news-detector\frontend> npx serve .
