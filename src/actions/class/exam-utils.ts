import type { MatchingPair, TestBlock, TestQuestion } from '@/modules/teacher/types'

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
  exams: T[]
): (T & { content?: TestBlock[] })[] {
  if (!Array.isArray(exams)) return []

  return exams.map((test) => {
    if (!test.content || !Array.isArray(test.content)) {
      return test as T & { content?: TestBlock[] }
    }

    const blocks = test.content as TestBlock[]
    const sanitizedBlocks: TestBlock[] = blocks.map((block) => {
      if (block.type === 'multiple_choice') {
        const questions = block.content?.questions?.map((q: TestQuestion) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { correctIndex, ...rest } = q
          return rest
        })
        return {
          ...block,
          content: {
            ...block.content,
            questions,
          },
        }
      }

      if (block.type === 'fill_blank') {
        if (Array.isArray(block.content?.questions)) {
          const questions = block.content.questions.map((q: TestQuestion) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { answer, ...rest } = q
            return rest
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
        const { answer, ...restContent } = block.content || {}
        return {
          ...block,
          content: restContent,
        }
      }

      if (block.type === 'matching') {
        const pairs: MatchingPair[] = Array.isArray(block.content?.pairs)
          ? block.content.pairs
          : []
        const sanitizedPairs: MatchingPair[] = pairs.map((p) => ({
          id: p.id,
          left: p.left,
        }))
        const shuffledRight = shuffleArray(
          pairs.map((p) => ({
            id: p.id,
            text: p.right || '',
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
          const words = shuffleArray(
            (sentence || '').trim().split(/\s+/).filter(Boolean)
          )
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
