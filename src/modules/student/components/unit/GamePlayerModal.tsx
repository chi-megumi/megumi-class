'use client'

import { BookA, Gamepad2, Zap, X } from 'lucide-react'
import { ExamData, VocabItemData, TestContent } from '~/modules/teacher/types'
import { recordGameCompletion } from '@/actions/analytics/game-progress'
import type { TestResultPayload } from '@/actions/analytics/types'
import GamePlayerInner from './GamePlayerInner'
import '~/modules/public/flashcards/components/FlashcardsPage.scss'
import { useParams } from 'next/navigation'
import { useFlashcardStore } from '@/components/flashcards/stores/useFlashcardStore'
import Portal from '@/components/common/Portal'

type GamePlayerModalProps = {
  mode: 'flashcard' | 'quiz' | 'match' | 'test'
  unitId?: string
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
  vocabItems = [],
  testData,
  initialResult,
  onClose,
  onTestComplete,
  isRetake,
}: GamePlayerModalProps) => {
  const params = useParams()
  const classId = params.classId as string
  const masteredSet = useFlashcardStore((s) => s.masteredSet)

  const handleClose = async () => {
    // Determine mastery % only for unit flashcards/games
    if (unitId && mode !== 'test') {
      const items = vocabItems || []
      const totalVocab = items.length
      const masteredCount = masteredSet.length
      const masteryPercentage = totalVocab > 0 ? Math.round((masteredCount / totalVocab) * 100) : 0

      // Record that they played this game type (in background)
      recordGameCompletion({
        unitId,
        classId,
        gameType: mode as 'flashcard' | 'quiz' | 'match',
        masteryProgress: masteryPercentage,
      }).catch(() => {
        // Silently catch background analytics errors (e.g. preview mode or offline)
      })
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
              onClick={handleClose}
              className="p-1.5 bg-white hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors shadow-xs"
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
