import { useFlashcardStore, type AppMode } from '../stores/useFlashcardStore'

const tabs: { mode: AppMode; icon: string; label: string }[] = [
  { mode: 'flashcard', icon: '🃏', label: 'Lật Thẻ (3D)' },
  { mode: 'quiz', icon: '🎮', label: 'Đố Vui (Quiz)' },
  { mode: 'match', icon: '🧩', label: 'Ghép Thẻ (Match)' },
]

export function ModeTabs() {
  const activeMode = useFlashcardStore((s) => s.activeMode)
  const setMode = useFlashcardStore((s) => s.setMode)

  return (
    <div className="mode-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.mode}
          className={`tab-btn ${activeMode === tab.mode ? 'active' : ''}`}
          onClick={() => setMode(tab.mode)}
        >
          <span>{tab.icon}</span> {tab.label}
        </button>
      ))}
    </div>
  )
}
