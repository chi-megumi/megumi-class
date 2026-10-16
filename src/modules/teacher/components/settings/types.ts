import { ClassData } from '../../types'

export type SettingsFeedback = {
  type: 'success' | 'error'
  message: string
} | null

export type GeneralSettingsCardProps = {
  classData: ClassData
  onClassUpdated?: (updated: { name: string; description?: string | null }) => void
}

export type InviteSettingsCardProps = {
  classId: string
  inviteCode?: string | null
  onCodeRegenerated?: (newCode: string) => void
}

export type DangerZoneCardProps = {
  classData: ClassData
}

export type DeleteClassModalProps = {
  classData: ClassData
  isOpen: boolean
  onClose: () => void
}

export type AdminUserControlsCardProps = {
  classData: ClassData
  onRoleChanged?: (userId: string, newRole: 'student' | 'teacher') => void
}

export type AdminUserItem = {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  userType?: string | null
  systemRole?: string | null
}
