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
const cebuanoFilter = new CebuanoFilter();
