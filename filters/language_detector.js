class LanguageDetector {
  // Very basic language detection based on common words
  detectLanguage(text) {
    if (!text) return null;

    // Convert to lowercase for better matching
    const lowerText = text.toLowerCase();

    // Common words for each language (expand these lists for better detection)
    const englishWords = [
      "the",
      "and",
      "is",
      "in",
      "to",
      "you",
      "that",
      "it",
      "with",
    ];
    const cebuanoWords = [
      "ang",
      "nga",
      "sa",
      "kay",
      "ug",
      "ni",
      "kini",
      "ako",
      "ikaw",
      "siya",
    ];
    const tagalogWords = [
      "ang",
      "ng",
      "sa",
      "ko",
      "mo",
      "na",
      "at",
      "ay",
      "sino",
      "ano",
    ];

    // Count matches for each language
    let englishCount = 0;
    let cebuanoCount = 0;
    let tagalogCount = 0;

    // Split into words
    const words = lowerText.split(/\s+/);

    // Count occurrences of common words
    for (const word of words) {
      const cleanWord = word.replace(/[^\w\s]/g, ""); // Remove punctuation
      if (englishWords.includes(cleanWord)) englishCount++;
      if (cebuanoWords.includes(cleanWord)) cebuanoCount++;
      if (tagalogWords.includes(cleanWord)) tagalogCount++;
    }

    // Determine the language with the most matches
    if (englishCount > cebuanoCount && englishCount > tagalogCount) {
      return "english";
    } else if (cebuanoCount > englishCount && cebuanoCount > tagalogCount) {
      return "cebuano";
    } else if (tagalogCount > englishCount && tagalogCount > cebuanoCount) {
      return "tagalog";
    } else {
      // If tied or no matches, default to checking all
      return "unknown";
    }
  }
}

const languageDetector = new LanguageDetector();
