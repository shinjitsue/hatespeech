class CebuanoFilter {
  constructor() {
    // Basic Cebuano profanity list
    this.profanityList = [
      "bilat",
      "buang",
      "bayot",
      "pisti",
      "yawa",
      "giatay",
      "pakyas",
      "bogo",
      "animal",
      "tanga",
      "baliw",
      "hindot",
      "libog",
      "puke",
      "oten",
      "unggoy",
      "bugo",
      "tae",
      "tampal-tinai",
      "ulol",
      "pokpok",
      "puta",
      "putang ina",
      "iyot",
      // Add more words as necessary
    ];

    // Common variations and misspellings
    this.variations = {
      bilat: ["b!lat", "b1lat", "b*lat", "b1l@t"],
      buang: ["bu@ng", "bw@ng", "bu@n6"],
      yawa: ["y@w@", "y@wa", "yaw@", "y@w4"],
      giatay: ["g1@t@y", "g!@t@y", "g1atay"],
      // Add more variations
    };

    // Pre-compile the regex pattern only once
    this.buildRegexPattern();

    // Prepare a word map for faster replacements
    this.wordReplacementMap = new Map();
    this.buildWordReplacementMap();
  }

  buildRegexPattern() {
    let allTerms = [...this.profanityList];
    for (const key in this.variations) {
      allTerms = [...allTerms, ...this.variations[key]];
    }

    // Escape any special regex characters in the terms
    const escapedTerms = allTerms.map((term) =>
      term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );

    // Use word boundaries for more accurate matching
    const pattern = escapedTerms.map((term) => `\\b${term}\\b`).join("|");
    this.filterRegex = new RegExp(pattern, "gi");
  }

  buildWordReplacementMap() {
    // Pre-compute asterisk replacements for all words
    this.profanityList.forEach((word) => {
      this.wordReplacementMap.set(word.toLowerCase(), "*".repeat(word.length));
    });

    // Add variations
    for (const [base, variants] of Object.entries(this.variations)) {
      variants.forEach((variant) => {
        const cleanVariant = variant.replace(/\\|\*/g, "");
        this.wordReplacementMap.set(
          cleanVariant.toLowerCase(),
          "*".repeat(cleanVariant.length)
        );
      });
    }
  }

  filterText(text) {
    if (!text || text.trim() === "") return text;

    // Reset regex lastIndex to avoid inconsistent matching across calls
    this.filterRegex.lastIndex = 0;

    // Use the cached replacement map when possible for faster replacement
    return text.replace(this.filterRegex, (match) => {
      const lowerMatch = match.toLowerCase();
      if (this.wordReplacementMap.has(lowerMatch)) {
        return this.wordReplacementMap.get(lowerMatch);
      }
      return "*".repeat(match.length);
    });
  }

  containsProfanity(text) {
    if (!text) return false;
    this.filterRegex.lastIndex = 0;
    return this.filterRegex.test(text);
  }
}

// Create a global instance
const cebuanoFilter = new CebuanoFilter();
