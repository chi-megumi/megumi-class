import { getStudentClassDetails } from '@/actions/class'
import { redirect } from 'next/navigation'
import StudentClassDashboardClient from '@/modules/student/components/StudentClassDashboardClient'
import { ClassData } from '@/modules/teacher/types'

export default async function StudentClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const classId = (await params).classId

  let classData
  try {
    classData = await getStudentClassDetails(classId)
  } catch {
    redirect('/')
  }

  if (!classData) return redirect('/')

  return <StudentClassDashboardClient classData={classData as unknown as ClassData} classId={classId} />
}
