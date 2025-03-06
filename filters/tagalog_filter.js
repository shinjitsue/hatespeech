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

    // Create a comprehensive regex pattern
    this.buildRegexPattern();
  }

  buildRegexPattern() {
    // Combine base words and variations
    let allTerms = [...this.profanityList];

    // Add all variations
    for (const key in this.variations) {
      allTerms = [...allTerms, ...this.variations[key]];
    }

    // Create regex pattern that matches whole words
    const pattern = allTerms.map((term) => `\\b${term}\\b`).join("|");
    this.filterRegex = new RegExp(pattern, "gi");
  }

  // Context-aware filtering
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

// Create a global instance
const tagalogFilter = new TagalogFilter();
