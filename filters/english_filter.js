class EnglishFilter {
  constructor() {
    // Existing code remains unchanged
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

    this.buildRegexPattern();
  }

  buildRegexPattern() {
    // Existing code with escape characters added
    let allTerms = [...this.profanityList];

    for (const key in this.variations) {
      allTerms = [...allTerms, ...this.variations[key]];
    }

    // Escape any special regex characters in the terms
    const escapedTerms = allTerms.map((term) =>
      term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );

    const pattern = escapedTerms.map((term) => `\\b${term}\\b`).join("|");
    this.filterRegex = new RegExp(pattern, "gi");
  }

  filterText(text) {
    if (!text) return text;

    // Replace matched words with asterisks
    return text.replace(this.filterRegex, (match) => "*".repeat(match.length));
  }

  // Check if text contains profanity
  containsProfanity(text) {
    if (!text) return false;
    return this.filterRegex.test(text);
  }
}

const englishFilter = new EnglishFilter();
