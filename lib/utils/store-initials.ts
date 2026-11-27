const STOPWORDS = new Set(["the", "a", "an", "and", "of"]);

/** Keep letters and numbers (any language), drop punctuation and emoji. */
const clean = (word: string) => word.replace(/[^\p{L}\p{N}]/gu, "");

/**
 * Initials for a store name, used in avatars and loaders.
 *
 *   "Dawang Stores"     -> "DS"
 *   "dawang-stores"     -> "DS"
 *   "Ada's Closet"      -> "AC"
 *   "The Fashion Hub"   -> "FH"   (filler words are skipped)
 *   "Zara"              -> "ZA"   (single word: first two letters)
 *   ""  / null          -> ""     (caller decides on a fallback)
 */
export function getStoreInitials(name?: string | null, maxLength = 2): string {
  if (!name) return "";

  let words = name
    .normalize("NFC")
    .split(/[\s\-_.,/&+]+/)
    .map(clean)
    .filter(Boolean);
  if (words.length === 0) return "";

  // "The Fashion Hub" -> Fashion Hub, but never drop every word ("The")
  const meaningful = words.filter((w) => !STOPWORDS.has(w.toLowerCase()));
  if (meaningful.length > 0) words = meaningful;

  // Array.from splits by code point, so non-Latin letters stay intact
  const letters =
    words.length === 1
      ? Array.from(words[0]).slice(0, maxLength)
      : words.slice(0, maxLength).map((w) => Array.from(w)[0]);

  return letters.join("").toLocaleUpperCase();
}
