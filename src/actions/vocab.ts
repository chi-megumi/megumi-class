'use server'

import { vocabData as oldVocabData } from '@/components/flashcards/data/vocabData'
import type { VocabItem, VocabCategory } from '@/types/vocab'
import { randomUUID } from 'crypto'

// Mocked DB data
const categories: VocabCategory[] = [
  { id: randomUUID(), slug: 'stress', name: 'Áp lực & Cảm xúc', emoji: '😰', sortOrder: 1 },
  { id: randomUUID(), slug: 'solution', name: 'Bí kíp giải tỏa', emoji: '🌿', sortOrder: 2 },
  { id: randomUUID(), slug: 'tech', name: 'Mạng xã hội & Net', emoji: '📱', sortOrder: 3 },
  { id: randomUUID(), slug: 'school', name: 'Học tập & Bạn bè', emoji: '🏫', sortOrder: 4 },
]

// Map the old hardcoded data into the new DB structure (with UUIDs and relations)
const mockedVocabItems: VocabItem[] = oldVocabData.map((item, index) => {
  const category = categories.find((c) => c.slug === item.cat)!
  return {
    id: randomUUID(),
    categoryId: category.id,
    word: item.word,
    ipa: item.ipa,
    pos: item.pos,
    vi: item.vi,
    emoji: item.emoji,
    tip: item.tip,
    example: item.example,
    exampleVi: item.exampleVi,
    sortOrder: index,
    category,
  }
})

export async function getVocabItems(): Promise<VocabItem[]> {
  // Simulate DB delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockedVocabItems
}
