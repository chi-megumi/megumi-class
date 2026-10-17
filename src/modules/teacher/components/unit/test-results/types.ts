import type { ExamData, StudentData, TestContent } from '@/modules/teacher/types'

export type Submission = {
  user: StudentData
  result: {
    score: number
    correctAnswers: number
    totalQuestions: number
    completedAt: string | Date
    startedAt?: string | Date
    answers: Record<string, string | number>
    correctAnswersDetail?: Record<string, string | number>
  }
}

export type QuestionMistake = {
  answer: string
  count: number
  percentage: number
}

export type QuestionStat = {
  id: string
  blockId: string
  blockTitle: string
  type: string
  questionText: string
  correctAnswerText: string
  totalAttempts: number
  correctCount: number
  incorrectCount: number
  accuracyRate: number
  isHardQuestion: boolean
  difficultyLevel: 'hard' | 'medium' | 'easy'
  mistakes: QuestionMistake[]
}

export type QuestionAnalytics = {
  examId: string
  title: string
  duration: number
  totalSubmissions: number
  averageScore: number
  highestScore: number
  lowestScore: number
  hardQuestionsCount: number
  questionStats: QuestionStat[]
}

export type TestResultsTab = 'leaderboard' | 'analytics'
export type DifficultyFilter = 'all' | 'hard' | 'medium' | 'easy'

export type TestResultsModalProps = {
  unitId?: string
  testId: string
  testTitle: string
  testData: ExamData | TestContent
  onClose: () => void
}
