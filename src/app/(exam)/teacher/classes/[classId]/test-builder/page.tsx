import { getTeacherClassDetails } from '~/actions/class'
import { redirect } from 'next/navigation'
import TestBuilderPageClient from '@/modules/teacher/components/test-builder/TestBuilderPageClient'
import type { ExamData, VocabItemData, UnitData } from '@/modules/teacher/types'

type PageProps = {
  params: Promise<{ classId: string }>
  searchParams: Promise<{ unitId?: string; testId?: string; tab?: string }>
}

export default async function TeacherTestBuilderRoute({
  params,
  searchParams,
}: PageProps) {
  const { classId } = await params
  const { unitId, testId = 'new', tab } = await searchParams

  const classData = await getTeacherClassDetails(classId)

  if (!classData) {
    redirect('/')
  }

  const rawUnits = (classData.units || []) as unknown as UnitData[]
  const rawClassExams = (classData.exams || []) as unknown as ExamData[]

  let unitTitle: string | undefined
  let existingTests: ExamData[] = rawClassExams
  let vocabItems: VocabItemData[] = rawUnits.flatMap((u) => u.vocabItems || [])
  const isClassExam = !unitId

  if (unitId) {
    const unit = rawUnits.find((u) => u.id === unitId)
    if (unit) {
      unitTitle = unit.title
      existingTests = (unit.exams || []) as ExamData[]
      vocabItems = (unit.vocabItems || []) as VocabItemData[]
    }
  }

  const existingTest = existingTests.find((t) => t.id === testId)

  return (
    <TestBuilderPageClient
      classId={classId}
      unitId={unitId}
      unitTitle={unitTitle}
      editingTestId={testId}
      existingTests={existingTests}
      vocabItems={vocabItems}
      isClassExam={isClassExam}
      initialExam={existingTest}
      isReadOnly={existingTest?.isPublished}
      returnTab={tab || 'games'}
    />
  )
}
