import { useCallback } from 'react'
import confetti from 'canvas-confetti'

export function useConfetti() {
  const fireConfetti = useCallback(() => {
    // Burst from left side
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.2, y: 0.6 },
      colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'],
    })

    // Burst from right side
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { x: 0.8, y: 0.6 },
      colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'],
    })
  }, [])

  const fireMasteredConfetti = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#059669', '#d1fae5'],
    })
  }, [])

  return { fireConfetti, fireMasteredConfetti }
}
