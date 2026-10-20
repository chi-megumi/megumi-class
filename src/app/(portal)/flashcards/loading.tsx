import FlashcardsSkeleton from '@/modules/public/flashcards/components/loading/FlashcardsSkeleton'

export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col items-center py-10 w-full max-w-[900px] mx-auto">
      <FlashcardsSkeleton />
    </main>
  )
}
