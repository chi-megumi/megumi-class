import { TestBlock } from '@/modules/teacher/types'
import { shuffleReorderWords, splitSentenceWords } from '@/modules/teacher/utils/reorderUtils'

/**
 * Fisher-Yates array shuffle helper.
 * Returns a new array with elements shuffled randomly.
 */
export function shuffleArray<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Shuffles questions for a retakable exam:
 * 1. Groups blocks by template type (multiple_choice, fill_blank, reorder).
 * 2. Pools questions from blocks of the same template type and shuffles the pool.
 * 3. Re-distributes the questions back to those blocks (e.g. Part 1 questions swap into Part 2).
 * 4. Shuffles matching pairs within matching blocks.
 */
export function shuffleRetakableExam(originalBlocks: TestBlock[]): TestBlock[] {
  if (!originalBlocks || originalBlocks.length === 0) return []

  // Deep clone to avoid mutating input references
  const clonedBlocks: TestBlock[] = JSON.parse(JSON.stringify(originalBlocks))

  // Group block indices by type
  const typeGroups = new Map<string, number[]>()
  clonedBlocks.forEach((block, idx) => {
    const group = typeGroups.get(block.type) || []
    group.push(idx)
    typeGroups.set(block.type, group)
  })

  // For each type group, pool and distribute
  typeGroups.forEach((blockIndices, type) => {
    if (type === 'matching') {
      blockIndices.forEach((bIdx) => {
        const block = clonedBlocks[bIdx]
        if (block.content?.pairs && Array.isArray(block.content.pairs)) {
          // Preserve text from existing shuffledRight and/or p.right
          const rightTextMap = new Map<string, string>()
          if (Array.isArray(block.content.shuffledRight)) {
            block.content.shuffledRight.forEach((r) => {
              if (r.id && r.text) rightTextMap.set(r.id, r.text)
            })
          }
          block.content.pairs.forEach((p) => {
            if (p.id && p.right) rightTextMap.set(p.id, p.right)
          })

          const shuffledPairs = shuffleArray(block.content.pairs)
          block.content.pairs = shuffledPairs

          const rightCandidates = shuffledPairs.map((p) => ({
            id: p.id,
            text: rightTextMap.get(p.id) || p.right || '',
          }))
          block.content.shuffledRight = shuffleArray(rightCandidates)
        }
      })
      return
    }

    if (type === 'reading') {
      // Reading questions are tied to their specific passages; do not pool across blocks
      blockIndices.forEach((bIdx) => {
        const block = clonedBlocks[bIdx]
        if (block.content?.passages && Array.isArray(block.content.passages)) {
          block.content.passages = block.content.passages.map((p) => ({
            ...p,
            questions: p.questions ? shuffleArray(p.questions) : [],
          }))
          block.content.questions = block.content.passages.flatMap((p) => p.questions)
        } else if (block.content?.questions && Array.isArray(block.content.questions)) {
          block.content.questions = shuffleArray(block.content.questions)
        }
      })
      return
    }

    // For question-based blocks (multiple_choice, fill_blank, reorder), shuffle internally within each block
    blockIndices.forEach((bIdx) => {
      const b = clonedBlocks[bIdx]
      if (b.content?.questions && Array.isArray(b.content.questions)) {
        let qs = shuffleArray(b.content.questions)
        if (type === 'reorder') {
          qs = qs.map((q) => {
            const baseWords =
              q.words && q.words.length > 0 ? q.words : splitSentenceWords(q.sentence)
            return {
              ...q,
              words: shuffleReorderWords(baseWords),
            }
          })
        }
        b.content.questions = qs
      }
    })
  })

  return clonedBlocks
}
