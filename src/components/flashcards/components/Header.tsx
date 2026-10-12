import { useFlashcardStore } from '../stores/useFlashcardStore'

export function Header() {
  const vocabItems = useFlashcardStore((s) => s.vocabItems)

  return (
    <header className="fc-header">
      <div className="badge-pill">
        <span>🔥</span> Unit: Teen Stress &amp; Pressure
      </div>
      <h1>
        <span>English</span>
        <span className="highlight">Flashcards</span>
        <span>✨</span>
      </h1>
      <p className="subtitle">
        Bộ {vocabItems.length} thẻ từ vựng sống động kèm phát âm, ví dụ &amp; mini game vui nhộn!
      </p>
    </header>
  )
}
