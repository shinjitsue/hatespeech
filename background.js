// Initialize default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    enabled: true,
    filterLanguages: {
      english: true,
      cebuano: true,
      tagalog: true,
    },
    filterStrength: "medium", // Options: 'low', 'medium', 'high'
    customBlacklist: [],
    customWhitelist: [],
  });
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSettings") {
    chrome.storage.local.get(null, (data) => {
      sendResponse({ settings: data });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === "updateSettings") {
    chrome.storage.local.set(request.settings, () => {
      sendResponse({ success: true });
      // Notify content scripts about updated settings
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs
            .sendMessage(tab.id, { action: "settingsUpdated" })
            .catch((err) =>
              console.log(`Could not update tab ${tab.id}:`, err)
            );
        });
      });
    });
    return true;
  }
});
