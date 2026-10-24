import { getTeacherClassDetails } from '~/actions/class'
import { redirect } from 'next/navigation'
import TeacherUnitsClient from '@/modules/teacher/components/unit/TeacherUnitsClient'
import { ClassData } from '@/modules/teacher/types'

type PageProps = {
  params: Promise<{ classId: string }>
  searchParams: Promise<{ unitId?: string; tab?: string }>
}

export default async function ClassUnitsPage({ params, searchParams }: PageProps) {
  const { classId } = await params
  const { unitId, tab } = await searchParams

  const classData = await getTeacherClassDetails(classId)

  if (!classData) {
    redirect('/')
  }

  const validTab = tab === 'vocab' || tab === 'games' || tab === 'analytics' ? tab : undefined

  return (
    <TeacherUnitsClient
      classData={classData as unknown as ClassData}
      initialUnitId={unitId}
      initialTab={validTab}
    />
  )
}
