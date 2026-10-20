'use client'

import { ClassData } from '../../types'
import GeneralSettingsCard from './GeneralSettingsCard'
import InviteSettingsCard from './InviteSettingsCard'
import DangerZoneCard from './DangerZoneCard'

type ClassSettingsTabProps = {
  classData: ClassData
  onClassUpdated?: (updated: { name: string; description?: string | null }) => void
  onCodeRegenerated?: (newCode: string) => void
}

export default function ClassSettingsTab({
  classData,
  onClassUpdated,
  onCodeRegenerated,
}: ClassSettingsTabProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* 1. General Settings */}
      <GeneralSettingsCard classData={classData} onClassUpdated={onClassUpdated} />

      {/* 2. Invite Code & Join Settings */}
      <InviteSettingsCard
        classId={classData.id}
        inviteCode={classData.inviteCode}
        onCodeRegenerated={onCodeRegenerated}
      />

      {/* 3. Danger Zone */}
      <DangerZoneCard classData={classData} />
    </div>
  )
}

