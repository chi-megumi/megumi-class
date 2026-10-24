import { useState } from 'react'
import { type VocabItem } from '@/types/vocab'
import { useFlashcardStore } from '@/components/flashcards/stores/useFlashcardStore'
import { Flashcard3D } from '@/components/flashcards/components/Flashcard3D'
import { FlashcardControls } from '@/components/flashcards/components/FlashcardControls'
import { QuizView } from '@/components/flashcards/components/quiz/QuizView'
import { MatchGame } from '@/components/flashcards/components/match/MatchGame'
import { ProgressBar } from '@/components/flashcards/components/ProgressBar'
import { ControlsBar } from '@/components/flashcards/components/ControlsBar'
import { useFlashcardShortcuts } from '@/components/flashcards/hooks/useFlashcardShortcuts'
import { ExamData, VocabItemData, TestContent } from '~/modules/teacher/types'
import type { TestResultPayload } from '@/actions/analytics/types'
import TestView from '@/modules/student/components/unit/TestView'

const FlashcardGame = () => {
  useFlashcardShortcuts()
  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
      <ProgressBar />
      <ControlsBar />
      <Flashcard3D />
      <FlashcardControls />
    </div>
  )
}

type GamePlayerInnerProps = {
  mode: 'flashcard' | 'quiz' | 'match' | 'test'
  vocabItems?: VocabItemData[]
  testData?: ExamData | TestContent
  initialResult?: TestResultPayload
  unitId?: string
  onClose?: () => void
  onTestComplete?: (testId: string, result: TestResultPayload) => void
  onGameComplete?: (details?: { time?: number }) => void
  isRetake?: boolean
}

const GamePlayerInner = ({
  mode,
  vocabItems = [],
  testData,
  initialResult,
  unitId,
  onClose,
  onTestComplete,
  onGameComplete,
  isRetake,
}: GamePlayerInnerProps) => {
  const setVocabItems = useFlashcardStore((s) => s.setVocabItems)
  const setMode = useFlashcardStore((s) => s.setMode)

  useState(() => {
    // Initialize on mount
    setVocabItems((vocabItems || []) as unknown as VocabItem[])
    setMode(mode as import('@/components/flashcards/stores/useFlashcardStore').AppMode)
  })

  return (
    <div className={`w-full ${mode === 'test' ? 'max-w-3xl p-1.5 sm:p-3 md:p-4 h-full min-h-0' : 'max-w-5xl p-4 md:p-8'} mx-auto flex-1 flex flex-col justify-center`}>
      {mode === 'flashcard' && <FlashcardGame />}
      {mode === 'quiz' && (
        <div className="w-full animate-in fade-in zoom-in-95 duration-500">
          <QuizView onClose={onClose} onGameComplete={onGameComplete} />
        </div>
      )}
      {mode === 'match' && (
        <div className="w-full animate-in fade-in zoom-in-95 duration-500">
          <MatchGame onClose={onClose} onGameComplete={onGameComplete} />
        </div>
      )}
      {mode === 'test' && testData && (
        <div className="w-full h-full min-h-0 pb-2">
          <TestView testData={testData} initialResult={initialResult} unitId={unitId} onClose={onClose!} onTestComplete={onTestComplete} isRetake={isRetake} />
        </div>
      )}
    </div>
  )
}

export default GamePlayerInner
