'use client'

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { submitTestResult, startTest } from '@/actions/analytics/exam-session'
import { shuffleRetakableExam } from '@/modules/student/utils/examShuffler'
import {
  loadStoredExamSession,
  saveStoredExamSession,
  clearStoredExamSession,
  type StoredActiveExamSession,
} from './examSessionStorage'
import type { TestResultPayload } from '@/actions/analytics/types'
import type { ExamData, TestContent, TestBlock } from '~/modules/teacher/types'

const emptySubscribe = () => () => {}

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

  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  const safeDuration =
    (testData.duration && testData.duration > 0 ? testData.duration : 15) * 60

  // Helper to synchronously read valid active session on client
  const getInitialActiveSession = (): StoredActiveExamSession | null => {
    if (typeof window === 'undefined') return null
    if (!isRetake && initialResult?.completedAt) return null
    const stored = loadStoredExamSession(classId, testData.id)
    if (!stored) return null

    // If server start time is significantly newer than stored session, stored is obsolete
    if (initialResult?.startedAt && stored.startedAt) {
      const serverStart = new Date(initialResult.startedAt).getTime()
      const localStart = new Date(stored.startedAt).getTime()
      if (serverStart - localStart > 30000) {
        clearStoredExamSession(classId, testData.id)
        return null
      }
    }

    return stored
  }

  const [isReviewMode, setIsReviewMode] = useState<boolean>(() => {
    if (isRetake) return false
    return !!initialResult && !!initialResult.completedAt
  })
  const [isRetaking, setIsRetaking] = useState(false)
  const [retakeKey, setRetakeKey] = useState(0)

  // Initialize currentBlocks with stored blocks if available, else rawBlocks
  const [currentBlocks, setCurrentBlocks] = useState<TestBlock[]>(() => {
    const session = getInitialActiveSession()
    if (session?.blocks && session.blocks.length > 0) {
      return session.blocks
    }
    return rawBlocks
  })

  // Initialize answers from storedSession if available
  const [answers, setAnswers] = useState<Record<string, string | number>>(() => {
    const session = getInitialActiveSession()
    if (session?.answers) {
      return session.answers
    }
    if (isRetake) return {}
    return initialResult?.answers || {}
  })

  // Initialize targetEndTime and initialDurationSeconds from storedSession or server startedAt
  const [targetEndTime, setTargetEndTime] = useState<number | null>(() => {
    const session = getInitialActiveSession()
    if (session?.targetEndTime) {
      return session.targetEndTime
    }
    if (initialResult?.startedAt && (!initialResult?.completedAt || isRetake)) {
      const startMs = new Date(initialResult.startedAt).getTime()
      const endMs = startMs + safeDuration * 1000
      if (Date.now() - endMs < 24 * 60 * 60 * 1000) {
        return endMs
      }
    }
    return null
  })

  const [initialDurationSeconds, setInitialDurationSeconds] = useState<number>(() => {
    const session = getInitialActiveSession()
    if (session?.targetEndTime) {
      return Math.max(0, Math.floor((session.targetEndTime - Date.now()) / 1000))
    }
    if (initialResult?.startedAt && (!initialResult?.completedAt || isRetake)) {
      const startMs = new Date(initialResult.startedAt).getTime()
      const endMs = startMs + safeDuration * 1000
      return Math.max(0, Math.floor((endMs - Date.now()) / 1000))
    }
    return safeDuration
  })

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() => {
    const session = getInitialActiveSession()
    return session?.lastSavedAt || null
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
  const blocksRef = useRef(currentBlocks)
  const targetEndTimeRef = useRef(targetEndTime)

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    blocksRef.current = currentBlocks
  }, [currentBlocks])

  useEffect(() => {
    targetEndTimeRef.current = targetEndTime
  }, [targetEndTime])

  // --- SUBMIT CALLBACK ---
  const handleSubmit = useCallback(
    async (explicitAnswers?: unknown) => {
      if (hasSubmittedRef.current || isSubmitting || result || isReviewMode) return
      hasSubmittedRef.current = true
      setIsSubmitting(true)

      // Guard against React Synthetic Events (e.g. from onClick={handleSubmit})
      const isPlainAnswers =
        explicitAnswers &&
        typeof explicitAnswers === 'object' &&
        !('nativeEvent' in explicitAnswers) &&
        !('target' in explicitAnswers) &&
        !('currentTarget' in explicitAnswers)

      const rawAnswers = (isPlainAnswers ? explicitAnswers : answersRef.current) as Record<string, unknown>

      // Ensure answers are strictly serializable string/number primitives
      const cleanAnswers: Record<string, string | number> = {}
      if (rawAnswers && typeof rawAnswers === 'object') {
        for (const [k, v] of Object.entries(rawAnswers)) {
          if (typeof v === 'string' || typeof v === 'number') {
            cleanAnswers[k] = v
          }
        }
      }

      try {
        const res = await submitTestResult({
          classId,
          unitId,
          testId: testData.id,
          answers: cleanAnswers,
        })

        if (res.resultData) {
          clearStoredExamSession(classId, testData.id)
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
        hasSubmittedRef.current = false
      } finally {
        setIsSubmitting(false)
      }
    },
    [isSubmitting, result, isReviewMode, onTestComplete, classId, unitId, testData.id, router],
  )

  // --- CLIENT MOUNT & SESSION RESTORATION FROM LOCALSTORAGE ---
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isReviewMode || (initialResult && initialResult.completedAt && !isRetake)) {
      clearStoredExamSession(classId, testData.id)
      return
    }

    const storedSession = loadStoredExamSession(classId, testData.id)
    const now = Date.now()

    if (storedSession) {
      // Restore from active localStorage session (whether first attempt or retake)
      const restoredBlocks =
        storedSession.blocks && storedSession.blocks.length > 0
          ? storedSession.blocks
          : rawBlocks
      const restoredAnswers = storedSession.answers || {}
      const restoredEndTime = storedSession.targetEndTime || (now + safeDuration * 1000)
      const remaining = Math.max(0, Math.floor((restoredEndTime - now) / 1000))

      setCurrentBlocks(restoredBlocks)
      setAnswers(restoredAnswers)
      setTargetEndTime(restoredEndTime)
      setInitialDurationSeconds(remaining)
      setLastSavedAt(storedSession.lastSavedAt || null)

      // Keep localStorage freshly synced
      saveStoredExamSession({
        testId: testData.id,
        classId,
        unitId,
        startedAt: storedSession.startedAt || new Date().toISOString(),
        targetEndTime: restoredEndTime,
        blocks: restoredBlocks,
        answers: restoredAnswers,
        lastSavedAt: storedSession.lastSavedAt || new Date().toISOString(),
      })

      // If time already expired while away, submit immediately
      if (remaining <= 0) {
        handleSubmit(restoredAnswers)
      }
    } else {
      // Initialize fresh session or retake
      const sessionBlocks = testData.isRetakable
        ? shuffleRetakableExam(rawBlocks)
        : rawBlocks

      const startTimeStr =
        initialResult?.startedAt && (!initialResult?.completedAt || isRetake)
          ? initialResult.startedAt
          : new Date().toISOString()
      const startMs = new Date(startTimeStr).getTime()
      const calculatedEndTime = startMs + safeDuration * 1000
      const remaining = Math.max(0, Math.floor((calculatedEndTime - now) / 1000))
      const initialAnswers = isRetake ? {} : (initialResult?.answers || {})

      setCurrentBlocks(sessionBlocks)
      setAnswers(initialAnswers)
      setTargetEndTime(calculatedEndTime)
      setInitialDurationSeconds(remaining)

      const newSession: StoredActiveExamSession = {
        testId: testData.id,
        classId,
        unitId,
        startedAt: startTimeStr,
        targetEndTime: calculatedEndTime,
        blocks: sessionBlocks,
        answers: initialAnswers,
        lastSavedAt: new Date().toISOString(),
      }
      saveStoredExamSession(newSession)
      setLastSavedAt(newSession.lastSavedAt)

      if (remaining <= 0) {
        handleSubmit(initialAnswers)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- AUTO-SAVE ON ANSWER CHANGE TO LOCALSTORAGE (DEBOUNCED) ---
  useEffect(() => {
    if (!isMounted || isReviewMode || result || !targetEndTime) return

    const timer = setTimeout(() => {
      const nowIso = new Date().toISOString()
      saveStoredExamSession({
        testId: testData.id,
        classId,
        unitId,
        startedAt: initialResult?.startedAt || nowIso,
        targetEndTime,
        blocks: blocksRef.current,
        answers,
        lastSavedAt: nowIso,
      })
      setLastSavedAt(nowIso)
    }, 400)

    return () => clearTimeout(timer)
  }, [
    answers,
    isMounted,
    isReviewMode,
    result,
    targetEndTime,
    classId,
    testData.id,
    unitId,
    initialResult?.startedAt,
  ])

  // --- ANSWER HANDLER ---
  const handleAnswer = useCallback(
    (questionId: string, value: string | number) => {
      if (hasSubmittedRef.current || isReviewMode) return
      setAnswers((prev) => ({ ...prev, [questionId]: value }))
    },
    [isReviewMode],
  )

  // --- BEFOREUNLOAD SAVE AND CONFIRMATION ---
  useEffect(() => {
    if (isReviewMode || !isMounted) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasSubmittedRef.current || isReviewMode || result) return
      const currentAnswers = answersRef.current
      if (currentAnswers && Object.keys(currentAnswers).length > 0) {
        if (targetEndTimeRef.current) {
          saveStoredExamSession({
            testId: testData.id,
            classId,
            unitId,
            startedAt: initialResult?.startedAt || new Date().toISOString(),
            targetEndTime: targetEndTimeRef.current,
            blocks: blocksRef.current,
            answers: currentAnswers,
            lastSavedAt: new Date().toISOString(),
          })
        }
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [
    isReviewMode,
    isMounted,
    result,
    classId,
    testData.id,
    unitId,
    initialResult?.startedAt,
  ])

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

      clearStoredExamSession(classId, testData.id)

      const sourceBlocks =
        ('content' in testData ? testData.content : testData.blocks) || []
      const shuffled = shuffleRetakableExam(sourceBlocks)

      const now = Date.now()
      const newTargetEndTime = now + safeDuration * 1000
      const newStartedAt = res.startedAt || new Date().toISOString()
      const nowIso = new Date().toISOString()

      const newSession: StoredActiveExamSession = {
        testId: testData.id,
        classId,
        unitId,
        startedAt: newStartedAt,
        targetEndTime: newTargetEndTime,
        blocks: shuffled,
        answers: {},
        lastSavedAt: nowIso,
      }
      saveStoredExamSession(newSession)

      setCurrentBlocks(shuffled)
      setAnswers({})
      setTargetEndTime(newTargetEndTime)
      setInitialDurationSeconds(safeDuration)
      setLastSavedAt(nowIso)
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
    targetEndTime,
    answers,
    setAnswers,
    isSubmitting,
    result,
    showSummary,
    setShowSummary,
    handleAnswer,
    handleSubmit,
    handleRetake,
    lastSavedAt,
    isMounted,
  }
}
