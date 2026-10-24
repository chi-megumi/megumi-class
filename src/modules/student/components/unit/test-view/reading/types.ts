import type { TestQuestion } from '@/modules/teacher/types'
import type { TestResultPayload } from '@/actions/analytics/types'

export type ReadingQuestionKind =
  | 'multiple_choice'
  | 'true_false'
  | 'cloze_choice'
  | 'cloze_text'
  | 'matching_heading'
  | 'sentence_insertion'
  | 'short_answer'

export type ReadingPassageItemView = {
  id: string
  title?: string
  text: string
  questions: TestQuestion[]
}

export type ReadingBlockProps = {
  blockId: string
  text?: string
  questions?: TestQuestion[]
  passages?: ReadingPassageItemView[]
  answers?: Record<string, string | number>
  isMiniChallenge?: boolean
  isReviewMode?: boolean
  result?: TestResultPayload | null
  onAnswer?: (questionId: string, value: string | number) => void
  viewMode?: 'student' | 'teacher'
  onViewModeChange?: (mode: 'student' | 'teacher') => void
  showControls?: boolean
  defaultLayout?: 'split' | 'stacked'
}

export type ReadingPassageViewProps = {
  text?: string
  title?: string
  isMiniChallenge?: boolean
  fontSize?: 'normal' | 'large'
  passageId?: string
  copiedPassageId?: string | null
  onCopy?: (text: string, id: string) => void
}

export type ReadingQuestionItemViewProps = {
  question: TestQuestion
  index: number
  answers?: Record<string, string | number>
  isMiniChallenge?: boolean
  isReviewMode?: boolean
  result?: TestResultPayload | null
  onAnswer?: (questionId: string, value: string | number) => void
  viewMode?: 'student' | 'teacher'
}

export type ReadingQuestionsViewProps = {
  questions: TestQuestion[]
  answers?: Record<string, string | number>
  isMiniChallenge?: boolean
  isReviewMode?: boolean
  result?: TestResultPayload | null
  onAnswer?: (questionId: string, value: string | number) => void
  viewMode?: 'student' | 'teacher'
}
