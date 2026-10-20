import { getStudentUnitDetails } from '@/actions/class'
import { redirect } from 'next/navigation'
import StudentUnitDashboard from '@/modules/student/components/StudentUnitDashboard'
import { FlashcardProvider } from '@/components/flashcards/stores/useFlashcardStore'

export default async function StudentUnitPage({ params }: { params: Promise<{ classId: string, unitId: string }> }) {
  const { classId, unitId } = await params

  let unitData = null
  try {
    unitData = await getStudentUnitDetails(unitId)
  } catch (err) {
    console.error('Error loading student unit details:', err)
  }

  if (!unitData) return redirect('/')

  return (
    <FlashcardProvider storageName={`student-unit-${unitData.id}`}>
      <StudentUnitDashboard unitData={unitData as unknown as import('~/modules/teacher/types').UnitData} classId={classId} />
    </FlashcardProvider>
  )
}
