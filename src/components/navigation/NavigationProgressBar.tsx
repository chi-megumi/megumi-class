'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function ProgressBarInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isVisibleRef = useRef(false)

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current)
      completeTimerRef.current = null
    }

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const startProgress = useCallback(() => {
    clearTimers()

    isVisibleRef.current = true
    setIsVisible(true)
    setProgress(15)

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }

          return 85
        }

        const increment = Math.max(1, (85 - prev) * 0.15)
        return Math.min(85, prev + increment)
      })
    }, 120)
  }, [clearTimers])

  const finishProgress = useCallback(() => {
    if (!isVisibleRef.current) return

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Complete the progress bar on the next task.
    completeTimerRef.current = setTimeout(() => {
      setProgress(100)

      hideTimerRef.current = setTimeout(() => {
        isVisibleRef.current = false
        setIsVisible(false)
        setProgress(0)
        hideTimerRef.current = null
        completeTimerRef.current = null
      }, 350)
    }, 0)
  }, [])

  // Finish progress when the route changes.
  useEffect(() => {
    finishProgress()
  }, [pathname, searchParams, finishProgress])

  // Intercept internal navigation clicks.
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:')
      ) {
        return
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.href)
        const currentUrl = new URL(window.location.href)

        if (targetUrl.origin !== currentUrl.origin) return

        // Ignore navigation to the exact same URL.
        if (targetUrl.href === currentUrl.href) return

        // Ignore hash-only navigation.
        if (
          targetUrl.pathname === currentUrl.pathname &&
          targetUrl.search === currentUrl.search &&
          targetUrl.hash !== currentUrl.hash
        ) {
          return
        }

        startProgress()
      } catch {
        // Ignore invalid URLs.
      }
    }

    const handlePopState = () => {
      startProgress()
    }

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [startProgress])

  // Clean up timers on unmount.
  useEffect(() => {
    return () => {
      clearTimers()
      isVisibleRef.current = false
    }
  }, [clearTimers])

  if (!isVisible && progress === 0) return null

  return (
    <div
      role="progressbar"
      aria-label="Page navigation progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="pointer-events-none fixed left-0 right-0 top-0 z-[9999] h-[3px]"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 300ms ease-out',
      }}
    >
      <div
        className="h-full bg-gradient-to-r from-[#6A5EEB] via-[#8B5CF6] to-[#EC4899] shadow-[0_0_12px_rgba(106,94,235,0.7)]"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 200ms ease-out' : 'width 250ms ease-in-out',
        }}
      />
    </div>
  )
}

export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  )
}

export default NavigationProgressBar
