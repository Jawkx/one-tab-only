// specific-tab-id + hostname combinations that are allowed to exist
const allowedSessions = new Set();

// Listen for the "Open Anyway" command
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ALLOW_BYPASS" && sender.tab) {
    try {
      const url = new URL(request.targetUrl);
      // Whitelist this specific tab for this specific hostname
      const key = `${sender.tab.id}|${url.hostname}`;
      allowedSessions.add(key);

      // Navigate the tab to the target
      chrome.tabs.update(sender.tab.id, { url: request.targetUrl });
    } catch (e) {
      console.error("Invalid URL in bypass request");
    }
  }
});

// Clean up when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  for (const key of allowedSessions) {
    if (key.startsWith(`${tabId}|`)) allowedSessions.delete(key);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only trigger when URL changes and is fully loading
  if (changeInfo.status === 'loading' && tab.url) {
    checkOneTabRule(tabId, tab.url, tab);
  }
});

async function checkOneTabRule(newTabId, newUrlString, newTab) {
  try {
    const newUrl = new URL(newUrlString);
    const hostname = newUrl.hostname;

    // 0. CHECK BYPASS: Is this tab allowed to view this host?
    if (allowedSessions.has(`${newTabId}|${hostname}`)) return;

    // 1. Check if this hostname is in our watchlist
    const { watchlist = [], scope = 'all-windows' } = await chrome.storage.sync.get(['watchlist', 'scope']);
    if (!watchlist.includes(hostname)) return;

    // 2. Use the tab object passed from onUpdated (with fallback for safety)
    let currentWindowId;
    if (newTab && newTab.windowId !== undefined) {
      currentWindowId = newTab.windowId;
    } else {
      // Fallback: if tab object is somehow missing, fetch it
      const t = await chrome.tabs.get(newTabId);
      currentWindowId = t.windowId;
    }

    // 3. Find other tabs with the same hostname
    // Build query based on scope setting
    const queryOptions = scope === 'current-window' 
      ? { windowId: currentWindowId }
      : {}; // Empty object searches all windows
    
    const tabs = await chrome.tabs.query(queryOptions);

    // Filter for matches, excluding the current new tab
    const duplicate = tabs.find(t => {
      if (t.id === newTabId) return false; // Don't match self
      if (!t.url) return false;
      try {
        const tUrl = new URL(t.url);
        return tUrl.hostname === hostname;
      } catch (e) { return false; }
    });

    // Debug logging to help verify behavior
    console.log(`[OneTab] Checking ${hostname} | Scope: ${scope} | Window: ${currentWindowId} | Found duplicate: ${duplicate ? duplicate.id : 'None'}`);

    // 4. If duplicate found, intervene!
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
