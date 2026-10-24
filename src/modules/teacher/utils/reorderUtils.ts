/**
 * Utility functions for sentence reordering questions.
 */

/**
 * Splits a sentence into word chips by whitespace, filtering out empty entries.
 */
export function splitSentenceWords(sentence?: string | null): string[] {
  if (!sentence) return []
  return sentence.trim().split(/\s+/).filter(Boolean)
}

/**
 * Checks whether two arrays of words contain the exact same items (multiset equality).
 */
export function isMultisetEqual(a?: string[] | null, b?: string[] | null): boolean {
  if (!a || !b) return false
  if (a.length !== b.length) return false

  const countMap = new Map<string, number>()
  for (const w of a) {
    const key = w.toLowerCase()
    countMap.set(key, (countMap.get(key) || 0) + 1)
  }

  for (const w of b) {
    const key = w.toLowerCase()
    const current = countMap.get(key)
    if (!current || current <= 0) return false
    countMap.set(key, current - 1)
  }

  return true
}

/**
 * Checks whether the current words array has the exact same order as the sentence words.
 */
export function areWordsIdenticalToSentence(
  words?: string[] | null,
  sentence?: string | null
): boolean {
  if (!words || !sentence) return false
  const raw = splitSentenceWords(sentence)
  if (words.length !== raw.length) return false
  return words.every((w, idx) => w === raw[idx])
}

/**
 * Shuffles an array of words (Word Chips) using Fisher-Yates,
 * ensuring the resulting order is NOT identical to the original sentence order
 * whenever there are at least two distinct words.
 */
export function shuffleReorderWords(words: string[]): string[] {
  if (!words || words.length <= 1) return words ? [...words] : []

  // Check if all words are identical
  const first = words[0].toLowerCase()
  const hasDistinctWords = words.some((w) => w.toLowerCase() !== first)
  if (!hasDistinctWords) return [...words]

  const result = [...words]

  // Try Fisher-Yates up to 15 times to get a non-identical permutation
  for (let attempt = 0; attempt < 15; attempt++) {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    const isIdentical = result.every((w, idx) => w === words[idx])
    if (!isIdentical) {
      return result
    }
  }

  // If still identical by chance, deterministically swap two different items
  for (let i = 0; i < result.length; i++) {
    for (let j = i + 1; j < result.length; j++) {
      if (result[i].toLowerCase() !== result[j].toLowerCase()) {
        ;[result[i], result[j]] = [result[j], result[i]]
        return result
      }
    }
  }

  return result
}

/**
 * Returns an effective list of words for a reorder question.
 * If existing words match the sentence and are NOT in the exact sentence order, preserve them.
 * Otherwise, generate a freshly shuffled list of words.
 */
export function ensureShuffledWords(
  sentence?: string | null,
  existingWords?: string[] | null
): string[] {
  if (!sentence) {
    return existingWords && existingWords.length > 0 ? [...existingWords] : []
  }
  const rawWords = splitSentenceWords(sentence)
  if (rawWords.length <= 1) return rawWords

  if (
    existingWords &&
    existingWords.length === rawWords.length &&
    isMultisetEqual(existingWords, rawWords)
  ) {
    const isIdentical = existingWords.every((w, i) => w === rawWords[i])
    if (!isIdentical) {
      return [...existingWords]
    }
  }

  return shuffleReorderWords(rawWords)
}
