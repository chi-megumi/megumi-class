import { useFlashcardStore } from '../stores/useFlashcardStore'

export function ProgressBar() {
  const masteredSet = useFlashcardStore((s) => s.masteredSet)
  const vocabItems = useFlashcardStore((s) => s.vocabItems)
  const total = vocabItems.length
  const mastered = masteredSet.length
  const percent = total > 0 ? Math.round((mastered / total) * 100) : 0

  return (
    <div className="progress-section">
      <div className="progress-header">
        <span>Tiến độ học tập</span>
        <span id="progress-text" style={{ color: 'var(--primary)' }}>
          {mastered} / {total} Đã thuộc ({percent}%)
        </span>
      </div>
      <div className="progress-bar-bg">
        <div id="progress-fill" className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
