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

  // Button 2: Close Old & Continue (Replace)
  document.getElementById('replace-btn').onclick = () => {
    // 1. Close the existing/original tab
    chrome.tabs.remove(existingTabId);
    // 2. Navigate this tab to the target (uses existing ALLOW_BYPASS logic)
    chrome.runtime.sendMessage({
      action: "ALLOW_BYPASS",
      targetUrl: targetUrl
    });
  };

  // Button 3: Open Anyway (Ignore)
  document.getElementById('ignore-btn').onclick = () => {
    // Send message to background script to whitelist this session
    chrome.runtime.sendMessage({
      action: "ALLOW_BYPASS",
      targetUrl: targetUrl
    });
  };

  // Keyboard shortcut: Enter key to switch to existing tab
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      // Trigger the same action as the switch button
      chrome.windows.update(existingWindowId, { focused: true });
      chrome.tabs.update(existingTabId, { active: true });
      chrome.tabs.getCurrent((tab) => {
        chrome.tabs.remove(tab.id);
      });
    }
  });
});
