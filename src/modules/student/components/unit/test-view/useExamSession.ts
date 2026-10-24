'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { submitTestResult, startTest } from '@/actions/analytics/exam-session'
import { shuffleRetakableExam } from '@/modules/student/utils/examShuffler'
import type { TestResultPayload } from '@/actions/analytics/types'
import type { ExamData, TestContent, TestBlock } from '~/modules/teacher/types'

type UseExamSessionOptions = {
  testData: ExamData | TestContent
  classId: string
  unitId?: string
  initialResult?: TestResultPayload
  onTestComplete?: (testId: string, result: TestResultPayload) => void
  isRetake?: boolean
}

export function useExamSession({
  testData,
  classId,
  unitId,
  initialResult,
  onTestComplete,
  isRetake,
}: UseExamSessionOptions) {
  const router = useRouter()

  const rawBlocks: TestBlock[] =
    ('content' in testData ? testData.content : testData.blocks) || []

  const [isReviewMode, setIsReviewMode] = useState<boolean>(
    !isRetake && !!initialResult && !!initialResult.completedAt,
  )
  const [isRetaking, setIsRetaking] = useState(false)
  const [retakeKey, setRetakeKey] = useState(0)

  const [currentBlocks, setCurrentBlocks] = useState<TestBlock[]>(() => {
    if (testData.isRetakable && (isRetake || !(initialResult && initialResult.completedAt))) {
      return shuffleRetakableExam(rawBlocks)
    }
    return rawBlocks
  })

  const [answers, setAnswers] = useState<Record<string, string | number>>(() => {
    if (isRetake) {
      return {}
    }
    return initialResult?.answers || {}
  })

  const safeDuration =
    (testData.duration && testData.duration > 0 ? testData.duration : 15) * 60

  const [initialDurationSeconds, setInitialDurationSeconds] = useState(() => {
    if (isRetake) return safeDuration
    if (initialResult && initialResult.completedAt) return safeDuration

    if (initialResult?.startedAt) {
      const elapsed = Math.floor(
        (Date.now() - new Date(initialResult.startedAt).getTime()) / 1000,
      )
      const remaining = safeDuration - elapsed
      if (remaining > 0) return remaining

      const hasAnswers =
        initialResult.answers && Object.keys(initialResult.answers).length > 0
      if (testData.isRetakable || !hasAnswers) {
        return safeDuration
      }
      return 0
    }

    return safeDuration
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<TestResultPayload | null>(
    !isRetake && initialResult?.completedAt ? initialResult : null,
  )
  const [showSummary, setShowSummary] = useState(
    !isRetake && !!initialResult?.completedAt,
  )

  const hasSubmittedRef = useRef(false)
  const answersRef = useRef(answers)
  const sessionKey = `megumi_active_test_${testData.id}`

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  // Clean up any stale session from F5
  useEffect(() => {
    if (isReviewMode || result || isRetake) return

    try {
      sessionStorage.removeItem(sessionKey)
    } catch {
      // Ignore
    }

    try {
      sessionStorage.setItem(sessionKey, JSON.stringify({ answers: {} }))
    } catch {
      // Ignore
    }
  }, [testData.id, isReviewMode, result, isRetake, sessionKey])

  // Sync answers into sessionStorage
  useEffect(() => {
    if (isReviewMode || result) return
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify({ answers }))
    } catch {
      // Ignore
    }
  }, [answers, isReviewMode, result, sessionKey])

  // --- ANSWER HANDLER ---
  const handleAnswer = useCallback(
    (questionId: string, value: string | number) => {
      if (hasSubmittedRef.current || isReviewMode) return
      setAnswers((prev) => ({ ...prev, [questionId]: value }))
    },
    [isReviewMode],
  )

  // --- SUBMIT ---
  const handleSubmit = useCallback(async () => {
    if (hasSubmittedRef.current || isSubmitting || result || isReviewMode) return
    hasSubmittedRef.current = true
    setIsSubmitting(true)

    try {
      sessionStorage.removeItem(sessionKey)
    } catch {
      // Ignore
    }

    try {
      const res = await submitTestResult({
        classId,
        unitId,
        testId: testData.id,
        answers,
      })

      if (res.resultData) {
        setResult(res.resultData)
        setShowSummary(true)
        setIsReviewMode(true)
        if (onTestComplete) {
          onTestComplete(testData.id, res.resultData)
        }
      } else {
        throw new Error('No result data returned')
      }

      router.refresh()
    } catch (e) {
      console.error(e)
      alert('Có lỗi xảy ra khi nộp bài.')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    isSubmitting,
    result,
    isReviewMode,
    onTestComplete,
    classId,
    unitId,
    testData.id,
    answers,
    router,
    sessionKey,
  ])

  // --- BEFOREUNLOAD / PAGEHIDE BEACON ---
  useEffect(() => {
    if (isReviewMode) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasSubmittedRef.current || isReviewMode || result) return
      const currentAnswers = answersRef.current
      if (currentAnswers && Object.keys(currentAnswers).length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    const handlePageHide = () => {
      if (hasSubmittedRef.current || isReviewMode || result) return
      const currentAnswers = answersRef.current
      if (!currentAnswers || Object.keys(currentAnswers).length === 0) {
        return
      }
      hasSubmittedRef.current = true
      try {
        sessionStorage.removeItem(sessionKey)
      } catch {
        // Ignore
      }
      const payload = {
        classId,
        unitId,
        testId: testData.id,
        answers: currentAnswers,
        isInterrupted: true,
      }
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
        navigator.sendBeacon('/api/analytics/test-submit', blob)
      } catch {
        // Fallback
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [isReviewMode, result, classId, unitId, testData.id, sessionKey])

  // --- RETAKE ---
  const handleRetake = async (onRestartSuccess?: (shuffled: TestBlock[]) => void) => {
    if (isRetaking) return
    setIsRetaking(true)
    try {
      const res = await startTest({
        classId,
        unitId,
        testId: testData.id,
        forceRetake: true,
      })
      if (!res.success) {
        throw new Error('Failed to restart test')
      }

      const sourceBlocks =
        ('content' in testData ? testData.content : testData.blocks) || []
      const shuffled = shuffleRetakableExam(sourceBlocks)

      setCurrentBlocks(shuffled)
      setAnswers({})
      setInitialDurationSeconds(testData.duration * 60)
      setRetakeKey((prev) => prev + 1)
      setResult(null)
      setShowSummary(false)
      setIsReviewMode(false)
      hasSubmittedRef.current = false

      onRestartSuccess?.(shuffled)
    } catch (e) {
      console.error(e)
      alert('Không thể khởi tạo lượt làm lại. Vui lòng thử lại.')
    } finally {
      setIsRetaking(false)
    }
  }

  return {
    rawBlocks,
    currentBlocks,
    isReviewMode,
    isRetaking,
    retakeKey,
    initialDurationSeconds,
    answers,
    setAnswers,
    isSubmitting,
    result,
    showSummary,
    setShowSummary,
    handleAnswer,
    handleSubmit,
    handleRetake,
  }
}
