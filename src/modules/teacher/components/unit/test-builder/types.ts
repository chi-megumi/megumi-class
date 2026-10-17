import type { LucideIcon } from 'lucide-react'
import type { ExamData, TestBlock, VocabItemData } from '@/modules/teacher/types'
import type { GeneratedExamResult } from '@/modules/teacher/utils/examGenerator'

export type TemplateType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'reading'
  | 'matching'
  | 'reorder'
  | 'listening'

export type TemplateItem = {
  type: TemplateType
  title: string
  icon: LucideIcon
  desc: string
}

export type TestBuilderModalProps = {
  unitId?: string
  classId?: string
  isClassExam?: boolean
  editingTestId: string
  existingTests: ExamData[]
  vocabItems?: VocabItemData[]
  unitTitle?: string
  initialExam?: GeneratedExamResult
  onClose: () => void
  onSaveSuccess?: (newTests: ExamData[]) => void
}

export type ImportBlockData = {
  questions?: NonNullable<TestBlock['content']>['questions']
  pairs?: NonNullable<TestBlock['content']>['pairs']
}
