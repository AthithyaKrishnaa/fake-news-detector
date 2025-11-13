const API_BASE = (location.hostname === '127.0.0.1' || location.hostname === 'localhost')
  ? 'http://127.0.0.1:8080'
  : 'https://fake-news-detector-rv03.onrender.com';

const checkBtn = document.getElementById('checkBtn');
const clearBtn = document.getElementById('clearBtn');
const statusDiv = document.getElementById('status');
const resultDiv = document.getElementById('result');
const themeToggle = document.getElementById('themeToggle');

checkBtn.addEventListener('click', () => checkNews());
clearBtn.addEventListener('click', () => {
  document.getElementById('newsText').value = '';
  resultDiv.innerHTML = '';
  statusDiv.hidden = true;
});

function showStatus(msg, isError = false) {
  statusDiv.hidden = false;
  statusDiv.textContent = msg;
  statusDiv.style.color = isError ? '#ff7b7b' : '#9ddfd0';
}

async function checkNews() {
  // Clear previous results
  const resultsEl = document.getElementById('results');
  if (resultsEl) resultsEl.innerHTML = '';
  const text = document.getElementById('newsText').value.trim();
  if (!text) return showStatus('Please paste some text to check.', true);

  showStatus('Checking…');
  checkBtn.disabled = true;

  try {
    const resp = await fetch(`${API_BASE}/check-news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!resp.ok) {
      const textErr = await resp.text();
      throw new Error(`Server returned ${resp.status}: ${textErr}`);
    }

    const data = await resp.json();
    renderResults(data);
    showStatus('Done');

  } catch (err) {
    console.error(err);
    showStatus(`Error: ${err.message}`, true);
    const resultsEl = document.getElementById('results');
    const message = `<div class="empty">Could not reach the backend. Make sure the backend is running (see README).</div>`;
    if (resultsEl) resultsEl.innerHTML = message;
  } finally {
    checkBtn.disabled = false;
  }
}
function renderResults(data) {
  const checks = (data && data.google_fact_check) || [];
  const resultsEl = document.getElementById('results');
  if (!resultsEl) return;

  if (checks.length === 0) {
    resultsEl.innerHTML = `<div class="empty">No fact checks were found for the provided text.</div>`;
    return;
  }

  let html = '';
  checks.forEach(item => {
    const imageHtml = item.image ? `<img src="${item.image}" alt="Related image">` : `<div style="font-size:2rem">📰</div>`;
    html += `
      <div class="result-card">
        <div class="result-card-image">${imageHtml}</div>
        <div class="result-card-content">
          <div class="claim">${escapeHtml(item.claim || 'No claim text provided')}</div>
          <div class="verdict">${escapeHtml(item.verdict || 'Unknown')}</div>
          <div class="source">Source: <a href="${item.url || '#'}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.source || 'View')}</a></div>
        </div>
      </div>
    `;
  });

  resultsEl.innerHTML = html;
}

// lightweight HTML escaping
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m];});
}

// Add quick health-check when page loads to detect backend early
window.addEventListener('load', async () => {
  try {
    const h = await fetch(`${API_BASE || ''}/health`);
    if (h.ok) showStatus('Backend reachable', false);
  } catch (e) {
    // Don't show persistent error here; user will see when clicking Check
  }
  // Initialize theme toggle state
  tryInitTheme();
  if (themeToggle){
    themeToggle.addEventListener('change', () => toggleTheme());
  }
});

function tryInitTheme(){
  const saved = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark', saved === 'dark');
  if (themeToggle) themeToggle.checked = (saved === 'dark');
}

function toggleTheme(){
  const isDark = themeToggle && themeToggle.checked;
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
