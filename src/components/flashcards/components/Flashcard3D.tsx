import { useRef } from 'react'
import { useFlashcardStore, useFilteredIds } from '../stores/useFlashcardStore'
import { categoryBadgeLabels } from '../data/vocabData'
import { useSpeech } from '../hooks/useSpeech'
import { Volume2, Star } from 'lucide-react'

export function Flashcard3D() {
  const vocabItems = useFlashcardStore((s) => s.vocabItems)
  const activeFilter = useFlashcardStore((s) => s.activeFilter)
  const currentId = useFlashcardStore((s) => s.currentId)
  const isFlipped = useFlashcardStore((s) => s.isFlipped)
  const flipCard = useFlashcardStore((s) => s.flipCard)
  const nextCard = useFlashcardStore((s) => s.nextCard)
  const prevCard = useFlashcardStore((s) => s.prevCard)
  const starredSet = useFlashcardStore((s) => s.starredSet)
  const toggleStar = useFlashcardStore((s) => s.toggleStar)

  // Touch swipe refs
  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)
  const hasSwipedRef = useRef(false)

  // Subscribe to filtered result with shallow equality — no tearing, no infinite loop
  const filtered = useFilteredIds()

  const { speak, isSpeaking } = useSpeech()

  const isEmpty = filtered.length === 0

  const item = isEmpty || !currentId ? null : vocabItems.find((i) => i.id === currentId) || null
  const isStarred = item && starredSet.includes(item.id)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX
      touchStartYRef.current = e.touches[0].clientY
      hasSwipedRef.current = false
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const deltaX = touchEndX - touchStartXRef.current
    const deltaY = touchEndY - touchStartYRef.current

    // Horizontal swipe threshold: 40px and horizontal movement exceeds vertical
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      hasSwipedRef.current = true
      if (deltaX < 0) {
        nextCard()
      } else {
        prevCard()
      }
    }
    touchStartXRef.current = null
    touchStartYRef.current = null
  }

  const handleCardClick = () => {
    if (hasSwipedRef.current) {
      hasSwipedRef.current = false
      return
    }
    flipCard()
  }

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item) speak(item.word)
  }

  const handleSpeakExample = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item && item.example) speak(item.example)
  }

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleStar()
  }

  // Highlight the word in the example sentence
  const renderExample = () => {
    if (!item || !item.example) return null
    const idx = item.example.toLowerCase().indexOf(item.word.toLowerCase())
    if (idx === -1) {
      return <span>{item.example}</span>
    }
    const before = item.example.slice(0, idx)
    const match = item.example.slice(idx, idx + item.word.length)
    const after = item.example.slice(idx + item.word.length)
    return (
      <>
        {before}
        <span className="example-highlight">{match}</span>
        {after}
      </>
    )
  }

  // Empty state: no cards match the current filter
  if (isEmpty) {
    return (
      <div className="flashcard-wrapper">
        <div className="flashcard" id="main-card">
          <div className="card-face card-front">
            <div className="card-top"></div>
            <div className="card-center">
              <div className="card-emoji-illustration">📭</div>
              <div className="card-word">
                {activeFilter === 'starred'
                  ? 'Không có từ nào được lưu'
                  : activeFilter === 'memorize'
                    ? 'Bạn chưa thuộc từ nào'
                    : 'Không tìm thấy từ nào'}
              </div>
            </div>
            <div className="card-bottom-hint">
              <span>
                {activeFilter === 'starred'
                  ? '💡 Nhấn ⭐ trên thẻ từ vựng để lưu vào danh sách yêu thích'
                  : activeFilter === 'memorize'
                    ? '🤦‍♀️ Hãy chăm chỉ học thêm'
                    : 'Không có từ nào phù hợp'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) return null

  // @ts-expect-error type inference on category slug
  const badgeLabel = categoryBadgeLabels[item.category?.slug || ''] || item.category?.name || 'Từ vựng'

  return (
    <div
      className="flashcard-wrapper select-none"
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} id="main-card">
        {/* FRONT FACE */}
        <div className="card-face card-front">
          <div className="card-top">
            <span className="card-cat-badge">{badgeLabel}</span>
            <div className="card-actions-top" onClick={(e) => e.stopPropagation()}>
              <button
                className={`icon-btn ${isSpeaking ? 'speaking' : ''}`}
                title="Phát âm chuẩn (Phím S)"
                onClick={handleSpeak}
              >
                <Volume2 size={16} />
              </button>
              <button
                className={`icon-btn ${isStarred ? 'starred' : ''}`}
                title="Đánh dấu yêu thích"
                onClick={handleStarClick}
              >
                <Star
                  size={16}
                  className={isStarred ? 'fill-amber-400 text-amber-400' : 'text-gray-400'}
                />
              </button>
            </div>
          </div>

          <div className="card-center">
            <div className="card-emoji-illustration">{item.emoji}</div>
            <div className="card-word">{item.word}</div>
            <div className="card-ipa-group">
              <span className="card-ipa">{item.ipa}</span>
              <span className="card-pos-badge">{item.pos}</span>
            </div>
          </div>

          <div className="card-bottom-hint">
            <span>
              👆 Chạm vào thẻ để lật <span className="hidden sm:inline">hoặc phím <kbd className="kbd">Space</kbd></span> • Vuốt 👈 👉 để chuyển thẻ
            </span>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="card-face card-back">
          <div className="card-top">
            <span
              className="card-cat-badge"
              style={{
                background: 'var(--secondary-light)',
                color: 'var(--secondary)',
              }}
            >
              ✨ Nghĩa &amp; Giải Thích Chi Tiết
            </span>
            <div className="card-actions-top" onClick={(e) => e.stopPropagation()}>
              <button
                className="icon-btn"
                title="Phát âm cả câu ví dụ"
                onClick={handleSpeakExample}
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>

          <div className="card-center">
            <div className="meaning-vi">{item.vi}</div>
            <div className="collocation-tip">{item.tip}</div>

            {item.example && (
              <div className="example-box">
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  Ví dụ thực tế:
                </div>
                <div className="example-en">{renderExample()}</div>
                <div className="example-vi">{item.exampleVi}</div>
              </div>
            )}
          </div>

          <div className="card-bottom-hint">
            <span>
              🔄 Nhấn vào thẻ hoặc phím <kbd className="kbd">Space</kbd> để lật lại
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
