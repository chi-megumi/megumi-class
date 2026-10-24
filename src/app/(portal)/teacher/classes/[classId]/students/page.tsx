import { getTeacherClassDetails } from '~/actions/class'
import { redirect } from 'next/navigation'
import TeacherStudentsClient from '@/modules/teacher/components/students/TeacherStudentsClient'
import { ClassData } from '@/modules/teacher/types'

type PageProps = {
  params: Promise<{ classId: string }>
}

export default async function ClassStudentsPage({ params }: PageProps) {
  const { classId } = await params

  const classData = await getTeacherClassDetails(classId)

  if (!classData) {
    redirect('/')
  }

  return <TeacherStudentsClient classData={classData as unknown as ClassData} />
}
