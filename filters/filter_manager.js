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

    // Precompiled regex patterns for custom lists
    this.blacklistRegex = null;
    this.whitelistMap = new Map();
  }

  // Update settings
  updateSettings(settings) {
    if (settings.customBlacklist) {
      this.customBlacklist = settings.customBlacklist;
      this.compileBlacklistRegex();
    }

    if (settings.customWhitelist) {
      this.customWhitelist = settings.customWhitelist;
      this.buildWhitelistMap();
    }

    if (settings.filterStrength) {
      this.filterStrength = settings.filterStrength;
    }

    if (settings.filterLanguages) {
      this.enabledLanguages = settings.filterLanguages;
    }
  }

  compileBlacklistRegex() {
    if (this.customBlacklist.length === 0) {
      this.blacklistRegex = null;
      return;
    }

    // Escape regex special characters
    const escapedTerms = this.customBlacklist.map((word) =>
      word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );

    const pattern = escapedTerms.map((term) => `\\b${term}\\b`).join("|");
    this.blacklistRegex = new RegExp(pattern, "gi");
  }

  buildWhitelistMap() {
    this.whitelistMap.clear();
    this.customWhitelist.forEach((word) => {
      this.whitelistMap.set("*".repeat(word.length), word);
    });
  }

  // Filter text using all enabled filters
  filterText(text, detectedLanguage = null) {
    if (!text) return text;

    let filteredText = text;

    // Apply custom blacklist first - now with precompiled regex
    if (this.blacklistRegex) {
      filteredText = filteredText.replace(this.blacklistRegex, (match) =>
        "*".repeat(match.length)
      );
    }

    // Apply language filters based on detection or settings
    const applyLanguageFilters = (lang) => {
      switch (lang) {
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
    };

    if (detectedLanguage && detectedLanguage !== "unknown") {
      applyLanguageFilters(detectedLanguage);
    } else {
      // No specific language detected, apply enabled filters
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

    // Apply whitelist with optimized map lookup
    if (this.whitelistMap.size > 0) {
      // More efficient regex replacement with precomputed map
      for (const [asterisks, word] of this.whitelistMap.entries()) {
        const whitelistRegex = new RegExp(`\\b${asterisks}\\b`, "g");
        filteredText = filteredText.replace(whitelistRegex, word);
      }
    }

    return filteredText;
  }
}

const filterManager = new FilterManager();
