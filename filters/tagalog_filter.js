class TagalogFilter {
  constructor() {
    // Basic Tagalog profanity list
    this.profanityList = [
      "putangina",
      "puta",
      "tangina",
      "gago",
      "tarantado",
      "tae",
      "ulol",
      "burat",
      "tite",
      "puki",
      "bobo",
      "lintik",
      "hinayupak",
      "hayop",
      "hayup",
      "iniyot",
      "kantot",
      "jakol",
      "leche",
      "letse",
      "olok",
      "tatanga",
      "kupal",
      "kingina",
      "bwisit",
      "engot",
      "pokpok",
      "punyeta",
      "peste",
      "hudas",
      "demonyo",
      "buwisit",
      "buisit",
      "pucha",
      "siraulo",
      "walang hiya",
      "hindot",
      // Add more words as necessary
    ];

    // Common variations and misspellings
    this.variations = {
      putangina: [
        "p*tangina",
        "ptangina",
        "pu*angina",
        "putang ina",
        "tang ina",
        "p.i",
        "pt*ngina",
      ],
      gago: ["g@go", "g*g0", "g*go"],
      tanga: ["t@nga", "t*ng@", "t@ng@"],
      bobo: ["b0b0", "b*b*", "b0bo"],
      tarantado: ["t@r@nt@do", "t*r*nt*d0"],
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
const tagalogFilter = new TagalogFilter();
