import { redirect } from 'next/navigation'
import { getStudentExamRunnerData } from '~/actions/analytics/exam-runner'
import StudentExamPageClient from '@/modules/student/components/exam/StudentExamPageClient'

type StudentExamPageRouteProps = {
  params: Promise<{ classId: string; examId: string }>
  searchParams: Promise<{ unitId?: string; retake?: string }>
}

export default async function StudentExamPageRoute({
  params,
  searchParams,
}: StudentExamPageRouteProps) {
  const { classId, examId } = await params
  const { unitId, retake } = await searchParams

  const data = await getStudentExamRunnerData(classId, examId, unitId)

  if (!data) {
    redirect(
      unitId
        ? `/student/classes/${classId}/units/${unitId}`
        : `/student/classes/${classId}`,
    )
  }

  const effectiveUnitId = unitId || data.exam.unitId || undefined

  return (
    <StudentExamPageClient
      classId={classId}
      unitId={effectiveUnitId}
      exam={data.exam}
      classTitle={data.classTitle}
      unitTitle={data.unitTitle}
      initialResult={data.initialResult}
      isRetake={retake === '1'}
    />
  )
}
