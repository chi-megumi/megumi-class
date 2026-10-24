'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import type { TestBlock } from '~/modules/teacher/types'
import type { TestViewProps } from './types'
import TestSummary from './TestSummary'
import TestHeader from './TestHeader'
import TestFooter from './TestFooter'
import MultipleChoiceBlock from './MultipleChoiceBlock'
import FillBlankBlock from './FillBlankBlock'
import MatchingBlock from './MatchingBlock'
import ReorderBlock from './ReorderBlock'
import { ReadingBlock } from './reading'
import { useExamSession } from './useExamSession'
import { useMatchingState } from './useMatchingState'
import { useReorderState, initializeReorderState } from './useReorderState'

export default function TestView({
  testData,
  unitId,
  onClose,
  initialResult,
  onTestComplete,
  isRetake,
}: TestViewProps) {
  const params = useParams()
  const classId = params.classId as string

  const {
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
  } = useExamSession({
    testData,
    classId,
    unitId,
    initialResult,
    onTestComplete,
    isRetake,
  })

  const {
    selectedMatchingRight,
    selectedMatchingSlot,
    dragOverMatchingSlot,
    setDragOverMatchingSlot,
    handleMatchingSlotClick,
    handleMatchingBankItemClick,
    handleUnmatch,
    handleDragStartMatchingRight,
    handleDropMatchingSlot,
    resetMatching,
  } = useMatchingState({
    answers,
    setAnswers,
    isReviewMode,
    hasResult: !!result,
  })

  const {
    shuffledWordsMap,
    setShuffledWordsMap,
    reorderSelections,
    setReorderSelections,
    dragOverReorderZone,
    setDragOverReorderZone,
    dragOverReorderPos,
    setDragOverReorderPos,
    handleSelectWord,
    handleRemoveWord,
    handleMoveWord,
    handleSwapWords,
    handleResetReorder,
    handleDragStartBankWord,
    handleDragStartSentenceWord,
    handleDropOnSentenceSlot,
  } = useReorderState({
    currentBlocks,
    initialAnswers: answers,
    onAnswer: handleAnswer,
    isReviewMode,
    hasResult: !!result,
  })

  const isMiniChallenge = testData.duration <= 15
  const hasReadingBlock = currentBlocks.some((b) => b.type === 'reading')

  const onRetakeClicked = () => {
    handleRetake((shuffled) => {
      resetMatching()
      const { wordsMap: nextWordsMap, initSelections: nextSelections } = initializeReorderState(
        shuffled,
        {},
      )
      setShuffledWordsMap(nextWordsMap)
      setReorderSelections(nextSelections)
    })
  }

  // --- SUMMARY VIEW ---
  if (result && showSummary) {
    return (
      <TestSummary
        result={result}
        isRetakable={testData.isRetakable}
        isRetaking={isRetaking}
        onRetake={onRetakeClicked}
        onViewDetail={() => setShowSummary(false)}
        onClose={onClose}
      />
    )
  }

  return (
    <div
      className={`mx-auto flex flex-col h-full bg-white rounded-xl overflow-hidden border isolate transition-all duration-300 ${
        hasReadingBlock ? 'w-full max-w-6xl' : 'w-full max-w-2xl'
      } ${isMiniChallenge ? 'border-orange-200' : 'border-gray-200'}`}
    >
      <TestHeader
        key={retakeKey}
        title={testData.title}
        isMiniChallenge={isMiniChallenge}
        isReviewMode={isReviewMode}
        initialDurationSeconds={initialDurationSeconds}
        onTimeUp={handleSubmit}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-3 sm:p-4 bg-[#f8f9fa] relative">
        <div className={`space-y-3.5 transition-all duration-300`}>
          {currentBlocks.map((block: TestBlock, index: number) => {
            return (
              <div
                key={block.id}
                className={`bg-white rounded-xl border p-3 sm:p-4 scroll-contain-item transition-all ${
                  isMiniChallenge ? 'border-orange-200' : 'border-gray-200'
                }`}
              >
                <div className="mb-2.5 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs shadow-2xs ${
                      isMiniChallenge
                        ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <h3
                    className={`text-sm sm:text-base font-bold ${
                      isMiniChallenge ? 'text-orange-900' : 'text-gray-800'
                    }`}
                  >
                    {block.title}
                  </h3>
                </div>

                {block.type === 'multiple_choice' && (
                  <MultipleChoiceBlock
                    questions={block.content?.questions || []}
                    answers={answers}
                    isMiniChallenge={isMiniChallenge}
                    isReviewMode={isReviewMode}
                    result={result}
                    onAnswer={handleAnswer}
                  />
                )}

                {block.type === 'reading' && (
                  <ReadingBlock
                    blockId={block.id}
                    text={block.content?.text}
                    questions={block.content?.questions || []}
                    passages={block.content?.passages}
                    answers={answers}
                    isMiniChallenge={isMiniChallenge}
                    isReviewMode={isReviewMode}
                    result={result}
                    onAnswer={handleAnswer}
                  />
                )}

                {block.type === 'fill_blank' && (
                  <FillBlankBlock
                    blockId={block.id}
                    questions={block.content?.questions}
                    text={block.content?.text}
                    answer={block.content?.answer}
                    answers={answers}
                    isMiniChallenge={isMiniChallenge}
                    isReviewMode={isReviewMode}
                    result={result}
                    onAnswer={handleAnswer}
                  />
                )}

                {block.type === 'matching' &&
                  (() => {
                    const pairs = block.content?.pairs || []
                    let rightItems = block.content?.shuffledRight
                    if (!rightItems || rightItems.length === 0) {
                      rightItems = pairs.map((p) => ({ id: p.id, text: p.right || '' }))
                    } else {
                      rightItems = rightItems.map((r) => ({
                        id: r.id,
                        text: r.text || pairs.find((p) => p.id === r.id)?.right || '',
                      }))
                    }

                    return (
                      <MatchingBlock
                        blockId={block.id}
                        pairs={pairs}
                        shuffledRight={rightItems}
                        answers={answers}
                        isReviewMode={isReviewMode}
                        result={result}
                        selectedMatchingRight={selectedMatchingRight}
                        selectedMatchingSlot={selectedMatchingSlot}
                        dragOverMatchingSlot={dragOverMatchingSlot}
                        onSlotClick={handleMatchingSlotClick}
                        onBankItemClick={handleMatchingBankItemClick}
                        onUnmatch={handleUnmatch}
                        onDragStartRight={handleDragStartMatchingRight}
                        onDropSlot={handleDropMatchingSlot}
                        onDragOverSlot={(leftId) => setDragOverMatchingSlot(leftId)}
                        onDragLeaveSlot={() => setDragOverMatchingSlot(null)}
                      />
                    )
                  })()}

                {block.type === 'reorder' && (
                  <ReorderBlock
                    questions={block.content?.questions || []}
                    answers={answers}
                    isReviewMode={isReviewMode}
                    result={result}
                    shuffledWordsMap={shuffledWordsMap}
                    reorderSelections={reorderSelections}
                    dragOverReorderZone={dragOverReorderZone}
                    dragOverReorderPos={dragOverReorderPos}
                    onSelectWord={handleSelectWord}
                    onRemoveWord={handleRemoveWord}
                    onMoveWord={handleMoveWord}
                    onSwapWords={handleSwapWords}
                    onResetReorder={handleResetReorder}
                    onDragStartBankWord={handleDragStartBankWord}
                    onDragStartSentenceWord={handleDragStartSentenceWord}
                    onDropOnSentenceSlot={handleDropOnSentenceSlot}
                    onDragOverZone={(qId) => setDragOverReorderZone(qId)}
                    onDragLeaveZone={() => setDragOverReorderZone(null)}
                    onDragOverPos={(pos) => setDragOverReorderPos(pos)}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <TestFooter
        isReviewMode={isReviewMode}
        isMiniChallenge={isMiniChallenge}
        isSubmitting={isSubmitting}
        isRetakable={testData.isRetakable}
        isRetaking={isRetaking}
        onSubmit={handleSubmit}
        onRetake={onRetakeClicked}
        onClose={onClose}
      />
    </div>
  )
}
