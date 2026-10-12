import { useEffect } from 'react'
import { useConfetti } from '@/components/flashcards/hooks/useConfetti'
import { useQuizStore } from '@/components/flashcards/stores/useQuizStore'
import { formatDuration, scoreColor } from '@/components/flashcards/utils/score'

import { useFlashcardStore } from '@/components/flashcards/stores/useFlashcardStore'

function ScoredSummary() {
  const sessionCorrect = useQuizStore((s) => s.sessionCorrect)
  const sessionTotal = useQuizStore((s) => s.sessionTotal)
  const startSession = useQuizStore((s) => s.startSession)
  const history = useQuizStore((s) => s.history)
  const vocabItems = useFlashcardStore((s) => s.vocabItems)
  const { fireConfetti } = useConfetti()

  const latest = history[0]
  const score = latest?.score ?? Math.round((sessionCorrect / sessionTotal) * 100)

  useEffect(() => {
    if (score >= 80) fireConfetti()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="quiz-summary">
      <div className="quiz-summary-emoji">{score >= 90 ? '🎉' : score >= 70 ? '👍' : '📚'}</div>
      <div className="quiz-summary-score" style={{ color: scoreColor(score) }}>
        {score}
        <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/100</span>
      </div>
      <div className="quiz-summary-detail">
        {sessionCorrect} / {sessionTotal} câu đúng
        {latest && (
          <span style={{ color: '#94a3b8', marginLeft: 8 }}>
            · {formatDuration(latest.durationMs)}
          </span>
        )}
      </div>
      <div className="quiz-summary-msg">
        {score >= 90
          ? 'Xuất sắc! Bạn nhớ gần hết rồi 🔥'
          : score >= 70
            ? 'Khá tốt! Luyện thêm một chút nữa nhé 💪'
            : 'Cố lên! Ôn lại và thử lại nào 📖'}
      </div>
      <button className="nav-btn flip-btn-main" onClick={() => startSession(vocabItems)}>
        🔄 Chơi lại
      </button>
    </div>
  )
}

export default ScoredSummary
