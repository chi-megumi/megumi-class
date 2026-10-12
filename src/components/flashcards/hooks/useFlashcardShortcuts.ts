import { useEffect } from 'react'
import { useFlashcardStore } from '../stores/useFlashcardStore'

export const useFlashcardShortcuts = () => {
  const flipCard = useFlashcardStore((s) => s.flipCard)
  const nextCard = useFlashcardStore((s) => s.nextCard)
  const prevCard = useFlashcardStore((s) => s.prevCard)
  const toggleMastered = useFlashcardStore((s) => s.toggleMastered)
  const toggleStar = useFlashcardStore((s) => s.toggleStar)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLButtonElement
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          flipCard()
          break
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          nextCard()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          prevCard()
          break
        case 'KeyM':
          e.preventDefault()
          toggleMastered()
          break
        case 'KeyS':
          e.preventDefault()
          toggleStar()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flipCard, nextCard, prevCard, toggleMastered, toggleStar])
}
