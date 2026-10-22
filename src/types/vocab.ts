export interface VocabCategory {
  id: string
  slug: string
  name: string
  emoji: string | null
  sortOrder: number
}

export interface VocabItem {
  id: string
  categoryId: string
  word: string
  ipa: string | null
  pos: string | null
  vi: string
  image?: string | null
  emoji: string | null
  tip: string | null
  example: string | null
  exampleVi: string | null
  sortOrder: number

  category: VocabCategory
}
