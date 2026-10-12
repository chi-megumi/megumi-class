import { useFlashcardStore, useFilteredIds } from '../stores/useFlashcardStore'
import { useConfetti } from '../hooks/useConfetti'
import { playSound } from '../utils/sound'
import { Button } from '@/components/button/Button'

export function FlashcardControls() {
  const vocabItems = useFlashcardStore((s) => s.vocabItems)
  const currentId = useFlashcardStore((s) => s.currentId)
  const flipCard = useFlashcardStore((s) => s.flipCard)
  const nextCard = useFlashcardStore((s) => s.nextCard)
  const prevCard = useFlashcardStore((s) => s.prevCard)
  const toggleMastered = useFlashcardStore((s) => s.toggleMastered)
  const masteredSet = useFlashcardStore((s) => s.masteredSet)
  const activeFilter = useFlashcardStore((s) => s.activeFilter)
  const starredSet = useFlashcardStore((s) => s.starredSet)

  // Subscribe to filtered result with shallow equality — no tearing, no infinite loop
  const filtered = useFilteredIds()

  const { fireMasteredConfetti } = useConfetti()

  const currentFiltered = currentId ? filtered.indexOf(currentId) : -1
  const isMastered = currentId ? masteredSet.includes(currentId) : false
  const total = vocabItems.length

  const isEmptyCards =
    (activeFilter === 'all' && filtered.length <= 0) ||
    (activeFilter === 'memorize' && masteredSet.length <= 0) ||
    (activeFilter === 'starred' && starredSet.length <= 0)

  const handleToggleMastered = () => {
    if (!isMastered) {
      playSound('correct')
      fireMasteredConfetti()
    } else {
      playSound('incorrect')
    }
    toggleMastered()
  }

  return (
    <>
      <div className="bottom-controls">
        <Button
          variant="ghost"
          size="md"
          id="prev-btn"
          onClick={prevCard}
          disabled={currentFiltered <= 0}
        >
          <span>⬅️</span> Trước
        </Button>

        <Button variant="primary" size="md" onClick={flipCard} disabled={isEmptyCards}>
          <span>🔄</span> Lật Thẻ (Space)
        </Button>

        <Button
          className={`master-toggle-btn ${isMastered ? 'mastered' : ''}`}
          id="master-btn"
          onClick={handleToggleMastered}
          disabled={isEmptyCards}
        >
          <span>{isMastered ? '↩️' : '✅'}</span>
          <span>{isMastered ? 'Bỏ đánh dấu' : 'Đánh dấu đã thuộc'}</span>
        </Button>

        <Button
          variant="ghost"
          size="md"
          id="next-btn"
          onClick={nextCard}
          disabled={currentFiltered >= filtered.length - 1 || currentFiltered === -1}
        >
          Tiếp <span>➡️</span>
        </Button>
      </div>

      <div className="card-counter">
        {filtered.length === 0 ? '0 ' : `${currentFiltered + 1} / ${filtered.length}`}
        <span style={{ color: '#94a3b8' }}> (Tổng bộ: {total})</span>
      </div>

      <div className="keyboard-hint">
        <span>⌨️ Phím tắt:</span>
        <span>
          <kbd className="kbd">Space</kbd> Lật thẻ
        </span>
        <span>
          <kbd className="kbd">←</kbd> <kbd className="kbd">→</kbd> Chuyển thẻ
        </span>
        <span>
          <kbd className="kbd">S</kbd> Phát âm
        </span>
        <span>
          <kbd className="kbd">M</kbd> Đã thuộc
        </span>
      </div>
    </>
  )
}
