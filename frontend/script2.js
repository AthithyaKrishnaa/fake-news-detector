// ------------------------------
// CONFIG
// ------------------------------
const API_BASE = "https://fake-news-detector-rv03.onrender.com";
console.log("API_BASE =", API_BASE);

// ------------------------------
// ELEMENTS
// ------------------------------
const checkBtn = document.getElementById('checkBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsDiv = document.getElementById('results');
const statusDiv = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');

// ------------------------------
// BUTTON LISTENERS
// ------------------------------
checkBtn.addEventListener('click', checkNews);

clearBtn.addEventListener('click', () => {
  document.getElementById('newsText').value = '';
  resultsDiv.innerHTML = '';
  statusDiv.hidden = true;
});

// ------------------------------
// STATUS MESSAGE
// ------------------------------
function showStatus(msg, isError = false) {
  statusDiv.hidden = false;
  statusDiv.textContent = msg;
  statusDiv.style.color = isError ? '#ff7b7b' : '#9ddfd0';
}

// ------------------------------
// MAIN FUNCTION
// ------------------------------
async function checkNews() {
  resultsDiv.innerHTML = '';
  const text = document.getElementById('newsText').value.trim();

  if (!text) return showStatus('Please paste some text to check.', true);

  showStatus('Checking…');
  resultsDiv.innerHTML = `<div class="loading">⏳ Checking news…</div>`;
  checkBtn.disabled = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const resp = await fetch(`${API_BASE}/check-news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      const textErr = await resp.text();
      throw new Error(`Server returned ${resp.status}: ${textErr}`);
    }

    let data;
    try {
      data = await resp.json();
    } catch {
      throw new Error("Backend returned invalid JSON. Check backend logs.");
    }

    renderResults(data);
    showStatus('Done');

  } catch (err) {
    console.error("ERROR:", err);
    showStatus(`Error: ${err.message}`, true);

    resultsDiv.innerHTML = `<div class="empty">
      Could not reach the backend. Make sure the backend is running.
    </div>`;
  }

  checkBtn.disabled = false;
}

// ------------------------------
// DISPLAY RESULTS
// ------------------------------
function renderResults(data) {
  const checks = data.google_fact_check || [];

  if (checks.length === 0) {
    resultsDiv.innerHTML = `<div class="empty">No fact checks found.</div>`;
    return;
  }

  let html = '';
  checks.forEach(item => {
    const imageHtml = item.image
      ? `<img src="${item.image}" alt="Related image">`
      : `<div style="font-size:2rem">📰</div>`;

    html += `
      <div class="result-card">
        <div class="result-card-image">${imageHtml}</div>
        <div class="result-card-content">
          <div class="claim">${escapeHtml(item.claim || 'No claim provided')}</div>
          <div class="verdict">${escapeHtml(item.verdict || 'Unknown')}</div>
          <div class="source">
            Source:
            <a href="${item.url || '#'}" target="_blank">
              ${escapeHtml(item.source || 'View')}
            </a>
          </div>
        </div>
      </div>`;
  });

  resultsDiv.innerHTML = html;
}

// ------------------------------
// HELPERS
// ------------------------------
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );
}

// ------------------------------
// ON PAGE LOAD
// ------------------------------
window.addEventListener('load', async () => {
  try {
    const h = await fetch(`${API_BASE}/health`);
    if (h.ok) showStatus('Backend reachable');
  } catch (e) {
    console.warn("Health check skipped (404 expected if backend has no /health)", e);
  }

  initTheme();
  if (themeToggle) themeToggle.addEventListener('change', toggleTheme);
});

// ------------------------------
// THEME
// ------------------------------
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark', saved === 'dark');
  if (themeToggle) themeToggle.checked = saved === 'dark';
}

function toggleTheme() {
  const isDark = themeToggle.checked;
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
