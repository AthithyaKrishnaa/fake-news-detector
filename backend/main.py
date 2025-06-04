from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import requests
from bs4 import BeautifulSoup

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_API_KEY = "your-google-api-key"

class NewsInput(BaseModel):
    text: str

def google_fact_check_search(query: str):
    url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    params = {"query": query, "key": GOOGLE_API_KEY}
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()

    cleaned_claims = []
    for item in data.get("claims", []):
        claim_text = item.get("text", "No claim text available.")
        claim_review = item.get("claimReview", [{}])[0]
        verdict = claim_review.get("textualRating", "No verdict provided")
        source = claim_review.get("publisher", {}).get("name", "Unknown")
        url = claim_review.get("url", "")
        image_url = extract_image_from_url(url)

        cleaned_claims.append({
            "claim": claim_text,
            "verdict": verdict,
            "source": source,
            "url": url,
            "image": image_url
        })
    return cleaned_claims

def extract_image_from_url(url: str):
    try:
        if not url:
            return None
        html = requests.get(url, timeout=5).text
        soup = BeautifulSoup(html, "html.parser")
        og_img = soup.find("meta", property="og:image")
        if og_img and og_img.get("content"):
            return og_img["content"]
    except:
        return None
    return None

@app.post("/check-news")
def check_news(news: NewsInput):
    fact_checks = google_fact_check_search(news.text)
    verdict = "Fact checks found. Review the claims below." if fact_checks else "No fact checks found."

    return {
        "verdict": verdict,
        "google_fact_check": fact_checks
    }
