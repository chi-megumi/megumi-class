export type GameCompletionInput = {
  unitId: string
  classId: string
  gameType: 'flashcard' | 'quiz' | 'match'
  score?: number
  time?: number
  masteryProgress?: number
  isInterrupted?: boolean
  isQuickExit?: boolean
  correctCount?: number
  totalCount?: number
}

export type FlashcardAttempt = {
  attempt: number
  durationSeconds: number
  masteryProgress?: number
  isInterrupted?: boolean
  isQuickExit?: boolean
  completedAt: string
}

export type QuizAttempt = {
  attempt: number
  score: number
  correctCount?: number
  totalCount?: number
  durationSeconds: number
  isInterrupted?: boolean
  isQuickExit?: boolean
  completedAt: string
}

export type MatchAttempt = {
  attempt: number
  durationSeconds: number
  isInterrupted?: boolean
  isQuickExit?: boolean
  completedAt: string
}

export type ActivityHistoryPayload = {
  flashcard?: FlashcardAttempt[]
  quiz?: QuizAttempt[]
  match?: MatchAttempt[]
}

export type SubmitTestResultInput = {
  unitId?: string
  classId: string
  testId: string
  answers: Record<string, string | number>
  isInterrupted?: boolean
}

export type StartTestInput = {
  classId: string
  unitId?: string
  testId: string
  forceRetake?: boolean
}

export type TestResultPayload = {
  score?: number | null
  correctAnswers?: number
  totalQuestions?: number
  answers?: Record<string, string | number>
  correctAnswersDetail?: Record<string, string | number>
  startedAt?: string
  completedAt?: string | Date | null
  attemptCount?: number
  bestScore?: number
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

export type ExamQuestionAnalyticsResult = {
  examId: string
  title: string
  duration: number | null
  totalSubmissions: number
  averageScore: number
  highestScore: number
  lowestScore: number
  hardQuestionsCount: number
  questionStats: QuestionStat[]
}

export type StudentExamHistorySummary = {
  totalExams: number
  completedCount: number
  inProgressCount: number
  notStartedCount: number
  avgScore: number
  highestScore: number
}

export type StudentExamHistoryItem = {
  examId: string
  title: string
  type: 'class' | 'unit'
  unitTitle: string | null
  duration: number | null
  status: 'completed' | 'in_progress' | 'not_started'
  score: number | null
  correctAnswers: number | null
  totalQuestions: number | null
  startedAt: Date | null
  completedAt: Date | null
  answers: Record<string, unknown>
  correctAnswersDetail: Record<string, string | number>
  content: unknown
}

export type StudentExamHistoryResult = {
  student: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  summary: StudentExamHistorySummary
  history: StudentExamHistoryItem[]
}

export type LeaderboardStudentStats = {
  student: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
  totalPublishedExams: number
  completedExams: number
  completionRate: number
  avgScore: number
  highestScore: number
  lowestScore: number
  avgVocabMastery: number
  xp: number
  rank: number
}

export type ClassLeaderboardResult = {
  classId: string
  className: string
  totalStudents: number
  totalPublishedExams: number
  totalCompletedResults: number
  classAvgScore: number
  leaderboard: LeaderboardStudentStats[]
}

export type TestSubmissionItem = {
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
  result: {
    score: number
    correctAnswers: number
    totalQuestions: number
    completedAt: Date | string
    answers: Record<string, string | number>
    correctAnswersDetail: Record<string, string | number>
    attemptCount: number
    bestScore?: number
    history?: unknown[]
  }
}
