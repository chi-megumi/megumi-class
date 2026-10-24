import { getTeacherClassDetails } from '~/actions/class'
import { redirect } from 'next/navigation'
import TeacherClassLayoutClient from '@/modules/teacher/components/TeacherClassLayoutClient'
import { ClassData } from '@/modules/teacher/types'

type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ classId: string }>
}

export default async function TeacherClassLayout({ children, params }: LayoutProps) {
  const { classId } = await params
  const classData = await getTeacherClassDetails(classId)

  if (!classData) {
    redirect('/')
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-screen py-8 relative lg:px-4">
      <TeacherClassLayoutClient classData={classData as unknown as ClassData}>
        {children}
      </TeacherClassLayoutClient>
    </div>
  )
}
