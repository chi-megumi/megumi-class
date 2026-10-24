import type { TestResultPayload } from '@/actions/analytics/types'
import type { ExamData, TestContent } from '~/modules/teacher/types'

export type TestViewProps = {
  testData: ExamData | TestContent
  unitId?: string
  onClose: () => void
  initialResult?: TestResultPayload
  onTestComplete?: (testId: string, result: TestResultPayload) => void
  isRetake?: boolean
}

export type MatchingSelection = {
  blockId: string
  rightId: string
}

export type MatchingSlotSelection = {
  blockId: string
  leftId: string
}

export type DraggedReorderWord = {
  questionId: string
  wordIdx: number
  fromSentence?: boolean
  fromSentencePos?: number | null
  sentencePos?: number
}
