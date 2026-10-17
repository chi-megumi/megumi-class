import { useEffect, useState } from 'react'
import { useQuizStore } from '../../stores/useQuizStore'
import { useConfetti } from '../../hooks/useConfetti'
import { useSpeech } from '../../hooks/useSpeech'
import { playSound } from '../../utils/sound'
import { Volume2, RotateCcw, Trophy, ArrowRight, Flame, CheckCircle2 } from 'lucide-react'
import type { QuizHistoryEntry } from '../../stores/useQuizStore'
import HistoryDetailModal from '@/components/flashcards/components/quiz/HistoryDetailModal'
import ModeSelector from '@/components/flashcards/components/quiz/ModeSelector'
import HistoryPanel from '@/components/flashcards/components/quiz/HistoryPanel'
import ScoredSummary from '@/components/flashcards/components/quiz/ScoreSummary'
import { useFlashcardStore } from '@/components/flashcards/stores/useFlashcardStore'

export function QuizView() {
  const activeMode = useFlashcardStore((s) => s.activeMode)
  const vocabItems = useFlashcardStore((s) => s.vocabItems)
  const quizMode = useQuizStore((s) => s.quizMode)
  const currentWordId = useQuizStore((s) => s.currentWordId)
  const options = useQuizStore((s) => s.options)
  const answered = useQuizStore((s) => s.answered)
  const selectedOptionIndex = useQuizStore((s) => s.selectedOptionIndex)
  const correctOptionIndex = useQuizStore((s) => s.correctOptionIndex)
  const sessionQueue = useQuizStore((s) => s.sessionQueue)
  const sessionTotal = useQuizStore((s) => s.sessionTotal)
  const sessionCorrect = useQuizStore((s) => s.sessionCorrect)
  const sessionDone = useQuizStore((s) => s.sessionDone)
  const streak = useQuizStore((s) => s.streak)
  const startSession = useQuizStore((s) => s.startSession)
  const submitAnswer = useQuizStore((s) => s.submitAnswer)
  const nextQuestion = useQuizStore((s) => s.nextQuestion)

  const { fireConfetti } = useConfetti()
  const { speak, isSpeaking } = useSpeech()

  const [modalEntry, setModalEntry] = useState<QuizHistoryEntry | null>(null)

  const currentWord = currentWordId ? vocabItems.find((v) => v.id === currentWordId) : null

  useEffect(() => {
    startSession(vocabItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentWord) speak(currentWord.word)
  }

  const handleOptionClick = (idx: number) => {
    console.log('handleOptionClick', idx)

    if (answered) return
    const isCorrect = submitAnswer(idx)
    if (isCorrect) {
      fireConfetti()
      playSound('correct')
    } else {
      playSound('incorrect')
    }
  }

  const getOptionClass = (idx: number) => {
    if (!answered) return ''
    if (idx === correctOptionIndex) return 'correct'
    if (idx === selectedOptionIndex && idx !== correctOptionIndex) return 'wrong'
    return ''
  }

  const progressPct =
    quizMode === 'scored' && sessionTotal > 0
      ? Math.round(((sessionTotal - sessionQueue.length) / sessionTotal) * 100)
      : 0

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (activeMode !== 'quiz') return
      switch (e.code) {
        case 'KeyA':
          e.preventDefault()
          handleOptionClick(0)
          break
        case 'KeyB':
          e.preventDefault()
          handleOptionClick(1)
          break
        case 'KeyC':
          e.preventDefault()
          handleOptionClick(2)
          break
        case 'KeyD':
          e.preventDefault()
          handleOptionClick(3)
          break
        case 'ArrowRight':
          e.preventDefault()
          nextQuestion(vocabItems)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextQuestion, activeMode, answered, selectedOptionIndex, correctOptionIndex])

  if (!currentWord && !sessionDone) return null

  return (
    <>
      {/* History detail modal */}
      {modalEntry && <HistoryDetailModal entry={modalEntry} onClose={() => setModalEntry(null)} />}

      <div className="quiz-view">
        {/* Header */}
        <div className="quiz-header">
          <ModeSelector />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            {quizMode === 'endless' && (
              <div
                style={{
                  fontWeight: 700,
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Flame size={16} className="text-amber-500 fill-amber-500" />
                <span>{streak}</span>
              </div>
            )}
            {quizMode === 'scored' && (
              <div
                style={{
                  fontWeight: 700,
                  color: '#6366f1',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <CheckCircle2 size={16} className="text-indigo-500" />
                <span>
                  {sessionCorrect}/{sessionTotal - sessionQueue.length}
                </span>
              </div>
            )}
            <button
              className={`icon-btn ${isSpeaking ? 'speaking' : ''}`}
              title="Phát âm"
              onClick={handleSpeak}
              disabled={sessionDone}
            >
              <Volume2 size={16} />
            </button>
            <button
              className="icon-btn"
              onClick={() => startSession(vocabItems)}
              title="Chơi lại"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Scored progress bar */}
        {quizMode === 'scored' && !sessionDone && (
          <div className="quiz-progress-row">
            <div className="quiz-progress-bar-bg">
              <div className="quiz-progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="quiz-progress-label">
              {sessionTotal - sessionQueue.length}/{sessionTotal}
            </span>
          </div>
        )}

        {/* Session done → summary */}
        {sessionDone ? (
          <ScoredSummary />
        ) : (
          <>
            <div className="quiz-question-box">
              <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '6px' }}>
                {quizMode === 'scored'
                  ? `Câu ${sessionTotal - sessionQueue.length} / ${sessionTotal} — Từ vựng này có nghĩa là gì?`
                  : 'Từ vựng này có nghĩa là gì?'}
              </div>
              <div className="quiz-word-prompt">{currentWord?.word}</div>
              <div className="quiz-ipa-prompt">{currentWord?.ipa}</div>
            </div>

            <div className="quiz-options-grid">
              {options.map((option, idx) => (
                <button
                  key={`${option.id}-${idx}`}
                  className={`quiz-option-btn ${getOptionClass(idx)}`}
                  onClick={() => handleOptionClick(idx)}
                  disabled={answered}
                >
                  <span style={{ fontWeight: 700, color: '#94a3b8' }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option.text}
                </button>
              ))}
            </div>

            {answered && (
              <button
                className="nav-btn flip-btn-main flex items-center justify-center gap-1.5"
                onClick={() => nextQuestion(vocabItems)}
                style={{ margin: '0 auto' }}
              >
                {quizMode === 'scored' && sessionQueue.length === 0 ? (
                  <>
                    <span>Xem kết quả</span>
                    <Trophy size={16} className="text-amber-500" />
                  </>
                ) : (
                  <>
                    <span>Câu tiếp theo</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </>
        )}

        {/* History panel (scored only) */}
        {quizMode === 'scored' && <HistoryPanel onOpen={(entry) => setModalEntry(entry)} />}
      </div>
    </>
  )
}
