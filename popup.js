document.addEventListener('DOMContentLoaded', async () => {
  const hostSpan = document.getElementById('current-host');
  const addBtn = document.getElementById('add-btn');
  const listContainer = document.getElementById('watchlist');

  // 1. Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url.startsWith('http')) {
    hostSpan.textContent = "N/A";
    addBtn.disabled = true;
    addBtn.style.opacity = "0.5";
  } else {
    const url = new URL(tab.url);
    hostSpan.textContent = url.hostname;
    
    addBtn.onclick = () => addToWatchlist(url.hostname);
  }

  // 2. Load and render list
  renderList();

  async function addToWatchlist(hostname) {
    const { watchlist = [] } = await chrome.storage.sync.get('watchlist');
    
    // Avoid duplicates
    if (!watchlist.includes(hostname)) {
      const newList = [...watchlist, hostname];
      await chrome.storage.sync.set({ watchlist: newList });
      renderList();
    }
  }

  async function removeFromWatchlist(hostname) {
    const { watchlist = [] } = await chrome.storage.sync.get('watchlist');
    const newList = watchlist.filter(h => h !== hostname);
    await chrome.storage.sync.set({ watchlist: newList });
    renderList();
  }

  async function renderList() {
    const { watchlist = [] } = await chrome.storage.sync.get('watchlist');
    listContainer.innerHTML = '';

    if (watchlist.length === 0) {
      listContainer.innerHTML = '<p style="color:#777; font-size:12px">No domains watched.</p>';
      return;
    }

    watchlist.forEach(host => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <span>${host}</span>
        <button class="delete-btn btn-danger">Remove</button>
      `;
      div.querySelector('.delete-btn').onclick = () => removeFromWatchlist(host);
      listContainer.appendChild(div);
    });
  }
});