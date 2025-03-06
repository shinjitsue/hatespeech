class EnglishFilter {
  constructor() {
    this.profanityList = [
      // Common profane words
      "fuck",
      "shit",
      "asshole",
      "bitch",
      "dick",
      "pussy",
      "cunt",
      // Add more words as necessary
    ];

    this.variations = {
      fuck: ["f\\*ck", "f\\*\\*k", "fuk", "fck", "f u c k", "f-u-c-k"],
      shit: ["sh\\*t", "s\\*\\*t", "sh!t", "sh1t", "s h i t"],
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

const englishFilter = new EnglishFilter();
