import { getTeacherClassDetails } from '~/actions/class'
import { redirect } from 'next/navigation'
import TeacherSettingsClient from '@/modules/teacher/components/settings/TeacherSettingsClient'
import { ClassData } from '@/modules/teacher/types'

type PageProps = {
  params: Promise<{ classId: string }>
}

export default async function ClassSettingsPage({ params }: PageProps) {
  const { classId } = await params

  const classData = await getTeacherClassDetails(classId)

  if (!classData) {
    redirect('/')
  }

  return <TeacherSettingsClient classData={classData as unknown as ClassData} />
}
