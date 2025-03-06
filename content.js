// Wait for all filters to be available before initializing
function checkDependencies() {
  if (
    typeof englishFilter !== "undefined" &&
    typeof cebuanoFilter !== "undefined" &&
    typeof tagalogFilter !== "undefined" &&
    typeof languageDetector !== "undefined" &&
    typeof filterManager !== "undefined"
  ) {
    initializeContentFilter();
  } else {
    setTimeout(checkDependencies, 50); // Check again in 50ms
  }
}

// Main initialization function that contains all the original code
function initializeContentFilter() {
  // Function to apply all active language filters to text
  function applyFilters(text) {
    if (!text) return text;

    let filteredText = text;

    // Check if the extension is enabled
    chrome.storage.local.get(["enabled", "filterLanguages"], function (data) {
      if (data.enabled) {
        // Apply each enabled language filter
        if (data.filterLanguages.english) {
          filteredText = englishFilter.filterText(filteredText);
        }
        if (data.filterLanguages.cebuano) {
          filteredText = cebuanoFilter.filterText(filteredText);
        }
        if (data.filterLanguages.tagalog) {
          filteredText = tagalogFilter.filterText(filteredText);
        }
      }
    });

    return filteredText;
  }

  // Function to observe and filter DOM changes
  function observeAndFilter() {
    // Get settings first
    chrome.storage.local.get(["enabled", "filterLanguages"], function (data) {
      const enabled = data.enabled;
      const languages = data.filterLanguages || {
        english: true,
        cebuano: false,
        tagalog: false,
      };

      if (!enabled) return; // Exit if filtering is disabled

      // Skip processing if all filters are disabled
      if (!languages.english && !languages.cebuano && !languages.tagalog) {
        return;
      }

      // Use a more efficient approach for large DOMs
      const processNodesInChunks = (rootNode) => {
        const walker = document.createTreeWalker(
          rootNode,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              // Skip hidden elements and script/style content
              const parent = node.parentNode;
              if (!parent) return NodeFilter.FILTER_REJECT;

              if (
                parent.nodeName === "SCRIPT" ||
                parent.nodeName === "STYLE" ||
                parent.nodeName === "NOSCRIPT"
              ) {
                return NodeFilter.FILTER_REJECT;
              }

              // Skip empty text nodes
              if (!node.nodeValue || node.nodeValue.trim() === "") {
                return NodeFilter.FILTER_REJECT;
              }

              return NodeFilter.FILTER_ACCEPT;
            },
          },
          false
        );

        const textNodes = [];
        let node;

        // Collect nodes first (faster than processing during walk)
        while ((node = walker.nextNode())) {
          textNodes.push(node);
        }

        // Process in batches of 500 nodes
        const BATCH_SIZE = 500;

        for (let i = 0; i < textNodes.length; i += BATCH_SIZE) {
          const batch = textNodes.slice(i, i + BATCH_SIZE);

          setTimeout(() => {
            batch.forEach((node) => filterTextNode(node, languages));
          }, 0);
        }
      };

      // Process the initial DOM
      processNodesInChunks(document.body);

      // Set up optimized mutation observer
      const observer = new MutationObserver((mutations) => {
        // Re-check settings occasionally
        chrome.storage.local.get(
          ["enabled", "filterLanguages"],
          function (data) {
            const enabled = data.enabled;
            const languages = data.filterLanguages || {
              english: true,
              cebuano: false,
              tagalog: false,
            };

            if (!enabled) return;

            // Group added nodes for batch processing
            const addedNodes = [];
            const changedNodes = [];

            mutations.forEach((mutation) => {
              // For added nodes
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  addedNodes.push(node);
                } else if (node.nodeType === Node.TEXT_NODE) {
                  changedNodes.push(node);
                }
              });

              // For character data changes
              if (mutation.type === "characterData") {
                changedNodes.push(mutation.target);
              }
            });

            // Process added elements in batch
            addedNodes.forEach((node) => {
              processNodesInChunks(node);
            });

            // Process changed text nodes
            changedNodes.forEach((node) => {
              filterTextNode(node, languages);
            });
          }
        );
      });

      // Start observing with optimized configuration
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    });
  }

  // Function to filter individual text nodes
  function filterTextNode(node, languages) {
    // Skip empty nodes or script/style content
    if (
      !node.nodeValue ||
      node.nodeValue.trim() === "" ||
      (node.parentNode &&
        (node.parentNode.nodeName === "SCRIPT" ||
          node.parentNode.nodeName === "STYLE"))
    ) {
      return;
    }

    const originalText = node.nodeValue;
    let filteredText = originalText;

    // Check for profanity first before applying filters (fast early return)
    let hasProfanity = false;

    if (languages.english && englishFilter.containsProfanity(filteredText)) {
      hasProfanity = true;
    } else if (
      languages.cebuano &&
      cebuanoFilter.containsProfanity(filteredText)
    ) {
      hasProfanity = true;
    } else if (
      languages.tagalog &&
      tagalogFilter.containsProfanity(filteredText)
    ) {
      hasProfanity = true;
    }

    // Only apply filters if profanity is detected
    if (hasProfanity) {
      // Apply filters in order of likelihood for better performance
      if (languages.english) {
        filteredText = englishFilter.filterText(filteredText);
      }
      if (languages.cebuano) {
        filteredText = cebuanoFilter.filterText(filteredText);
      }
      if (languages.tagalog) {
        filteredText = tagalogFilter.filterText(filteredText);
      }

      // Only update DOM if text actually changed
      if (originalText !== filteredText) {
        node.nodeValue = filteredText;
      }
    }
  }

  // Filter text inputs and textareas
  function filterInputs() {
    chrome.storage.local.get(["enabled", "filterLanguages"], function (data) {
      const enabled = data.enabled;
      const languages = data.filterLanguages || {
        english: true,
        cebuano: false,
        tagalog: false,
      };

      if (!enabled) return; // Exit if filtering is disabled

      const inputs = document.querySelectorAll('input[type="text"], textarea');

      inputs.forEach((input) => {
        // Filter current value
        if (input.value) {
          let filteredText = input.value;
          if (languages.english)
            filteredText = englishFilter.filterText(filteredText);
          if (languages.cebuano)
            filteredText = cebuanoFilter.filterText(filteredText);
          if (languages.tagalog)
            filteredText = tagalogFilter.filterText(filteredText);

          input.value = filteredText;
        }

        // Add listeners for future input
        input.addEventListener("input", function () {
          // Re-check settings
          chrome.storage.local.get(
            ["enabled", "filterLanguages"],
            function (data) {
              if (!data.enabled) return;

              const cursorPosition = input.selectionStart;
              let filteredText = input.value;

              if (data.filterLanguages.english)
                filteredText = englishFilter.filterText(filteredText);
              if (data.filterLanguages.cebuano)
                filteredText = cebuanoFilter.filterText(filteredText);
              if (data.filterLanguages.tagalog)
                filteredText = tagalogFilter.filterText(filteredText);

              input.value = filteredText;

              // Try to preserve cursor position
              input.setSelectionRange(cursorPosition, cursorPosition);
            }
          );
        });
      });
    });
  }

  // Listen for settings changes
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "settingsUpdated") {
      // Re-filter the page with the new settings
      observeAndFilter();
      filterInputs();
      sendResponse({ success: true });
    }
  });

  // Run when DOM is loaded
  document.addEventListener("DOMContentLoaded", function () {
    observeAndFilter();
    filterInputs();

    // Check for dynamically added input elements
    const inputObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          filterInputs();
        }
      });
    });

    inputObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });

  // Run immediately in case DOM is already loaded
  if (
    document.readyState === "interactive" ||
    document.readyState === "complete"
  ) {
    observeAndFilter();
    filterInputs();
  }
}

// Start the dependency checking process
console.log("Content script loaded, checking for dependencies...");
checkDependencies();
