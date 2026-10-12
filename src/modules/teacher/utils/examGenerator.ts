import { VocabItemData, TestBlock, TestQuestion, MatchingPair } from '../types'

export type QuestionTypeOption =
  | 'en_to_vi'
  | 'vi_to_en'
  | 'example_mc'
  | 'fill_blank'
  | 'matching'
  | 'reorder'

export interface ExamGeneratorConfig {
  title?: string
  duration?: number
  numQuestions: number
  questionTypes: QuestionTypeOption[]
  typeCounts?: Partial<Record<QuestionTypeOption, number>>
}

export interface GeneratedExamResult {
  title: string
  duration: number
  blocks: TestBlock[]
}

/**
 * Distributes total questions across selected types.
 * Constraints:
 * - Always prioritizes EVEN numbers from top down.
 * - Prioritizes rounding to base 10 (10, 20...) from top down.
 */
export function distributeQuestionCounts(
  total: number,
  types: QuestionTypeOption[]
): Record<QuestionTypeOption, number> {
  const result: Record<string, number> = {}
  const k = types.length
  if (k === 0) return {} as Record<QuestionTypeOption, number>
  if (k === 1) {
    return { [types[0]]: Math.max(1, total) } as Record<QuestionTypeOption, number>
  }

  // Minimum each is 2 if total >= 2*k, otherwise 1
  const minEach = total >= k * 2 ? 2 : 1
  const counts = new Array(k).fill(minEach)
  let remaining = total - k * minEach

  // Step 1: Prioritize bringing items to multiples of 10 from top down
  for (let i = 0; i < k; i++) {
    const needed = 10 - counts[i]
    if (needed > 0 && remaining >= needed) {
      counts[i] += needed
      remaining -= needed
    }
  }

  // Step 2: If there's still a large surplus (remaining >= 10), add 10s from top down
  for (let i = 0; i < k; i++) {
    while (remaining >= 10) {
      counts[i] += 10
      remaining -= 10
    }
  }

  // Step 3: Distribute remaining in increments of 2 (even numbers) from top down.
  // First, prefer items that are still below 10
  while (remaining >= 2) {
    let added = false
    for (let i = 0; i < k; i++) {
      if (remaining >= 2 && counts[i] < 10) {
        counts[i] += 2
        remaining -= 2
        added = true
      }
    }
    // If all items reached at least 10, distribute top down
    if (!added) {
      for (let i = 0; i < k; i++) {
        if (remaining >= 2) {
          counts[i] += 2
          remaining -= 2
          added = true
        }
      }
    }
    if (!added) break
  }

  // Step 4: If remaining === 1 (odd total), absorb it into the last item so top items stay even
  if (remaining === 1) {
    counts[k - 1] += 1
    remaining = 0
  }

  types.forEach((type, idx) => {
    result[type] = counts[idx]
  })

  return result as Record<QuestionTypeOption, number>
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Creates blanked text by replacing target word in example sentence.
 */
function createBlankedSentence(example: string, word: string, blankStr: string): string | null {
  const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i')
  if (regex.test(example)) {
    return example.replace(regex, blankStr)
  }
  // Try loose matching if word has plurals or endings
  const looseRegex = new RegExp(escapeRegExp(word), 'i')
  if (looseRegex.test(example)) {
    return example.replace(looseRegex, blankStr)
  }
  return null
}

/**
 * Generates an exam from a pool of vocabulary items.
 */
export function generateExamFromVocab(
  vocabItems: VocabItemData[],
  config: ExamGeneratorConfig
): GeneratedExamResult {
  if (!vocabItems || vocabItems.length === 0) {
    throw new Error('Danh sách từ vựng trống, không thể tạo đề!')
  }

  const {
    title = 'Bài kiểm tra từ vựng',
    duration = 15,
    numQuestions = Math.min(10, vocabItems.length),
    questionTypes = ['en_to_vi', 'vi_to_en'] as QuestionTypeOption[],
    typeCounts,
  } = config

  const activeTypes: QuestionTypeOption[] = questionTypes.length > 0 ? questionTypes : ['en_to_vi', 'vi_to_en']
  const allocatedCounts = typeCounts || distributeQuestionCounts(numQuestions, activeTypes)

  // Calculate total needed items
  const totalAllocated = activeTypes.reduce((sum, t) => sum + (allocatedCounts[t] || 0), 0)
  const actualTargetTotal = totalAllocated > 0 ? totalAllocated : numQuestions

  // Create an expanded pool of candidate items
  let itemPool = shuffle(vocabItems)
  while (itemPool.length < actualTargetTotal * 2) {
    itemPool = [...itemPool, ...shuffle(vocabItems)]
  }

  let poolIdx = 0
  const getSliceForType = (count: number): VocabItemData[] => {
    const slice = itemPool.slice(poolIdx, poolIdx + count)
    poolIdx += count
    return slice
  }

  const mcQuestions: TestQuestion[] = []
  const fillBlankQuestions: TestQuestion[] = []
  const matchingPairs: MatchingPair[] = []
  const reorderQuestions: TestQuestion[] = []

  activeTypes.forEach((qType) => {
    const count = allocatedCounts[qType] || 0
    if (count <= 0) return

    const selectedForType = getSliceForType(count)

    selectedForType.forEach((target) => {
      const otherVocabs = vocabItems.filter(v => v.id !== target.id && v.word.toLowerCase() !== target.word.toLowerCase())

      if (qType === 'matching') {
        matchingPairs.push({
          id: crypto.randomUUID(),
          left: target.word.trim(),
          right: target.vi.trim(),
        })
        return
      }

      if (qType === 'reorder') {
        let exampleSentence = target.example?.trim() || null
        let exampleVi = target.exampleVi?.trim() || null

        if (!exampleSentence) {
          const itemWithExample = vocabItems.find(v => !!v.example && v.example.trim().length > 0)
          if (itemWithExample) {
            exampleSentence = itemWithExample.example!.trim()
            exampleVi = itemWithExample.exampleVi?.trim() || null
          } else {
            exampleSentence = `I learn the word ${target.word} today.`
            exampleVi = `Tôi học từ ${target.word} hôm nay.`
          }
        }

        reorderQuestions.push({
          id: crypto.randomUUID(),
          text: exampleVi ? `Dịch: ${exampleVi}` : `Sắp xếp các từ thành câu hoàn chỉnh (từ khóa: "${target.word}"):`,
          sentence: exampleSentence,
        })
        return
      }

      if (qType === 'fill_blank') {
        let blankedText: string | null = null
        if (target.example) {
          blankedText = createBlankedSentence(target.example, target.word, '___')
        }

        const text = blankedText
          ? `${blankedText}${target.exampleVi ? ` (${target.exampleVi})` : ''}`
          : `Từ tiếng Anh có nghĩa "${target.vi}" (bắt đầu bằng "${target.word[0]?.toUpperCase() || ''}"): ___`

        fillBlankQuestions.push({
          id: crypto.randomUUID(),
          text,
          answer: target.word.trim(),
        })
        return
      }

      if (qType === 'example_mc') {
        let blankedText: string | null = null
        if (target.example) {
          blankedText = createBlankedSentence(target.example, target.word, '_____')
        }

        if (blankedText) {
          const distractorWords = shuffle(otherVocabs.map(v => v.word))
            .filter(w => w.toLowerCase() !== target.word.toLowerCase())
            .slice(0, 3)

          while (distractorWords.length < 3) {
            distractorWords.push(`option_${distractorWords.length + 1}`)
          }

          const options = shuffle([target.word, ...distractorWords])
          const correctIndex = options.indexOf(target.word)

          mcQuestions.push({
            id: crypto.randomUUID(),
            text: `Chọn từ thích hợp điền vào chỗ trống:\n"${blankedText}"${target.exampleVi ? ` (${target.exampleVi})` : ''}`,
            options,
            correctIndex,
          })
          return
        }
      }

      if (qType === 'vi_to_en') {
        const distractorWords = shuffle(otherVocabs.map(v => v.word))
          .filter(w => w.toLowerCase() !== target.word.toLowerCase())
          .slice(0, 3)

        while (distractorWords.length < 3) {
          distractorWords.push(`option_${distractorWords.length + 1}`)
        }

        const options = shuffle([target.word, ...distractorWords])
        const correctIndex = options.indexOf(target.word)

        mcQuestions.push({
          id: crypto.randomUUID(),
          text: `Từ tiếng Anh nào có nghĩa là: "${target.vi}"?`,
          options,
          correctIndex,
        })
        return
      }

      // Default / en_to_vi
      const distractorMeanings = shuffle(otherVocabs.map(v => v.vi))
        .filter(m => m.toLowerCase() !== target.vi.toLowerCase())
        .slice(0, 3)

      while (distractorMeanings.length < 3) {
        distractorMeanings.push(`đáp án ${distractorMeanings.length + 1}`)
      }

      const options = shuffle([target.vi, ...distractorMeanings])
      const correctIndex = options.indexOf(target.vi)

      mcQuestions.push({
        id: crypto.randomUUID(),
        text: `Nghĩa của từ "${target.word}"${target.pos ? ` (${target.pos})` : ''} là gì?`,
        options,
        correctIndex,
      })
    })
  })

  // Ensure matching has at least 3 distinct pairs if matching is present
  if (matchingPairs.length > 0 && matchingPairs.length < 3) {
    const existingWords = new Set(matchingPairs.map(p => p.left.toLowerCase()))
    const remainingVocabs = vocabItems.filter(v => !existingWords.has(v.word.toLowerCase()))
    for (const extra of shuffle(remainingVocabs)) {
      if (matchingPairs.length >= 3) break
      matchingPairs.push({
        id: crypto.randomUUID(),
        left: extra.word.trim(),
        right: extra.vi.trim(),
      })
    }
  }

  const blocks: TestBlock[] = []

  if (mcQuestions.length > 0) {
    blocks.push({
      id: crypto.randomUUID(),
      type: 'multiple_choice',
      title: `Phần ${blocks.length + 1}: Trắc nghiệm từ vựng (Multiple Choice)`,
      content: {
        questions: mcQuestions,
      },
    })
  }

  if (fillBlankQuestions.length > 0) {
    blocks.push({
      id: crypto.randomUUID(),
      type: 'fill_blank',
      title: `Phần ${blocks.length + 1}: Điền khuyết (Fill in the Blanks)`,
      content: {
        questions: fillBlankQuestions,
      },
    })
  }

  if (matchingPairs.length > 0) {
    blocks.push({
      id: crypto.randomUUID(),
      type: 'matching',
      title: `Phần ${blocks.length + 1}: Ghép nối từ vựng (Matching)`,
      content: {
        pairs: matchingPairs,
      },
    })
  }

  if (reorderQuestions.length > 0) {
    blocks.push({
      id: crypto.randomUUID(),
      type: 'reorder',
      title: `Phần ${blocks.length + 1}: Sắp xếp câu (Sentence Reordering)`,
      content: {
        questions: reorderQuestions,
      },
    })
  }

  return {
    title,
    duration,
    blocks,
  }
}
