import { ControlsBar } from '@/components/flashcards/components/ControlsBar'
import { Flashcard3D } from '@/components/flashcards/components/Flashcard3D'
import { FlashcardControls } from '@/components/flashcards/components/FlashcardControls'
import { Header } from '@/components/flashcards/components/Header'
import { MatchGame } from '@/components/flashcards/components/match/MatchGame'
import { ModeTabs } from '@/components/flashcards/components/ModeTabs'
import { ProgressBar } from '@/components/flashcards/components/ProgressBar'
import { QuizView } from '@/components/flashcards/components/quiz/QuizView'
import { useSpeech } from '@/components/flashcards/hooks/useSpeech'
import { useFlashcardStore } from '@/components/flashcards/stores/useFlashcardStore'
import type { VocabItem } from '@/types/vocab'
import { useEffect } from 'react'

interface FlashcardsPageInnerProps {
  initialVocab: VocabItem[]
}

const FlashcardsPageInner = ({ initialVocab }: FlashcardsPageInnerProps) => {
  const setVocabItems = useFlashcardStore((s) => s.setVocabItems)
  const vocabItems = useFlashcardStore((s) => s.vocabItems)
  const activeMode = useFlashcardStore((s) => s.activeMode)
  const flipCard = useFlashcardStore((s) => s.flipCard)
  const nextCard = useFlashcardStore((s) => s.nextCard)
  const prevCard = useFlashcardStore((s) => s.prevCard)
  const toggleMastered = useFlashcardStore((s) => s.toggleMastered)
  const currentId = useFlashcardStore((s) => s.currentId)
  const { speak } = useSpeech()

  // Initialize store with server data
  useEffect(() => {
    if (initialVocab.length > 0) {
      setVocabItems(initialVocab)
    }
  }, [initialVocab, setVocabItems])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (activeMode !== 'flashcard') return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          flipCard()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextCard()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevCard()
          break
        case 'KeyS':
          e.preventDefault()
          if (!currentId) return
          const item = vocabItems.find((i) => i.id === currentId)
          if (item) speak(item.word)
          break
        case 'KeyM':
          e.preventDefault()
          toggleMastered()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeMode, flipCard, nextCard, prevCard, toggleMastered, currentId, speak, vocabItems])

  return (
    <div className="fc-container">
      <Header />
      <ModeTabs />

      {activeMode === 'flashcard' && (
        <>
          <ProgressBar />
          <ControlsBar />
          <div id="flashcard-section">
            <Flashcard3D />
            <FlashcardControls />
          </div>
        </>
      )}

      {activeMode === 'quiz' && <QuizView />}

      {activeMode === 'match' && <MatchGame />}
    </div>
  )
}

export default FlashcardsPageInner
