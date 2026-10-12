import { useQuizStore } from '@/components/flashcards/stores/useQuizStore'
import { useFlashcardStore } from '@/components/flashcards/stores/useFlashcardStore'

const ModeSelector = () => {
  const quizMode = useQuizStore((s) => s.quizMode)
  const setMode = useQuizStore((s) => s.setMode)
  const startSession = useQuizStore((s) => s.startSession)
  const vocabItems = useFlashcardStore((s) => s.vocabItems)

  const select = (mode: typeof quizMode) => {
    setMode(mode)
    startSession(vocabItems)
  }

  return (
    <div className="quiz-mode-tabs">
      <button
        className={`quiz-mode-tab ${quizMode === 'scored' ? 'active' : ''}`}
        onClick={() => select('scored')}
      >
        🏆 Có tính điểm
      </button>
      <button
        className={`quiz-mode-tab ${quizMode === 'endless' ? 'active' : ''}`}
        onClick={() => select('endless')}
      >
        ♾️ Vô tận
      </button>
    </div>
  )
}

export default ModeSelector
