import type { MatchingPair, TestBlock, TestQuestion } from '@/modules/teacher/types'
import { ensureShuffledWords } from '@/modules/teacher/utils/reorderUtils'

/**
 * Utility to shuffle an array (Fisher-Yates)
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Utility to sanitize exams for student view (remove correctIndex, sentence answers, etc.)
 */
export function sanitizeExams<T extends { content?: unknown }>(
  exams: T[],
  options?: { isReviewMode?: boolean }
): (T & { content?: TestBlock[] })[] {
  if (!Array.isArray(exams)) return []
  const isReviewMode = options?.isReviewMode ?? false

  return exams.map((test) => {
    if (!test.content || !Array.isArray(test.content)) {
      return test as T & { content?: TestBlock[] }
    }

    const blocks = test.content as TestBlock[]
    const sanitizedBlocks: TestBlock[] = blocks.map((block) => {
      if (block.type === 'multiple_choice') {
        const questions = block.content?.questions?.map((q: TestQuestion) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { correctIndex, explanation, ...rest } = q
          return isReviewMode && explanation !== undefined ? { ...rest, explanation } : rest
        })
        return {
          ...block,
          content: {
            ...block.content,
            questions,
          },
        }
      }

      if (block.type === 'reading') {
        const seenIds = new Set<string>()
        const ensureUniqueId = (rawId: string | undefined, pIdx: number, qIdx: number): string => {
          let id = rawId?.trim() || `p${pIdx + 1}_q${qIdx + 1}`
          if (seenIds.has(id)) {
            id = `${id}_p${pIdx + 1}_${qIdx + 1}`
          }
          seenIds.add(id)
          return id
        }

        const passages = block.content?.passages?.map((p, pIdx) => ({
          ...p,
          questions: p.questions?.map((q: TestQuestion, qIdx: number) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { correctIndex, answer, explanation, ...rest } = q
            const id = ensureUniqueId(q.id, pIdx, qIdx)
            return {
              ...rest,
              ...(isReviewMode && explanation !== undefined ? { explanation } : {}),
              id,
            }
          }),
        }))

        const questions =
          passages && passages.length > 0
            ? passages.flatMap((p) => p.questions || [])
            : block.content?.questions?.map((q: TestQuestion, qIdx: number) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { correctIndex, answer, explanation, ...rest } = q
                const id = ensureUniqueId(q.id, 0, qIdx)
                return {
                  ...rest,
                  ...(isReviewMode && explanation !== undefined ? { explanation } : {}),
                  id,
                }
              })

        return {
          ...block,
          content: {
            ...block.content,
            questions,
            passages,
          },
        }
      }

      if (block.type === 'fill_blank') {
        if (Array.isArray(block.content?.questions)) {
          const questions = block.content.questions.map((q: TestQuestion) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { answer, explanation, ...rest } = q
            return isReviewMode && explanation !== undefined ? { ...rest, explanation } : rest
          })
          return {
            ...block,
            content: {
              ...block.content,
              questions,
            },
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { answer, explanation, ...restContent } = block.content || {}
        return {
          ...block,
          content: isReviewMode && explanation !== undefined ? { ...restContent, explanation } : restContent,
        }
      }

      if (block.type === 'matching') {
        const pairs: MatchingPair[] = Array.isArray(block.content?.pairs)
          ? block.content.pairs
          : []

        const existingRightMap = new Map<string, string>()
        if (Array.isArray(block.content?.shuffledRight)) {
          block.content.shuffledRight.forEach((r: { id: string; text: string }) => {
            if (r.id && r.text) existingRightMap.set(r.id, r.text)
          })
        }
        pairs.forEach((p) => {
          if (p.id && p.right) existingRightMap.set(p.id, p.right)
        })

        const sanitizedPairs: MatchingPair[] = pairs.map((p) => ({
          id: p.id,
          left: p.left,
        }))
        const shuffledRight = shuffleArray(
          pairs.map((p) => ({
            id: p.id,
            text: existingRightMap.get(p.id) || p.right || '',
          }))
        )
        return {
          ...block,
          content: {
            ...block.content,
            pairs: sanitizedPairs,
            shuffledRight,
          },
        }
      }

      if (block.type === 'reorder') {
        const questions: TestQuestion[] = Array.isArray(block.content?.questions)
          ? block.content.questions
          : []
        const sanitizedQuestions = questions.map((q) => {
          const { sentence, ...rest } = q
          const words = ensureShuffledWords(sentence, q.words)
          return {
            ...rest,
            words,
          }
        })
        return {
          ...block,
          content: {
            ...block.content,
            questions: sanitizedQuestions,
          },
        }
      }

      return block
    })

    return {
      ...test,
      content: sanitizedBlocks,
    }
  })
}
