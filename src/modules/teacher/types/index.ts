import { UserUnitProgress } from '@prisma/client'
import type { TestResultPayload } from '@/actions/analytics/types'

export type VocabItemData = {
  id: string
  word: string
  vi: string
  ipa?: string | null
  pos?: string | null
  emoji?: string | null
  example?: string | null
  exampleVi?: string | null
  tip?: string | null
}

export type StudentData = {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  userType?: string | null
  systemRole?: string | null
}

export type EnrollmentData = {
  id: string
  status: string
  joinedAt: Date | string
  student: StudentData
}

export type MatchingPair = {
  id: string
  left: string
  right?: string
}

export type TestQuestion = {
  id: string
  text?: string
  options?: string[]
  correctIndex?: number
  answer?: string
  sentence?: string
  words?: string[]
}

export type TestBlock = {
  id: string
  type: string
  title: string
  content?: {
    questions?: TestQuestion[]
    pairs?: MatchingPair[]
    shuffledRight?: { id: string; text: string }[]
    text?: string
    answer?: string
    sentence?: string
  }
}

export type TestContent = {
  id: string
  title: string
  duration: number
  isEnabled?: boolean
  isPublished?: boolean
  isRetakable?: boolean
  blocks: TestBlock[]
}

export type ExamResultAnswers =
  | TestResultPayload
  | Record<string, string | number>
  | Record<string, unknown>

export type ExamResultData = {
  id: string
  examId: string
  studentId: string
  score?: number | null
  answers?: ExamResultAnswers | null
  startedAt: Date | string
  completedAt?: Date | string | null
}

export type ExamData = {
  id: string
  title: string
  duration: number
  isEnabled: boolean
  isPublished: boolean
  isRetakable?: boolean
  content: TestBlock[]
  classId?: string | null
  unitId?: string | null
  results?: ExamResultData[]
}

export type UnitData = {
  id: string
  title: string
  description?: string | null
  isPublished: boolean
  isFlashcardEnabled: boolean
  isQuizEnabled: boolean
  isMatchEnabled: boolean
  exams?: ExamData[]
  vocabItems?: VocabItemData[]
  studentProgress?: UserUnitProgress[]
}

export type ClassData = {
  id: string
  name: string
  description?: string | null
  inviteCode?: string | null
  teacherId?: string
  teacher?: StudentData | null
  students: EnrollmentData[]
  units: UnitData[]
  exams?: ExamData[]
}

export type PracticeSessionEntry = {
  attempt: number
  durationSeconds: number
  score?: number | null
  correctCount?: number | null
  totalCount?: number | null
  isInterrupted?: boolean
  isQuickExit?: boolean
  completedAt: Date | string
}

export type StudentExamDetail = {
  id: string
  title: string
  type?: 'class' | 'unit'
  unitTitle?: string | null
  duration?: number
  isCompleted: boolean
  isInProgress?: boolean
  score?: number | null
  correctAnswers?: number | null
  totalQuestions?: number | null
  completedAt?: Date | string | null
  startedAt?: Date | string | null
  answers?: Record<string, unknown> | null
  correctAnswersDetail?: Record<string, string | number> | null
  content?: unknown
  isInterrupted?: boolean
}

export type StudentAnalyticsData = {
  student: {
    id: string
    name: string
    email?: string
    avatarUrl?: string | null
  }
  masteryProgress: number
  games: {
    flashcard: {
      played: boolean
      progress: number
      timesPlayed: number
      history?: PracticeSessionEntry[]
    }
    quiz: {
      played: boolean
      score: number
      timesPlayed: number
      history?: PracticeSessionEntry[]
    }
    match: {
      played: boolean
      bestTime: number | null
      timesPlayed: number
      history?: PracticeSessionEntry[]
    }
  }
  exams?: StudentExamDetail[]
}

export type CreateClassFormValues = {
  name: string
  description?: string
  inviteCode?: string
  units: { name: string }[]
  studentIds?: string[]
}
