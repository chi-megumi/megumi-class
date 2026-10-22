export type DisplayOption = {
  label: string
  text: string
  index: number
}

/**
 * Returns active display options for a multiple choice question.
 * If the question only has 2 options (e.g. True/False, Đúng/Sai, or empty C/D),
 * only returns options A and B (omitting C and D).
 */
export function getActiveQuestionOptions(options?: string[]): DisplayOption[] {
  if (!Array.isArray(options) || options.length === 0) return []

  // Trim trailing empty options after index 1
  let lastNonEmptyIdx = options.length - 1
  while (lastNonEmptyIdx >= 2 && (!options[lastNonEmptyIdx] || !String(options[lastNonEmptyIdx]).trim())) {
    lastNonEmptyIdx--
  }

  const validCount = Math.max(2, lastNonEmptyIdx + 1)
  const sliced = options.slice(0, Math.min(options.length, validCount))

  return sliced.map((text, idx) => ({
    label: String.fromCharCode(65 + idx),
    text: text ?? '',
    index: idx,
  }))
}

/**
 * Sanitizes options array by trimming whitespace on each option.
 * Preserves the option array structure.
 */
export function sanitizeMultipleChoiceOptions(options?: string[]): string[] {
  if (!Array.isArray(options) || options.length === 0) return ['', '', '', '']
  return options.map((opt) => String(opt ?? '').trim())
}
