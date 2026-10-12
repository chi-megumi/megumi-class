'use client'
import { FlashcardProvider } from '@/components/flashcards/stores/useFlashcardStore'
import type { VocabItem } from '@/types/vocab'
import './FlashcardsPage.scss'
import FlashcardsPageInner from '@/modules/public/flashcards/components/FlashcardsPageInner'

interface Props {
  initialVocab: VocabItem[]
}

const FlashcardsPage = ({ initialVocab }: Props) => {
  return (
    <FlashcardProvider storageName="public-flashcard-storage">
      <FlashcardsPageInner initialVocab={initialVocab} />
    </FlashcardProvider>
  )
}

export default FlashcardsPage
