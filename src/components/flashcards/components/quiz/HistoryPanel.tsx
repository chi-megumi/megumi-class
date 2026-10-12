import {
  useQuizStore,
  type QuizHistoryEntry,
} from '@/components/flashcards/stores/useQuizStore'
import { formatDate, formatDuration, scoreColor } from '@/components/flashcards/utils/score'

function HistoryPanel({ onOpen }: { onOpen: (entry: QuizHistoryEntry) => void }) {
  const history = useQuizStore((s) => s.history)
  const clearHistory = useQuizStore((s) => s.clearHistory)

  if (history.length === 0) return null

  return (
    <div className="quiz-history">
      <div className="quiz-history-header">
        <span>📜 Lịch sử ({history.length})</span>
        <button className="quiz-history-clear" onClick={clearHistory}>
          Xóa hết
        </button>
      </div>
      <div className="quiz-history-grid">
        {history.map((entry) => (
          <button
            key={entry.id}
            className="quiz-history-card"
            onClick={() => onOpen(entry)}
            title="Xem chi tiết"
          >
            <div className="quiz-history-score" style={{ color: scoreColor(entry.score) }}>
              {entry.score}
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#94a3b8' }}>/100</span>
            </div>
            <div className="quiz-history-meta">
              <span>
                ✅ {entry.correct}/{entry.total}
              </span>
              <span>⏱ {formatDuration(entry.durationMs)}</span>
            </div>
            <div className="quiz-history-date">{formatDate(entry.date)}</div>
            <div className="quiz-history-view-hint">Xem chi tiết →</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default HistoryPanel
