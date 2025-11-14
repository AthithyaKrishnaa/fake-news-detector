# Fake News Detector

A web application that helps you detect misinformation and verify news claims. Paste any news text or claim, and the app returns fact-check results including verdicts, sources, and related images.

---

## Live Demo

Check it out here: [Fake News Detector](https://fake-news-detector-k1wt.onrender.com/)

---

## How it Works

1. Paste a news text or claim into the input box.  
2. Click **Check News**.  
3. The app fetches fact-check results from Google's Fact Check API (or fallback mock data if the API key is missing).  
4. Results show:
   - Claim text
   - Verdict (True/False/Unknown)
   - Source with clickable link
   - Related image if available  

The app also has a **dark/light mode toggle**.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Python, FastAPI  
- **Deployment:** Render  

---

## Notes

- Works even without a Google API key (uses mock data).  
- Backend always returns valid JSON, so the frontend never crashes.  
- The frontend and backend are separate, so the API can be reused.

---

## License

MIT License
