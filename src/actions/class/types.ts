import type { TestBlock } from '@/modules/teacher/types'

export type CreateClassInput = {
  name: string
  description?: string
  inviteCode?: string
  units: { name: string }[]
  studentIds?: string[]
}

export type UnitVocabItemInput = {
  word: string
  vi: string
  ipa?: string | null
  pos?: string | null
  emoji?: string | null
  image?: string | null
  example?: string | null
  exampleVi?: string | null
  tip?: string | null
}

export type UnitSettingsInput = {
  isFlashcardEnabled?: boolean
  isQuizEnabled?: boolean
  isMatchEnabled?: boolean
  isPublished?: boolean
}

export type ExamUpsertInput = {
  id: string
  title: string
  duration: number
  isEnabled: boolean
  isPublished: boolean
  isRetakable?: boolean
  content?: TestBlock[] | unknown
  blocks?: TestBlock[] | unknown
  classId?: string | null
  unitId?: string | null
}

export type EnrollmentStatus = 'active' | 'rejected'
