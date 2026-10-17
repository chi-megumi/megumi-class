'use client'

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useIntersection<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = '0px',
  triggerOnce = true,
}: UseIntersectionOptions = {}) {
  const ref = useRef<T | null>(null)
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce])

  return [ref, isIntersecting] as const
}
