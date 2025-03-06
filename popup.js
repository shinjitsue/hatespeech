document.addEventListener("DOMContentLoaded", function () {
  // Get UI elements
  const enableFilter = document.getElementById("enableFilter");
  const statusText = document.getElementById("statusText");
  const englishFilter = document.getElementById("englishFilter");
  const cebuanoFilter = document.getElementById("cebuanoFilter");
  const tagalogFilter = document.getElementById("tagalogFilter");
  const filterStrength = document.getElementById("filterStrength");
  const customBlacklist = document.getElementById("customBlacklist");
  const customWhitelist = document.getElementById("customWhitelist");
  const saveSettings = document.getElementById("saveSettings");

  // Load current settings
  chrome.runtime.sendMessage({ action: "getSettings" }, (response) => {
    if (response && response.settings) {
      const settings = response.settings;

      // Update UI with current settings
      enableFilter.checked = settings.enabled;
      statusText.textContent = settings.enabled
        ? "Filter Enabled"
        : "Filter Disabled";

      if (settings.filterLanguages) {
        englishFilter.checked = settings.filterLanguages.english;
        cebuanoFilter.checked = settings.filterLanguages.cebuano;
        tagalogFilter.checked = settings.filterLanguages.tagalog;
      }

      filterStrength.value = settings.filterStrength || "medium";

      if (settings.customBlacklist) {
        customBlacklist.value = settings.customBlacklist.join(", ");
      }

      if (settings.customWhitelist) {
        customWhitelist.value = settings.customWhitelist.join(", ");
      }
    }
  });

  // Toggle filter status text
  enableFilter.addEventListener("change", function () {
    statusText.textContent = this.checked
      ? "Filter Enabled"
      : "Filter Disabled";
  });

  // Save settings
  saveSettings.addEventListener("click", function () {
    const settings = {
      enabled: enableFilter.checked,
      filterLanguages: {
        english: englishFilter.checked,
        cebuano: cebuanoFilter.checked,
        tagalog: tagalogFilter.checked,
      },
      filterStrength: filterStrength.value,
      customBlacklist: customBlacklist.value
        .split(",")
        .map((word) => word.trim())
        .filter((word) => word),
      customWhitelist: customWhitelist.value
        .split(",")
        .map((word) => word.trim())
        .filter((word) => word),
    };

    chrome.runtime.sendMessage(
      {
        action: "updateSettings",
        settings: settings,
      },
      (response) => {
        if (response && response.success) {
          // Show a brief "Saved!" message
          const originalText = saveSettings.textContent;
          saveSettings.textContent = "Saved!";
          saveSettings.disabled = true;

          setTimeout(() => {
            saveSettings.textContent = originalText;
            saveSettings.disabled = false;
          }, 1500);
        }
      }
    );
  });
});
