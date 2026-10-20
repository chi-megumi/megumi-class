import type { Metadata } from 'next'
import FlashcardsPage from '@/modules/public/flashcards/components/FlashcardsPage'
import { getVocabItems } from '@/actions/vocab'

export const metadata: Metadata = {
  title: 'Học Thử Flashcards — Megumi Class',
  description:
    'Trải nghiệm phương pháp học từ vựng và chữ Hán phản xạ thực chiến qua flashcards thông minh của Megumi Class.',
}

export default async function FlashcardsRoute() {
  const vocabItems = await getVocabItems()

  return (
    <main className="min-h-screen flex flex-col items-center py-10 w-full max-w-[900px] mx-auto">
      <FlashcardsPage initialVocab={vocabItems} />
    </main>
  )
}

