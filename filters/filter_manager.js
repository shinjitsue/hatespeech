class FilterManager {
  constructor() {
    this.customBlacklist = [];
    this.customWhitelist = [];
    this.filterStrength = "medium";
    this.enabledLanguages = {
      english: true,
      cebuano: false,
      tagalog: false,
    };
  }

  // Update settings
  updateSettings(settings) {
    if (settings.customBlacklist) {
      this.customBlacklist = settings.customBlacklist;
    }

    if (settings.customWhitelist) {
      this.customWhitelist = settings.customWhitelist;
    }

    if (settings.filterStrength) {
      this.filterStrength = settings.filterStrength;
    }

    if (settings.filterLanguages) {
      this.enabledLanguages = settings.filterLanguages;
    }
  }

  // Filter text using all enabled filters
  filterText(text, detectedLanguage = null) {
    if (!text) return text;

    let filteredText = text;

    // Apply custom blacklist first
    if (this.customBlacklist.length > 0) {
      const blacklistPattern = this.customBlacklist
        .map((word) => `\\b${word}\\b`)
        .join("|");
      const blacklistRegex = new RegExp(blacklistPattern, "gi");
      filteredText = filteredText.replace(blacklistRegex, (match) =>
        "*".repeat(match.length)
      );
    }

    // If language was detected, prioritize that filter but still check others based on settings
    if (detectedLanguage && detectedLanguage !== "unknown") {
      switch (detectedLanguage) {
        case "english":
          if (this.enabledLanguages.english) {
            filteredText = englishFilter.filterText(filteredText);
          }
          break;
        case "cebuano":
          if (this.enabledLanguages.cebuano) {
            filteredText = cebuanoFilter.filterText(filteredText);
          }
          break;
        case "tagalog":
          if (this.enabledLanguages.tagalog) {
            filteredText = tagalogFilter.filterText(filteredText);
          }
          break;
      }
    } else {
      // No specific language detected, apply all enabled filters
      if (this.enabledLanguages.english) {
        filteredText = englishFilter.filterText(filteredText);
      }

      if (this.enabledLanguages.cebuano) {
        filteredText = cebuanoFilter.filterText(filteredText);
      }

      if (this.enabledLanguages.tagalog) {
        filteredText = tagalogFilter.filterText(filteredText);
      }
    }

    // Apply whitelist - restore any whitelisted words that may have been filtered
    if (this.customWhitelist.length > 0) {
      for (const word of this.customWhitelist) {
        const asterisks = "*".repeat(word.length);
        const whitelistRegex = new RegExp(`\\b${asterisks}\\b`, "g");
        filteredText = filteredText.replace(whitelistRegex, word);
      }
    }

    return filteredText;
  }
}

const filterManager = new FilterManager();
