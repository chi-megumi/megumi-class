import type { VocabItemData, TestBlock, TestQuestion } from '@/modules/teacher/types'

export type ReadingInteractionType =
  | 'multiple_choice'
  | 'true_false'
  | 'cloze'
  | 'matching_heading'
  | 'sentence_insertion'
  | 'short_answer'

export type ReadingQuestionKind =
  | 'multiple_choice'
  | 'true_false'
  | 'cloze_choice'
  | 'cloze_text'
  | 'matching_heading'
  | 'sentence_insertion'
  | 'short_answer'

export type ReadingQuestionExtended = TestQuestion & {
  kind?: ReadingQuestionKind
  explanation?: string
}

export type ReadingPassageItem = {
  id: string
  title?: string
  text: string
  questions: ReadingQuestionExtended[]
}

export type ReadingBlockContent = {
  text?: string
  questions?: ReadingQuestionExtended[]
  passages?: ReadingPassageItem[]
  pairs?: TestBlock['content'] extends { pairs?: infer P } ? P : never
}

export type ReadingImportJsonData = {
  title?: string
  text?: string
  questions?: ReadingQuestionExtended[]
  passages?: Array<{ title?: string; text?: string; questions?: ReadingQuestionExtended[] }>
}

export type ReadingPassageCardProps = {
  passage: ReadingPassageItem
  index: number
  totalCount: number
  isMiniChallenge: boolean
  vocabItems?: VocabItemData[]
  onUpdatePassage: (updated: ReadingPassageItem) => void
  onRemovePassage: () => void
}

export type ReadingEditorProps = {
  block: TestBlock
  isMiniChallenge: boolean
  vocabItems?: VocabItemData[]
  onUpdateContent: (newContent: TestBlock['content']) => void
  onAddQuestion: () => void
  onOpenImportJson?: () => void
}

export type ReadingPassageEditorProps = {
  text: string
  isMiniChallenge: boolean
  vocabItems?: VocabItemData[]
  onChangeText: (newText: string) => void
  onInsertBlank: () => void
  onInsertInsertionMarker: () => void
}

export type ReadingQuestionItemProps = {
  question: ReadingQuestionExtended
  index: number
  totalCount: number
  isMiniChallenge: boolean
  onChangeQuestionText: (text: string) => void
  onChangeKind: (kind: ReadingQuestionKind) => void
  onChangeOptions: (options: string[]) => void
  onChangeCorrectIndex: (correctIndex: number) => void
  onChangeAnswerText: (answer: string) => void
  onChangeSentenceToInsert: (sentence: string) => void
  onChangeExplanation: (explanation: string) => void
  onRemove: () => void
}

export type ReadingQuestionListProps = {
  questions: ReadingQuestionExtended[]
  isMiniChallenge: boolean
  onUpdateQuestions: (newQuestions: ReadingQuestionExtended[]) => void
  onAddQuestion: () => void
}

export type ReadingAiPromptModalProps = {
  isOpen: boolean
  vocabItems?: VocabItemData[]
  unitTitle?: string
  onClose: () => void
}
