'use server'

import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import { MatchingPair, TestBlock, TestQuestion } from '@/modules/teacher/types'
import type {
  ExamQuestionAnalyticsResult,
  QuestionStat,
  TestSubmissionItem,
} from './types'

type StoredResultAnswers = {
  score?: number
  correctAnswers?: number
  totalQuestions?: number
  completedAt?: string
  answers?: Record<string, string | number>
  correctAnswersDetail?: Record<string, string | number>
  attemptCount?: number
  bestScore?: number
  history?: unknown[]
}

/**
 * Fetches all completed submissions for a specific exam.
 * Accessible only by the class teacher.
 */
export async function getTestSubmissions(
  testIdOrUnitId: string,
  maybeTestId?: string
): Promise<TestSubmissionItem[]> {
  const testId = maybeTestId || testIdOrUnitId
  const me = await getMe()
  if (!me || (me.role !== 'teacher' && me.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  const exam = await prisma.exam.findUnique({
    where: { id: testId },
    include: {
      class: true,
      unit: { include: { class: true } },
      results: {
        where: { completedAt: { not: null } },
        include: {
          student: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { completedAt: 'desc' },
      },
    },
  })

  if (!exam) {
    throw new Error('Test not found')
  }

  const teacherId = exam.class?.teacherId || exam.unit?.class?.teacherId
  if (teacherId !== me.id) {
    throw new Error('Unauthorized')
  }

  return exam.results.map((r) => {
    const payload = (r.answers as StoredResultAnswers | null) || {}
    return {
      user: {
        ...r.student,
        name: r.student.name || '',
      },
      result: {
        score: r.score ?? payload.score ?? 0,
        correctAnswers: payload.correctAnswers ?? 0,
        totalQuestions: payload.totalQuestions ?? 0,
        completedAt: r.completedAt || payload.completedAt || new Date(),
        answers: payload.answers || {},
        correctAnswersDetail: payload.correctAnswersDetail || {},
        attemptCount: payload.attemptCount || 1,
        bestScore: payload.bestScore,
        history: payload.history,
      },
    }
  })
}

/**
 * Detailed statistical analysis of questions in an exam:
 * Accuracy rates, common mistakes, and detection of hard questions.
 */
export async function getExamQuestionAnalytics(
  examId: string
): Promise<ExamQuestionAnalyticsResult> {
  const me = await getMe()
  if (!me || (me.role !== 'teacher' && me.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      class: true,
      unit: { include: { class: true } },
      results: {
        where: { completedAt: { not: null } },
        include: {
          student: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  })

  if (!exam) throw new Error('Bài kiểm tra không tồn tại')

  const teacherId = exam.class?.teacherId || exam.unit?.class?.teacherId
  if (teacherId !== me.id) throw new Error('Unauthorized')

  const totalSubmissions = exam.results.length
  const blocks = (exam.content as unknown as TestBlock[]) || []

  const scores = exam.results.map((r) => r.score ?? 0)
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

  const questionStats: QuestionStat[] = []

  blocks.forEach((block, bIdx) => {
    const blockTitle = block.title || `Phần ${bIdx + 1}`

    if (block.type === 'multiple_choice') {
      block.content?.questions?.forEach((q: TestQuestion, qIdx: number) => {
        const correctIndex = q.correctIndex ?? 0
        const correctOpt = q.options?.[correctIndex] || `Đáp án ${correctIndex + 1}`
        let correctCount = 0
        const optionChoiceCounts: Record<number, number> = {}

        exam.results.forEach((r) => {
          const payload = (r.answers as StoredResultAnswers | null) || {}
          const studentAnswers = payload.answers || {}
          const chosen = studentAnswers[q.id]
          if (chosen !== undefined && chosen !== null) {
            const chosenNum = Number(chosen)
            optionChoiceCounts[chosenNum] = (optionChoiceCounts[chosenNum] || 0) + 1
            if (chosenNum === correctIndex) correctCount++
          }
        })

        const totalAttempts = totalSubmissions
        const incorrectCount = totalAttempts - correctCount
        const accuracyRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

        const mistakes: Array<{ answer: string; count: number; percentage: number }> = []
        Object.entries(optionChoiceCounts).forEach(([optIdxStr, count]) => {
          const optIdx = Number(optIdxStr)
          if (optIdx !== correctIndex) {
            const optText = q.options?.[optIdx] || `Lựa chọn ${optIdx + 1}`
            mistakes.push({
              answer: optText,
              count,
              percentage: totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0,
            })
          }
        })
        mistakes.sort((a, b) => b.count - a.count)

        questionStats.push({
          id: q.id,
          blockId: block.id,
          blockTitle,
          type: 'multiple_choice',
          questionText: q.text || `Câu hỏi ${qIdx + 1}`,
          correctAnswerText: correctOpt,
          totalAttempts,
          correctCount,
          incorrectCount,
          accuracyRate,
          isHardQuestion: accuracyRate < 50,
          difficultyLevel: accuracyRate < 50 ? 'hard' : accuracyRate < 80 ? 'medium' : 'easy',
          mistakes,
        })
      })
    } else if (block.type === 'fill_blank') {
      const questions: TestQuestion[] =
        block.content?.questions && block.content.questions.length > 0
          ? block.content.questions
          : [{ id: block.id, text: block.content?.text || '', answer: block.content?.answer || '' }]

      questions.forEach((q: TestQuestion, qIdx: number) => {
        const correctAns = String(q.answer || '').trim().toLowerCase()
        let correctCount = 0
        const wrongAnswersMap: Record<string, number> = {}

        exam.results.forEach((r) => {
          const payload = (r.answers as StoredResultAnswers | null) || {}
          const studentAnswers = payload.answers || {}
          const studentAns = String(studentAnswers[q.id] || '').trim().toLowerCase()
          if (studentAns === correctAns && correctAns !== '') {
            correctCount++
          } else {
            const displayAns = studentAnswers[q.id] ? String(studentAnswers[q.id]).trim() : '(Bỏ trống)'
            wrongAnswersMap[displayAns] = (wrongAnswersMap[displayAns] || 0) + 1
          }
        })

        const totalAttempts = totalSubmissions
        const incorrectCount = totalAttempts - correctCount
        const accuracyRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

        const mistakes = Object.entries(wrongAnswersMap).map(([ans, count]) => ({
          answer: ans,
          count,
          percentage: totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0,
        })).sort((a, b) => b.count - a.count).slice(0, 5)

        questionStats.push({
          id: q.id,
          blockId: block.id,
          blockTitle,
          type: 'fill_blank',
          questionText: q.text || `Điền từ câu ${qIdx + 1}`,
          correctAnswerText: q.answer || '',
          totalAttempts,
          correctCount,
          incorrectCount,
          accuracyRate,
          isHardQuestion: accuracyRate < 50,
          difficultyLevel: accuracyRate < 50 ? 'hard' : accuracyRate < 80 ? 'medium' : 'easy',
          mistakes,
        })
      })
    } else if (block.type === 'matching') {
      const pairs: MatchingPair[] = block.content?.pairs || []
      pairs.forEach((p: MatchingPair) => {
        const key = `${block.id}_${p.id}`
        let correctCount = 0
        const wrongPairsMap: Record<string, number> = {}

        exam.results.forEach((r) => {
          const payload = (r.answers as StoredResultAnswers | null) || {}
          const studentAnswers = payload.answers || {}
          const studentAns = studentAnswers[key]
          const isCorrect = studentAns === p.id || (p.right && String(studentAns).trim().toLowerCase() === String(p.right).trim().toLowerCase())
          if (isCorrect) {
            correctCount++
          } else {
            const matchedPair = pairs.find((o) => o.id === studentAns)
            const wrongMatch = matchedPair?.right || (studentAns !== undefined ? String(studentAns) : '(Chưa ghép)')
            wrongPairsMap[wrongMatch] = (wrongPairsMap[wrongMatch] || 0) + 1
          }
        })

        const totalAttempts = totalSubmissions
        const incorrectCount = totalAttempts - correctCount
        const accuracyRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

        const mistakes = Object.entries(wrongPairsMap).map(([ans, count]) => ({
          answer: ans,
          count,
          percentage: totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0,
        })).sort((a, b) => b.count - a.count).slice(0, 5)

        questionStats.push({
          id: key,
          blockId: block.id,
          blockTitle,
          type: 'matching',
          questionText: `Ghép cặp: "${p.left}"`,
          correctAnswerText: p.right || '',
          totalAttempts,
          correctCount,
          incorrectCount,
          accuracyRate,
          isHardQuestion: accuracyRate < 50,
          difficultyLevel: accuracyRate < 50 ? 'hard' : accuracyRate < 80 ? 'medium' : 'easy',
          mistakes,
        })
      })
    } else if (block.type === 'reorder') {
      const questions: TestQuestion[] = block.content?.questions || []
      const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim()

      questions.forEach((q: TestQuestion, qIdx: number) => {
        const correctSentence = String(q.sentence || '').trim()
        let correctCount = 0
        const wrongAttemptsMap: Record<string, number> = {}

        exam.results.forEach((r) => {
          const payload = (r.answers as StoredResultAnswers | null) || {}
          const studentAnswers = payload.answers || {}
          const studentAns = String(studentAnswers[q.id] || '').trim()
          if (normalize(studentAns) === normalize(correctSentence) && correctSentence !== '') {
            correctCount++
          } else {
            const displayAns = studentAns || '(Chưa sắp xếp)'
            wrongAttemptsMap[displayAns] = (wrongAttemptsMap[displayAns] || 0) + 1
          }
        })

        const totalAttempts = totalSubmissions
        const incorrectCount = totalAttempts - correctCount
        const accuracyRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

        const mistakes = Object.entries(wrongAttemptsMap).map(([ans, count]) => ({
          answer: ans,
          count,
          percentage: totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0,
        })).sort((a, b) => b.count - a.count).slice(0, 5)

        questionStats.push({
          id: q.id,
          blockId: block.id,
          blockTitle,
          type: 'reorder',
          questionText: q.text || `Sắp xếp câu ${qIdx + 1}`,
          correctAnswerText: correctSentence,
          totalAttempts,
          correctCount,
          incorrectCount,
          accuracyRate,
          isHardQuestion: accuracyRate < 50,
          difficultyLevel: accuracyRate < 50 ? 'hard' : accuracyRate < 80 ? 'medium' : 'easy',
          mistakes,
        })
      })
    }
  })

  const hardQuestionsCount = questionStats.filter((q) => q.isHardQuestion).length

  return {
    examId: exam.id,
    title: exam.title,
    duration: exam.duration,
    totalSubmissions,
    averageScore,
    highestScore,
    lowestScore,
    hardQuestionsCount,
    questionStats,
  }
}
