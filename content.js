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

      // Create a text node walker to find all text nodes
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      // Process existing text nodes
      let node;
      while ((node = walker.nextNode())) {
        filterTextNode(node, languages);
      }

      // Set up mutation observer to watch for DOM changes
      const observer = new MutationObserver((mutations) => {
        // Re-check settings for each mutation batch
        chrome.storage.local.get(
          ["enabled", "filterLanguages"],
          function (data) {
            const enabled = data.enabled;
            const languages = data.filterLanguages || {
              english: true,
              cebuano: false,
              tagalog: false,
            };

            if (!enabled) return; // Skip processing if disabled

            mutations.forEach((mutation) => {
              // For added nodes
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  // Create a tree walker for this element
                  const elementWalker = document.createTreeWalker(
                    node,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                  );

                  let textNode;
                  while ((textNode = elementWalker.nextNode())) {
                    filterTextNode(textNode, languages);
                  }
                } else if (node.nodeType === Node.TEXT_NODE) {
                  filterTextNode(node, languages);
                }
              });

              // For character data changes
              if (mutation.type === "characterData") {
                filterTextNode(mutation.target, languages);
              }
            });
          }
        );
      });

      // Start observing
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    });
  }

  // Function to filter individual text nodes
  function filterTextNode(node, languages) {
    if (node.nodeValue && node.nodeValue.trim() !== "") {
      const originalText = node.nodeValue;

      // Get settings to check if blur mode is enabled
      chrome.storage.local.get(["filterStyle"], function (data) {
        const useBlur = data.filterStyle === "blur";

        if (useBlur) {
          // First check if this node already has blurred content
          if (
            node.parentNode &&
            node.parentNode.classList &&
            node.parentNode.classList.contains("profanity-filter-container")
          ) {
            return; // Skip already processed nodes
          }

          // Get profane word positions from each enabled filter
          let profaneWords = [];

          if (languages.english) {
            const result = englishFilter.filterText(originalText, true);
            profaneWords = profaneWords.concat(result.profaneWords);
          }

          if (languages.cebuano) {
            const result = cebuanoFilter.filterText(originalText, true);
            profaneWords = profaneWords.concat(result.profaneWords);
          }

          if (languages.tagalog) {
            const result = tagalogFilter.filterText(originalText, true);
            profaneWords = profaneWords.concat(result.profaneWords);
          }

          if (profaneWords.length > 0) {
            // Create a span container to replace the text node
            const container = document.createElement("span");
            container.className = "profanity-filter-container";

            let lastIndex = 0;

            // Sort profane words by start index
            profaneWords.sort((a, b) => a.startIndex - b.startIndex);

            // Create spans for normal and blurred text
            profaneWords.forEach((word) => {
              // Add normal text before profanity
              if (word.startIndex > lastIndex) {
                const normalText = document.createTextNode(
                  originalText.substring(lastIndex, word.startIndex)
                );
                container.appendChild(normalText);
              }

              // Add blurred text
              const profaneSpan = document.createElement("span");
              profaneSpan.className = "profanity-blurred";
              profaneSpan.style.filter = "blur(4px)";
              profaneSpan.textContent = originalText.substring(
                word.startIndex,
                word.endIndex
              );
              container.appendChild(profaneSpan);

              lastIndex = word.endIndex;
            });

            // Add remaining normal text
            if (lastIndex < originalText.length) {
              const normalText = document.createTextNode(
                originalText.substring(lastIndex)
              );
              container.appendChild(normalText);
            }

            // Replace the original text node with our container
            if (node.parentNode) {
              node.parentNode.replaceChild(container, node);
            }
          }
        } else {
          // Use traditional asterisk filtering
          let filteredText = originalText;

          if (languages.english) {
            filteredText = englishFilter.filterText(filteredText);
          }
          if (languages.cebuano) {
            filteredText = cebuanoFilter.filterText(filteredText);
          }
          if (languages.tagalog) {
            filteredText = tagalogFilter.filterText(filteredText);
          }

          if (originalText !== filteredText) {
            node.nodeValue = filteredText;
          }
        }
      });
    }
  }

  function injectBlurStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .profanity-blurred {
          filter: blur(4px);
          transition: filter 0.2s;
        }
        .profanity-blurred:hover {
          filter: blur(0);
        }
      `;
    document.head.appendChild(style);
  }

  // Call this function when the content script initializes
  injectBlurStyles();

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
