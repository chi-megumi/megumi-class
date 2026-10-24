'use client'

import { useRouter } from 'next/navigation'
import ClassSettingsTab from './ClassSettingsTab'
import { ClassData } from '../../types'

type TeacherSettingsClientProps = {
  classData: ClassData
}

export default function TeacherSettingsClient({ classData }: TeacherSettingsClientProps) {
  const router = useRouter()

  return (
    <ClassSettingsTab
      classData={classData}
      onClassUpdated={() => {
        router.refresh()
      }}
      onCodeRegenerated={() => {
        router.refresh()
      }}
    />
  )
}
