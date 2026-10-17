import type { UnitAnalyticsResult } from '@/actions/analytics/types'
import type { ExamData, EnrollmentData, UnitData } from '@/modules/teacher/types'

export type AnalyticsSubTab = 'vocab' | 'students' | 'exams'

export type VocabFilterType = 'all' | 'hard' | 'medium' | 'easy'
export type VocabSortType = 'error' | 'attempts' | 'alpha'

export type StudentStatusFilterType = 'all' | 'completed' | 'in_progress' | 'not_started'
export type StudentSortType = 'mastery_desc' | 'mastery_asc' | 'name'

export type UnitAnalyticsTabProps = {
  unit: UnitData
  activeStudents?: EnrollmentData[]
  classExams?: ExamData[]
  onViewExamResults?: (exam: ExamData) => void
}

export type VocabStatItem = NonNullable<UnitAnalyticsResult['vocabStats']>[number]
