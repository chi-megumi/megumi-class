import { MatchingPair, TestBlock, TestQuestion } from '@/modules/teacher/types'

/**
 * Normalizes a sentence by trimming, lowercasing, and removing standard punctuation.
 */
export function normalizeSentence(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export type ExamGradingResult = {
  totalQuestions: number
  correctAnswers: number
  correctAnswersDetail: Record<string, string | number>
  score: number
}

/**
 * Pure function to grade student answers against test blocks.
 * Supports multiple choice, fill in the blank, matching pairs, and sentence reorder.
 */
export function gradeExamBlocks(
  blocks: TestBlock[],
  answers: Record<string, string | number>
): ExamGradingResult {
  let totalQuestions = 0
  let correctAnswers = 0
  const correctAnswersDetail: Record<string, string | number> = {}

  blocks.forEach((block: TestBlock) => {
    if (block.type === 'multiple_choice') {
      block.content?.questions?.forEach((q: TestQuestion) => {
        totalQuestions++
        correctAnswersDetail[q.id] = q.correctIndex ?? 0
        if (answers[q.id] === q.correctIndex) {
          correctAnswers++
        }
      })
    } else if (block.type === 'fill_blank') {
      const questions = block.content?.questions
      if (Array.isArray(questions) && questions.length > 0) {
        questions.forEach((q: TestQuestion) => {
          totalQuestions++
          correctAnswersDetail[q.id] = q.answer || ''
          const answerStr = (answers[q.id] || '').toString().trim().toLowerCase()
          const correctStr = (q.answer || '').toString().trim().toLowerCase()
          if (answerStr === correctStr) {
            correctAnswers++
          }
        })
      } else {
        totalQuestions++
        const blockAnswer = block.content?.answer || ''
        correctAnswersDetail[block.id] = blockAnswer
        const answerStr = (answers[block.id] || '').toString().trim().toLowerCase()
        const correctStr = blockAnswer.toString().trim().toLowerCase()
        if (answerStr === correctStr) {
          correctAnswers++
        }
      }
    } else if (block.type === 'matching') {
      const pairs = block.content?.pairs
      if (Array.isArray(pairs)) {
        pairs.forEach((p: MatchingPair) => {
          totalQuestions++
          const key = `${block.id}_${p.id}`
          correctAnswersDetail[key] = p.right || p.id
          const studentAns = answers[key]
          if (
            studentAns === p.id ||
            (p.right && String(studentAns).trim().toLowerCase() === String(p.right).trim().toLowerCase())
          ) {
            correctAnswers++
          }
        })
      }
    } else if (block.type === 'reorder') {
      const questions = block.content?.questions
      if (Array.isArray(questions)) {
        questions.forEach((q: TestQuestion) => {
          totalQuestions++
          const key = q.id
          correctAnswersDetail[key] = q.sentence || ''
          const studentAns = (answers[key] || '').toString()
          const correctSentence = (q.sentence || '').toString()
          if (normalizeSentence(studentAns) === normalizeSentence(correctSentence)) {
            correctAnswers++
          }
        })
      }
    }
  })

  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100

  return {
    totalQuestions,
    correctAnswers,
    correctAnswersDetail,
    score,
  }
}
