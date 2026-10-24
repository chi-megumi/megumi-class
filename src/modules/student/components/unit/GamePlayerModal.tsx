'use client'

import { useRef, useEffect, useCallback } from 'react'
import { BookA, Gamepad2, Zap, X } from 'lucide-react'
import { ExamData, VocabItemData, TestContent } from '~/modules/teacher/types'
import { recordGameCompletion } from '@/actions/analytics/game-progress'
import type { TestResultPayload } from '@/actions/analytics/types'
import GamePlayerInner from './GamePlayerInner'
import '~/modules/public/flashcards/components/FlashcardsPage.scss'
import { useParams } from 'next/navigation'
import { useFlashcardStore } from '@/components/flashcards/stores/useFlashcardStore'
import { useQuizStore } from '@/components/flashcards/stores/useQuizStore'
import Portal from '@/components/common/Portal'

type GamePlayerModalProps = {
  mode: 'flashcard' | 'quiz' | 'match' | 'test'
  unitId?: string
  classId?: string
  vocabItems?: VocabItemData[]
  testData?: ExamData | TestContent
  initialResult?: TestResultPayload
  onClose: () => void
  onTestComplete?: (testId: string, result: TestResultPayload) => void
  isRetake?: boolean
}

const GamePlayerModal = ({
  mode,
  unitId,
  classId: propClassId,
  vocabItems = [],
  testData,
  initialResult,
  onClose,
  onTestComplete,
  isRetake,
}: GamePlayerModalProps) => {
  const params = useParams()
  const classId = propClassId || (params.classId as string)

  const unitIdRef = useRef(unitId)
  const classIdRef = useRef(classId)
  const modeRef = useRef(mode)
  const vocabItemsRef = useRef(vocabItems)
  const masteredSet = useFlashcardStore((s) => s.masteredSet)
  const masteredSetRef = useRef(masteredSet)

  useEffect(() => {
    unitIdRef.current = unitId
    classIdRef.current = classId
    modeRef.current = mode
    vocabItemsRef.current = vocabItems
    masteredSetRef.current = masteredSet
  }, [unitId, classId, mode, vocabItems, masteredSet])

  // Track the actual start time when the player opens and prevent resets on re-renders
  const startTimeRef = useRef<number>(0)
  const hasFinishedRef = useRef(false)
  const matchFinishedRef = useRef(false)

  // Robust function to save game progress (handles both normal completion and midway exits)
  const saveGameProgress = useCallback(
    async (isInterrupted: boolean, overrideTime?: number) => {
      const currentUnitId = unitIdRef.current
      const currentMode = modeRef.current
      if (!currentUnitId || currentMode === 'test') return
      hasFinishedRef.current = true

      const sessionKey = `megumi_active_game_${currentUnitId}_${currentMode}`
      try {
        sessionStorage.removeItem(sessionKey)
      } catch {
        // Ignore
      }

      const items = vocabItemsRef.current || []
      const totalVocab = items.length
      const currentMastered = masteredSetRef.current || []
      const masteryPercentage =
        totalVocab > 0 ? Math.round((currentMastered.length / totalVocab) * 100) : 0

      let quizScore: number | undefined
      let correctCount: number | undefined
      let totalCount: number | undefined
      let quizAnswers: Array<{ wordId: string; correct: boolean; selectedWordId?: string }> | undefined
      let quizElapsedSeconds: number | undefined

      if (currentMode === 'quiz') {
        const quizState = useQuizStore.getState()
        const totalAnswered = quizState.sessionAnswers?.length || 0
        correctCount = quizState.sessionCorrect || 0
        totalCount = quizState.sessionTotal || totalAnswered
        quizScore = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
        quizAnswers = quizState.sessionAnswers?.map((ans) => ({
          wordId: ans.wordId,
          correct: ans.correct,
          selectedWordId: ans.selectedWordId,
        }))
        if (quizState.sessionStartMs > 0) {
          quizElapsedSeconds = Math.max(1, Math.round((Date.now() - quizState.sessionStartMs) / 1000))
        }
      }

      const elapsed =
        overrideTime ??
        quizElapsedSeconds ??
        (startTimeRef.current > 0
          ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
          : 1)

      const payload = {
        unitId: currentUnitId,
        classId: classIdRef.current,
        gameType: currentMode as 'flashcard' | 'quiz' | 'match',
        masteryProgress: masteryPercentage,
        time: elapsed,
        score: quizScore,
        correctCount,
        totalCount,
        quizAnswers,
        isQuickExit: false,
        isInterrupted,
      }

      try {
        await recordGameCompletion(payload)
      } catch (err) {
        console.error('recordGameCompletion error:', err)
      }
    },
    []
  )

  // Track session and recover if previously interrupted by F5, browser back, or tab close
  useEffect(() => {
    if (!unitId || mode === 'test') return

    startTimeRef.current = Date.now()
    hasFinishedRef.current = false
    matchFinishedRef.current = false

    const sessionKey = `megumi_active_game_${unitId}_${mode}`

    // 1. Clean up any previous session state
    try {
      sessionStorage.removeItem(sessionKey)
    } catch {
      // Ignore
    }

    // 2. Start current session
    try {
      sessionStorage.setItem(
        sessionKey,
        JSON.stringify({
          unitId,
          classId,
          gameType: mode,
          startTime: startTimeRef.current,
        }),
      )
    } catch {
      // Ignore
    }

    // 3. Handle pagehide / F5 / tab close via sendBeacon as last resort
    const handlePageHide = () => {
      if (!hasFinishedRef.current) {
        hasFinishedRef.current = true
        const currentUnitId = unitIdRef.current
        const currentMode = modeRef.current
        if (!currentUnitId || currentMode === 'test') return

        let quizScore: number | undefined
        let correctCount: number | undefined
        let totalCount: number | undefined
        let quizAnswers: Array<{ wordId: string; correct: boolean; selectedWordId?: string }> | undefined
        let quizElapsedSeconds: number | undefined

        if (currentMode === 'quiz') {
          const quizState = useQuizStore.getState()
          const totalAnswered = quizState.sessionAnswers?.length || 0
          correctCount = quizState.sessionCorrect || 0
          totalCount = quizState.sessionTotal || totalAnswered
          quizScore = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
          quizAnswers = quizState.sessionAnswers?.map((ans) => ({
            wordId: ans.wordId,
            correct: ans.correct,
            selectedWordId: ans.selectedWordId,
          }))
          if (quizState.sessionStartMs > 0) {
            quizElapsedSeconds = Math.max(1, Math.round((Date.now() - quizState.sessionStartMs) / 1000))
          }
        }

        const elapsed =
          quizElapsedSeconds ??
          (startTimeRef.current > 0
            ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
            : 1)

        const payload = {
          unitId: currentUnitId,
          classId: classIdRef.current,
          gameType: currentMode as 'flashcard' | 'quiz' | 'match',
          masteryProgress:
            (vocabItemsRef.current?.length || 0) > 0
              ? Math.round(((masteredSetRef.current || []).length / vocabItemsRef.current.length) * 100)
              : 0,
          time: elapsed,
          score: quizScore,
          correctCount,
          totalCount,
          quizAnswers,
          isInterrupted: true,
          isQuickExit: false,
        }
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
          navigator.sendBeacon('/api/analytics/game-progress', blob)
        }
      }
    }

    // 4. Handle client-side popstate / browser back
    const handlePopState = () => {
      if (!hasFinishedRef.current) {
        saveGameProgress(true)
      }
    }

    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('popstate', handlePopState)
      // Save midway exit only if component unmounts without finishing
      if (!hasFinishedRef.current) {
        saveGameProgress(true)
      }
    }
  }, [unitId, mode, classId, saveGameProgress])

  // Explicit completion handler from inner games (Quiz round done, Match game finished)
  const handleGameComplete = useCallback(
    (details?: { time?: number }) => {
      if (mode === 'match') {
        matchFinishedRef.current = true
      }
      saveGameProgress(false, details?.time)
    },
    [mode, saveGameProgress]
  )

  const handleClose = async () => {
    if (!hasFinishedRef.current && unitId && mode !== 'test') {
      let isInterrupted = false
      if (mode === 'quiz') {
        const quizState = useQuizStore.getState()
        const totalAnswered = quizState.sessionAnswers?.length || 0
        // If session was completed or student answered questions and chose to finish, mark as completed
        if (quizState.sessionDone || totalAnswered > 0) {
          isInterrupted = false
        } else {
          // Bounced without answering any questions
          isInterrupted = true
        }
      } else if (mode === 'match') {
        if (!matchFinishedRef.current) {
          isInterrupted = true
        }
      } else if (mode === 'flashcard') {
        // Flashcard review: if studied >= 3 seconds, mark as completed study session
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
        isInterrupted = elapsed < 3
      }
      await saveGameProgress(isInterrupted)
    }

    onClose()
  }

  // We wrap inside FlashcardProvider to isolate the state for this student's unit run
  return (
    <Portal>
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#F5F7FF] via-[#EAEFFF] to-[#F3E8FF] flex flex-col animate-in fade-in duration-200 overflow-hidden">
        <div className="px-5 py-3 flex justify-between items-center border-b border-indigo-100 shrink-0 bg-white/70 shadow-xs">
          <h2 className="text-indigo-900 font-bold text-lg md:text-xl flex items-center gap-2">
            {mode === 'flashcard' && (
              <>
                <BookA className="text-blue-500" size={20} /> Lật Thẻ 3D
              </>
            )}
            {mode === 'quiz' && (
              <>
                <Gamepad2 className="text-purple-500" size={20} /> Đố Vui
              </>
            )}
            {mode === 'match' && (
              <>
                <Zap className="text-orange-500" size={20} /> Ghép Thẻ
              </>
            )}
            {mode === 'test' && (
              <>
                <BookA className="text-red-500" size={20} /> Bài Kiểm Tra
              </>
            )}
          </h2>
          {!(mode === 'test' && !initialResult?.completedAt) && (
            <button
              id="close-game-modal-btn"
              onClick={handleClose}
              aria-label="Đóng"
              className="p-1.5 bg-white hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors shadow-xs cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className={`flex-1 ${mode === 'test' ? 'overflow-hidden' : 'overflow-y-auto overscroll-contain'} custom-scrollbar flex flex-col relative`}>
          <GamePlayerInner
            mode={mode}
            vocabItems={vocabItems}
            testData={testData}
            initialResult={initialResult}
            unitId={unitId}
            onClose={handleClose}
            onTestComplete={onTestComplete}
            onGameComplete={handleGameComplete}
            isRetake={isRetake}
          />
        </div>
      </div>
    </Portal>
  )
}

export default GamePlayerModal
