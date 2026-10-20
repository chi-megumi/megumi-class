import { getTeacherClassDetails } from '~/actions/class'
import { redirect } from 'next/navigation'
import ClassDashboardClient from '~/modules/teacher/components/ClassDashboardClient'

type PageProps = {
  params: Promise<{ classId: string }>
}

export default async function ClassManagementPage({ params }: PageProps) {
  const { classId } = await params

  const classData = await getTeacherClassDetails(classId)

  if (!classData) {
    redirect('/')
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-screen py-8 relative px-4">
      <ClassDashboardClient classData={classData as unknown as import('~/modules/teacher/types').ClassData} />
    </div>
  )
}
