import FlashcardsPage from '@/modules/public/flashcards/components/FlashcardsPage'
import { getVocabItems } from '@/actions/vocab'

export default async function Home() {
  const vocabItems = await getVocabItems()

  return (
    <main className="min-h-screen flex flex-col items-center py-10 w-full">
      <FlashcardsPage initialVocab={vocabItems} />
    </main>
  )
}
