'use client'

import { useRef, useEffect } from 'react'
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
  const masteredSet = useFlashcardStore((s) => s.masteredSet)

  const startTimeRef = useRef(0)
  const hasFinishedRef = useRef(false)

  // Track session and recover if previously interrupted by F5
  useEffect(() => {
    if (!unitId || mode === 'test') return

    startTimeRef.current = Date.now()

    const sessionKey = `megumi_active_game_${unitId}_${mode}`

    // 1. Clean up any previous session state
    try {
      sessionStorage.removeItem(sessionKey)
    } catch {
      // Ignore
    }

    // 2. Start current session
    startTimeRef.current = Date.now()
    hasFinishedRef.current = false
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

    // 3. Handle pagehide / F5 / tab close
    const handlePageHide = () => {
      if (hasFinishedRef.current) return
      hasFinishedRef.current = true
      const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
      const isQuick = elapsed < 5
      const payload = {
        unitId,
        classId,
        gameType: mode,
        time: elapsed,
        isInterrupted: true,
        isQuickExit: isQuick,
      }
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
        navigator.sendBeacon('/api/analytics/game-progress', blob)
        sessionStorage.removeItem(sessionKey)
      } catch {
        // Ignore
      }
    }

    window.addEventListener('pagehide', handlePageHide)
    return () => {
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [unitId, classId, mode])

  const handleClose = async () => {
    hasFinishedRef.current = true
    if (unitId && mode !== 'test') {
      const sessionKey = `megumi_active_game_${unitId}_${mode}`
      try {
        sessionStorage.removeItem(sessionKey)
      } catch {
        // Ignore
      }

      const items = vocabItems || []
      const totalVocab = items.length
      const masteredCount = masteredSet.length
      const masteryPercentage = totalVocab > 0 ? Math.round((masteredCount / totalVocab) * 100) : 0
      const durationSeconds =
        startTimeRef.current > 0 ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)) : 1

      let quizScore: number | undefined
      let correctCount: number | undefined
      let totalCount: number | undefined
      let isQuick = durationSeconds < 5

      if (mode === 'quiz') {
        const quizState = useQuizStore.getState()
        const totalAnswered = quizState.sessionAnswers?.length || 0
        correctCount = quizState.sessionCorrect || 0
        totalCount = quizState.sessionTotal || totalAnswered
        quizScore = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
        if (totalAnswered === 0 && durationSeconds < 10) {
          isQuick = true
        }
      }

      try {
        await recordGameCompletion({
          unitId,
          classId,
          gameType: mode as 'flashcard' | 'quiz' | 'match',
          masteryProgress: masteryPercentage,
          time: durationSeconds,
          score: quizScore,
          correctCount,
          totalCount,
          isQuickExit: isQuick,
          isInterrupted: false,
        })
      } catch (err) {
        console.error('recordGameCompletion error:', err)
      }
    }

    onClose()
  }

  // We wrap inside FlashcardProvider to isolate the state for this student's unit run
  return (
    <Portal>
      <div className="fixed inset-0 z-[100] bg-gradient-to-br from-[#F5F7FF] via-[#EAEFFF] to-[#F3E8FF] backdrop-blur-xl flex flex-col animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        <div className="px-5 py-3 flex justify-between items-center border-b border-indigo-100 shrink-0 bg-white/40 shadow-xs">
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

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
          <GamePlayerInner mode={mode} vocabItems={vocabItems} testData={testData} initialResult={initialResult} unitId={unitId} onClose={handleClose} onTestComplete={onTestComplete} isRetake={isRetake} />
        </div>
      </div>
    </Portal>
  )
}

export default GamePlayerModal
