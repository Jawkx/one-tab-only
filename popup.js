document.addEventListener('DOMContentLoaded', async () => {
  const hostSpan = document.getElementById('current-host');
  const addBtn = document.getElementById('add-btn');
  const listContainer = document.getElementById('watchlist');
  const scopeSelect = document.getElementById('scope-select');

  const { scope = 'all-windows' } = await chrome.storage.sync.get('scope');
  scopeSelect.value = scope;

  scopeSelect.onchange = async (e) => {
    await chrome.storage.sync.set({ scope: e.target.value });
  };

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

  renderList();

  async function addToWatchlist(hostname) {
    const { watchlist = [] } = await chrome.storage.sync.get('watchlist');
    
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
      listContainer.innerHTML = '<div class="empty-state">No domains watched yet.<br>Add one above to get started.</div>';
      return;
    }

    watchlist.forEach(host => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <span title="${host}">${host}</span>
        <button class="delete-btn btn-danger" aria-label="Remove ${host}">Remove</button>
      `;
      div.querySelector('.delete-btn').onclick = () => removeFromWatchlist(host);
      listContainer.appendChild(div);
    });
  }
});
