import { getStudentUnitDetails } from '@/actions/class'
import { redirect } from 'next/navigation'
import StudentUnitDashboard from '@/modules/student/components/StudentUnitDashboard'
import { FlashcardProvider } from '@/components/flashcards/stores/useFlashcardStore'

export default async function StudentUnitPage({ params }: { params: Promise<{ classId: string, unitId: string }> }) {
  const { classId, unitId } = await params

  let unitData
  try {
    unitData = await getStudentUnitDetails(unitId)
  } catch (error) {
    redirect(`/student/classes/${classId}`)
  }

  if (!unitData) return redirect(`/student/classes/${classId}`)

  return (
    <FlashcardProvider storageName={`student-unit-${unitData.id}`}>
      <StudentUnitDashboard unitData={unitData as unknown as import('~/modules/teacher/types').UnitData} classId={classId} />
    </FlashcardProvider>
  )
}
