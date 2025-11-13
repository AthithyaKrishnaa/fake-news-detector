import os
import logging
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Fake News Detection API", version="1.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can replace "*" with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fetch API key from environment
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")


# ---------- Models ----------
class NewsInput(BaseModel):
    text: str


# ---------- Helper Functions ----------
def extract_image_from_url(url: str) -> Optional[str]:
    """Fetch the Open Graph image (if available) from a fact-check page."""
    try:
        if not url:
            return None
        html = requests.get(url, timeout=5).text
        soup = BeautifulSoup(html, "html.parser")
        og_img = soup.find("meta", property="og:image")
        if og_img and og_img.get("content"):
            return og_img["content"]
    except Exception as e:
        logger.warning(f"Image extraction failed for {url}: {e}")
        return None
    return None


def google_fact_check_search(query: str) -> List[dict]:
    """Query Google's Fact Check Tools API or return mock data if no key."""
    if not GOOGLE_API_KEY:
        logger.info("GOOGLE_API_KEY not set. Returning mock data for testing.")
        return [
            {
                "claim": f"Sample claim related to '{query[:80]}'",
                "verdict": "False",
                "source": "Mock Fact Checker",
                "url": "",
                "image": None,
            }
        ]

    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {"query": query, "key": GOOGLE_API_KEY}

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()

    cleaned_claims: List[dict] = []
    for item in data.get("claims", []):
        claim_text = item.get("text", "No claim text available.")
        claim_review = item.get("claimReview", [{}])[0]
        verdict = claim_review.get("textualRating", "No verdict provided")
        source = claim_review.get("publisher", {}).get("name", "Unknown")
        fact_url = claim_review.get("url", "")
        image_url = extract_image_from_url(fact_url)

        cleaned_claims.append(
            {
                "claim": claim_text,
                "verdict": verdict,
                "source": source,
                "url": fact_url,
                "image": image_url,
            }
        )

    return cleaned_claims


# ---------- Routes ----------
@app.get("/health")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/check-news")
def check_news(news: NewsInput) -> JSONResponse:
    """Check a news text for fact-check results using Google's Fact Check API."""
    try:
        logger.info(f"Checking news: {news.text[:80]}...")
        fact_checks = google_fact_check_search(news.text)

        verdict = (
            "Fact checks found. Review the claims below."
            if fact_checks
            else "No fact checks found."
        )

        return JSONResponse({"verdict": verdict, "google_fact_check": fact_checks})

    except requests.HTTPError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logger.error("Error in /check-news: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------- Run Command ----------
# Run this app using:
# uvicorn main:app --reload
