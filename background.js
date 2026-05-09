const allowedSessions = new Set();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ALLOW_BYPASS" && sender.tab) {
    try {
      const url = new URL(request.targetUrl);
      const key = `${sender.tab.id}|${url.hostname}`;
      allowedSessions.add(key);

      chrome.tabs.update(sender.tab.id, { url: request.targetUrl });
    } catch (e) {
      console.error("Invalid URL in bypass request");
    }
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  for (const key of allowedSessions) {
    if (key.startsWith(`${tabId}|`)) allowedSessions.delete(key);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading' && tab.url) {
    checkOneTabRule(tabId, tab.url, tab);
  }
});

async function checkOneTabRule(newTabId, newUrlString, newTab) {
  try {
    const newUrl = new URL(newUrlString);
    const hostname = newUrl.hostname;

    if (allowedSessions.has(`${newTabId}|${hostname}`)) return;

    const { watchlist = [], scope = 'all-windows' } = await chrome.storage.sync.get(['watchlist', 'scope']);
    if (!watchlist.includes(hostname)) return;

    let currentWindowId;
    if (newTab && newTab.windowId !== undefined) {
      currentWindowId = newTab.windowId;
    } else {
      const t = await chrome.tabs.get(newTabId);
      currentWindowId = t.windowId;
    }

    const queryOptions = scope === 'current-window' 
      ? { windowId: currentWindowId }
      : {};
    
    const tabs = await chrome.tabs.query(queryOptions);

    const duplicate = tabs.find(t => {
      if (t.id === newTabId) return false;
      if (!t.url) return false;
      try {
        const tUrl = new URL(t.url);
        return tUrl.hostname === hostname;
      } catch (e) { return false; }
    });

    console.log(`[OneTab] Checking ${hostname} | Scope: ${scope} | Window: ${currentWindowId} | Found duplicate: ${duplicate ? duplicate.id : 'None'}`);

    if (duplicate) {
      const interventionUrl = chrome.runtime.getURL('intervention.html') +
        `?target=${encodeURIComponent(newUrlString)}` +
        `&existingTabId=${duplicate.id}` +
        `&existingWindowId=${duplicate.windowId}`;

      chrome.tabs.update(newTabId, { url: interventionUrl });
    }

  } catch (error) {
    console.log("One Tab Only Error:", error);
  }
}
