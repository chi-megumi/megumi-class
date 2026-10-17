'use client'

import { useEffect, useState } from 'react'

interface UseCountUpOptions {
  end: number
  durationMs?: number
  startWhen?: boolean
}

export function useCountUp({ end, durationMs = 1800, startWhen = true }: UseCountUpOptions): number {
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    if (!startWhen || end <= 0) return

    let startTime: number | null = null
    let animationFrameId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / durationMs, 1)

      // Ease out expo curve for smooth deceleration
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(easeProgress * end))

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }

    animationFrameId = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [end, durationMs, startWhen])

  return count
}
