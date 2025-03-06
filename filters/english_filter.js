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

  // Modified method to return an object with the filtered text and positions of profane words
  filterText(text, blurMode = false) {
    if (!text) return blurMode ? { text: "", profaneWords: [] } : "";

    if (!blurMode) {
      // Original asterisk replacement behavior
      return text.replace(this.filterRegex, (match) =>
        "*".repeat(match.length)
      );
    } else {
      // For blur mode, return original text but track profane word positions
      const profaneWords = [];
      // Create a new instance of the regex for this search
      // (since regex with the 'g' flag maintains state between executions)
      const regex = new RegExp(this.filterRegex);
      let match;
      while ((match = regex.exec(text)) !== null) {
        profaneWords.push({
          word: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }

      return {
        text: text,
        profaneWords: profaneWords,
      };
    }
  }

  // Existing method remains unchanged
  containsProfanity(text) {
    if (!text) return false;
    return this.filterRegex.test(text);
  }
}

const englishFilter = new EnglishFilter();
