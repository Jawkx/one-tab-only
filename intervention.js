document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get('target');
  const existingTabId = parseInt(params.get('existingTabId'));
  const existingWindowId = parseInt(params.get('existingWindowId'));

  try {
    const urlObj = new URL(targetUrl);
    document.getElementById('domain-name').textContent = urlObj.hostname;
  } catch (e) {
    document.getElementById('domain-name').textContent = "this site";
  }

  document.getElementById('switch-btn').onclick = () => {
    chrome.windows.update(existingWindowId, { focused: true });
    chrome.tabs.update(existingTabId, { active: true });
    chrome.tabs.getCurrent((tab) => {
      chrome.tabs.remove(tab.id);
    });
  };

  document.getElementById('replace-existing-btn').onclick = () => {
    chrome.windows.update(existingWindowId, { focused: true });
    chrome.tabs.update(existingTabId, { url: targetUrl, active: true });
    chrome.tabs.getCurrent((tab) => {
      chrome.tabs.remove(tab.id);
    });
  };

  document.getElementById('replace-btn').onclick = () => {
    chrome.tabs.remove(existingTabId);
    chrome.runtime.sendMessage({
      action: "ALLOW_BYPASS",
      targetUrl: targetUrl
    });
  };

  document.getElementById('ignore-btn').onclick = () => {
    chrome.runtime.sendMessage({
      action: "ALLOW_BYPASS",
      targetUrl: targetUrl
    });
  };

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      chrome.windows.update(existingWindowId, { focused: true });
      chrome.tabs.update(existingTabId, { active: true });
      chrome.tabs.getCurrent((tab) => {
        chrome.tabs.remove(tab.id);
      });
    }
  });
});
