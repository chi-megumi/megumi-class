import type { TestBlock, TestQuestion } from '~/modules/teacher/types'

export type BlockStatItem = {
  id: string
  title: string
  totalQuestions: number
  answeredCount: number
  isComplete: boolean
}

export type ExamQuestionsStats = {
  totalQuestions: number
  answeredCount: number
  unansweredCount: number
  completionPercentage: number
  blocksStats: BlockStatItem[]
}

/**
 * Calculates question completion statistics for a student's active test session.
 * Correctly handles all block types in Megumi:
 * - multiple_choice: block.content.questions
 * - fill_blank: block.content.questions (or block-level answer fallback)
 * - matching: block.content.pairs (keyed by `${block.id}_${pair.id}`)
 * - reorder: block.content.questions (keyed by question.id)
 * - reading: block.content.passages[].questions or block.content.questions
 */
export function calculateExamQuestionsStats(
  blocks: TestBlock[],
  answers: Record<string, string | number>,
): ExamQuestionsStats {
  let totalQuestions = 0
  let answeredCount = 0
  const blocksStats: BlockStatItem[] = []

  blocks.forEach((block: TestBlock, index: number) => {
    let blockTotal = 0
    let blockAnswered = 0

    if (block.type === 'multiple_choice') {
      block.content?.questions?.forEach((q: TestQuestion) => {
        blockTotal++
        const val = answers[q.id]
        if (val !== undefined && val !== null && val !== '') {
          blockAnswered++
        }
      })
    } else if (block.type === 'fill_blank') {
      const questions = block.content?.questions
      if (Array.isArray(questions) && questions.length > 0) {
        questions.forEach((q: TestQuestion) => {
          blockTotal++
          const val = answers[q.id]
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            blockAnswered++
          }
        })
      } else {
        blockTotal++
        const val = answers[block.id]
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          blockAnswered++
        }
      }
    } else if (block.type === 'matching') {
      const pairs = block.content?.pairs
      if (Array.isArray(pairs)) {
        pairs.forEach((p) => {
          blockTotal++
          const key = `${block.id}_${p.id}`
          const val = answers[key]
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            blockAnswered++
          }
        })
      }
    } else if (block.type === 'reorder') {
      const questions = block.content?.questions
      if (Array.isArray(questions)) {
        questions.forEach((q: TestQuestion) => {
          blockTotal++
          const key = q.id
          const val = answers[key]
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            blockAnswered++
          }
        })
      }
    } else if (block.type === 'reading') {
      const allQuestions: TestQuestion[] = []
      if (Array.isArray(block.content?.passages) && block.content.passages.length > 0) {
        block.content.passages.forEach((p) => {
          if (Array.isArray(p.questions)) allQuestions.push(...p.questions)
        })
      } else if (Array.isArray(block.content?.questions)) {
        allQuestions.push(...block.content.questions)
      }
      allQuestions.forEach((q: TestQuestion) => {
        blockTotal++
        const val = answers[q.id]
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          blockAnswered++
        }
      })
    } else if (Array.isArray(block.content?.questions) && block.content.questions.length > 0) {
      block.content.questions.forEach((q: TestQuestion) => {
        blockTotal++
        const val = answers[q.id]
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          blockAnswered++
        }
      })
    }

    totalQuestions += blockTotal
    answeredCount += blockAnswered

    blocksStats.push({
      id: block.id,
      title: block.title || `Phần ${index + 1}`,
      totalQuestions: blockTotal,
      answeredCount: blockAnswered,
      isComplete: blockTotal > 0 ? blockAnswered >= blockTotal : true,
    })
  })

  const unansweredCount = Math.max(0, totalQuestions - answeredCount)
  const completionPercentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 100

  return {
    totalQuestions,
    answeredCount,
    unansweredCount,
    completionPercentage,
    blocksStats,
  }
}
