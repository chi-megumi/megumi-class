import { getTeacherClassDetails } from '~/actions/class'
import { redirect } from 'next/navigation'
import OverviewTab from '@/modules/teacher/components/overview/OverviewTab'
import { ClassData, EnrollmentData } from '@/modules/teacher/types'

type PageProps = {
  params: Promise<{ classId: string }>
}

export default async function ClassOverviewPage({ params }: PageProps) {
  const { classId } = await params

  const classData = await getTeacherClassDetails(classId)

  if (!classData) {
    redirect('/')
  }

  const typedClassData = classData as unknown as ClassData
  const activeStudents = (typedClassData.students || []).filter(
    (s: EnrollmentData) => s.status === 'active'
  )

  return <OverviewTab classData={typedClassData} activeStudents={activeStudents} />
}
