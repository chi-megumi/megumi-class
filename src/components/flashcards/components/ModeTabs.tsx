import { useFlashcardStore, type AppMode } from '../stores/useFlashcardStore'
import { Layers, HelpCircle, Puzzle, type LucideIcon } from 'lucide-react'

const tabs: { mode: AppMode; icon: LucideIcon; label: string }[] = [
  { mode: 'flashcard', icon: Layers, label: 'Lật Thẻ (3D)' },
  { mode: 'quiz', icon: HelpCircle, label: 'Đố Vui (Quiz)' },
  { mode: 'match', icon: Puzzle, label: 'Ghép Thẻ (Match)' },
]

export function ModeTabs() {
  const activeMode = useFlashcardStore((s) => s.activeMode)
  const setMode = useFlashcardStore((s) => s.setMode)

  return (
    <div className="mode-tabs">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <button
            key={tab.mode}
            className={`tab-btn flex items-center justify-center gap-2 ${activeMode === tab.mode ? 'active' : ''}`}
            onClick={() => setMode(tab.mode)}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
