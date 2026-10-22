import { VocabItemData } from '~/modules/teacher/types'

export type VocabLayoutMode = 'list' | 'grid'

export interface VocabVaultProps {
  vocabItems: VocabItemData[]
  masteredSet: string[]
  toggleMasteredById: (id: string) => void
  speak: (word: string) => void
  unitTitle?: string
}

export interface VocabVaultHeaderProps {
  totalCount: number
  masteredCount: number
  viewMode: VocabLayoutMode
  onViewModeChange: (mode: VocabLayoutMode) => void
  onPrint: () => void
}

export interface VocabListViewProps {
  items: VocabItemData[]
  masteredSet: string[]
  toggleMasteredById: (id: string) => void
  speak: (word: string) => void
  onPreviewImage?: (item: VocabItemData) => void
}

export interface VocabListItemProps {
  item: VocabItemData
  isMastered: boolean
  onToggleMastered: () => void
  onSpeak: () => void
  onPreviewImage?: (item: VocabItemData) => void
}

export interface VocabGridViewProps {
  items: VocabItemData[]
  masteredSet: string[]
  toggleMasteredById: (id: string) => void
  speak: (word: string) => void
  onPreviewImage?: (item: VocabItemData) => void
}

export interface VocabGridCardProps {
  item: VocabItemData
  isMastered: boolean
  onToggleMastered: () => void
  onSpeak: () => void
  onPreviewImage?: (item: VocabItemData) => void
}

export interface VocabEmptyStateProps {
  message?: string
}
