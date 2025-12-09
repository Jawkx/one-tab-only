document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get('target');
  const existingTabId = parseInt(params.get('existingTabId'));
  const existingWindowId = parseInt(params.get('existingWindowId'));

  // Display domain name
  try {
    const urlObj = new URL(targetUrl);
    document.getElementById('domain-name').textContent = urlObj.hostname;
  } catch (e) {
    document.getElementById('domain-name').textContent = "this site";
  }

  // Button 1: Switch to Existing Tab
  document.getElementById('switch-btn').onclick = () => {
    // 1. Focus the window
    chrome.windows.update(existingWindowId, { focused: true });
    // 2. Activate the tab
    chrome.tabs.update(existingTabId, { active: true });
    // 3. Close this current warning tab
    chrome.tabs.getCurrent((tab) => {
      chrome.tabs.remove(tab.id);
    });
  };

  // Button 2: Open Anyway (Ignore)
  document.getElementById('ignore-btn').onclick = () => {
    // Send message to background script to whitelist this session
    chrome.runtime.sendMessage({
      action: "ALLOW_BYPASS",
      targetUrl: targetUrl
    });
  };
});
