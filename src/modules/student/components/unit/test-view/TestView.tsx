'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { History, Clock, Calendar, Trophy } from 'lucide-react'
import type { TestBlock } from '~/modules/teacher/types'
import type { TestViewProps } from './types'
import type { ExamAttemptHistoryEntry, TestResultPayload } from '@/actions/analytics/types'
import { formatDuration } from '@/actions/analytics/history-utils'
import TestSummary from './TestSummary'
import TestHeader from './TestHeader'
import TestFooter from './TestFooter'
import SubmitConfirmModal from './SubmitConfirmModal'
import TestViewSkeleton from './TestViewSkeleton'
import { calculateExamQuestionsStats } from './examStats'
import MultipleChoiceBlock from './MultipleChoiceBlock'
import FillBlankBlock from './FillBlankBlock'
import MatchingBlock from './MatchingBlock'
import ReorderBlock from './ReorderBlock'
import { ReadingBlock } from './reading'
import { useExamSession } from './useExamSession'
import { useMatchingState } from './useMatchingState'
import { useReorderState, initializeReorderState } from './useReorderState'

const formatDate = (dateStr?: string | Date | null) => {
  if (!dateStr) return '--'
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return '--'
  }
}

const formatTime = (dateStr?: string | Date | null) => {
  if (!dateStr) return '--'
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return '--'
  }
}

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
  } = useExamSession({
    testData,
    classId,
    unitId,
    initialResult,
    onTestComplete,
    isRetake,
  })

  const [selectedAttemptNumber, setSelectedAttemptNumber] = useState<number | null>(null)

  // Attempts history list for multi-attempt reviewing
  const attemptsHistory: ExamAttemptHistoryEntry[] = useMemo(() => {
    const list = result?.history || initialResult?.history
    if (list && list.length > 0) return list
    if (result || initialResult?.completedAt) {
      const res = result || initialResult
      return [
        {
          attempt: 1,
          score: res?.score ?? 0,
          correctAnswers: res?.correctAnswers ?? 0,
          totalQuestions: res?.totalQuestions ?? 0,
          startedAt:
            initialResult?.startedAt ||
            (res?.completedAt ? String(res.completedAt) : new Date().toISOString()),
          completedAt: res?.completedAt
            ? String(res.completedAt)
            : res?.submittedAt
              ? String(res.submittedAt)
              : new Date().toISOString(),
          durationSeconds: res?.durationSeconds,
          answers: (res?.answers || answers) as Record<string, unknown>,
          correctAnswersDetail: res?.correctAnswersDetail,
        },
      ]
    }
    return []
  }, [result, initialResult, answers])

  const currentAttempt = useMemo(() => {
    if (attemptsHistory.length === 0) return null
    if (selectedAttemptNumber !== null) {
      const found = attemptsHistory.find((a) => a.attempt === selectedAttemptNumber)
      if (found) return found
    }
    return attemptsHistory[attemptsHistory.length - 1]
  }, [attemptsHistory, selectedAttemptNumber])

  const effectiveAnswers = useMemo(() => {
    if (isReviewMode) {
      if (currentAttempt?.answers && Object.keys(currentAttempt.answers).length > 0) {
        return currentAttempt.answers as Record<string, string | number>
      }
      if (result?.answers) {
        return result.answers as Record<string, string | number>
      }
      if (initialResult?.answers) {
        return initialResult.answers as Record<string, string | number>
      }
    }
    return answers
  }, [isReviewMode, currentAttempt, result, initialResult, answers])

  const effectiveResult = useMemo(() => {
    if (isReviewMode && currentAttempt) {
      return {
        ...(result || initialResult || {}),
        score: currentAttempt.score,
        correctAnswers: currentAttempt.correctAnswers,
        totalQuestions: currentAttempt.totalQuestions,
        answers: currentAttempt.answers || result?.answers || initialResult?.answers,
        correctAnswersDetail:
          currentAttempt.correctAnswersDetail ||
          result?.correctAnswersDetail ||
          initialResult?.correctAnswersDetail,
        durationSeconds:
          currentAttempt.durationSeconds ?? result?.durationSeconds ?? initialResult?.durationSeconds,
        completedAt:
          currentAttempt.completedAt || result?.completedAt || initialResult?.completedAt || '',
        submittedAt:
          currentAttempt.completedAt || result?.completedAt || initialResult?.completedAt || '',
      } as TestResultPayload
    }
    return result
  }, [isReviewMode, currentAttempt, result, initialResult])

  const bestScore = useMemo(() => {
    if (attemptsHistory.length === 0) return result?.score ?? 0
    return Math.max(...attemptsHistory.map((h) => h.score))
  }, [attemptsHistory, result])

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
    answers: isReviewMode ? effectiveAnswers : answers,
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
    initialAnswers: isReviewMode ? effectiveAnswers : answers,
    onAnswer: handleAnswer,
    isReviewMode,
    hasResult: !!result,
  })

  const isMiniChallenge = testData.duration <= 15
  const hasReadingBlock = currentBlocks.some((b) => b.type === 'reading')

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const examStats = useMemo(() => {
    return calculateExamQuestionsStats(currentBlocks, answers)
  }, [currentBlocks, answers])

  const handleConfirmSubmit = useCallback(() => {
    setShowConfirmModal(false)
    handleSubmit()
  }, [handleSubmit])

  const handleTimeUp = useCallback(() => {
    setShowConfirmModal(false)
    handleSubmit()
  }, [handleSubmit])

  const onRetakeClicked = () => {
    setShowConfirmModal(false)
    setSelectedAttemptNumber(null)
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
      <div className="w-full h-full flex flex-col items-center justify-start overflow-y-auto overscroll-contain custom-scrollbar p-2 sm:p-4 pb-16">
        <TestSummary
          result={result}
          isRetakable={testData.isRetakable}
          isRetaking={isRetaking}
          onRetake={onRetakeClicked}
          onViewDetail={(attemptNum) => {
            if (typeof attemptNum === 'number') {
              setSelectedAttemptNumber(attemptNum)
            }
            setShowSummary(false)
          }}
          onClose={onClose}
        />
      </div>
    )
  }

  if (!isMounted) {
    return <TestViewSkeleton isReading={hasReadingBlock} />
  }

  return (
    <div
      className={`mx-auto flex flex-col h-full bg-white rounded-xl overflow-hidden border isolate transition-all duration-300 ${
        hasReadingBlock ? 'w-full max-w-6xl' : 'w-full max-w-2xl'
      } ${isMiniChallenge ? 'border-orange-200' : 'border-gray-200'}`}
    >
      <TestHeader
        key={`${retakeKey}_${targetEndTime ?? 'initial'}`}
        title={testData.title}
        isMiniChallenge={isMiniChallenge}
        isReviewMode={isReviewMode}
        initialDurationSeconds={initialDurationSeconds}
        targetEndTime={targetEndTime}
        onTimeUp={handleTimeUp}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-3 sm:p-4 bg-[#f8f9fa] relative">
        {/* Attempt History Switcher (Review Mode) */}
        {isReviewMode && attemptsHistory.length > 0 && (
          <div className="bg-white rounded-xl border border-indigo-100 p-3 sm:p-3.5 shadow-xs mb-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <History size={16} />
                </span>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    Lịch sử làm bài ({attemptsHistory.length} lượt)
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Chọn lượt làm bài bên dưới để xem lại chi tiết bài làm
                  </span>
                </div>
              </div>
              {bestScore > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                  <Trophy size={12} className="text-amber-600" />
                  <span>Điểm cao nhất: {bestScore}đ</span>
                </div>
              )}
            </div>

            {/* Attempt selection tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 custom-scrollbar">
              {attemptsHistory.map((att) => {
                const isSelected = currentAttempt?.attempt === att.attempt
                const isHighest = att.score === bestScore
                const isLatest = att.attempt === attemptsHistory[attemptsHistory.length - 1]?.attempt

                return (
                  <button
                    key={att.attempt}
                    type="button"
                    onClick={() => setSelectedAttemptNumber(att.attempt)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <span>Lượt #{att.attempt}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isSelected
                          ? 'bg-indigo-700/80 text-white'
                          : 'bg-white/80 text-indigo-700 border border-indigo-100'
                      }`}
                    >
                      {att.score}đ
                    </span>
                    {isHighest && (
                      <span
                        className={`text-[9px] px-1 rounded font-bold ${
                          isSelected ? 'bg-amber-400 text-gray-900' : 'bg-amber-100 text-amber-800'
                        }`}
                        title="Điểm cao nhất"
                      >
                        ★
                      </span>
                    )}
                    {isLatest && !isSelected && (
                      <span className="text-[9px] text-gray-400">(mới nhất)</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Active attempt summary strip */}
            {currentAttempt && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-600 bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                <span className="font-bold text-gray-800">
                  Đang xem Lượt #{currentAttempt.attempt}:
                </span>
                <span className="px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-700">
                  {currentAttempt.score}đ ({currentAttempt.correctAnswers}/{currentAttempt.totalQuestions} câu đúng)
                </span>
                {currentAttempt.durationSeconds && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock size={12} className="text-gray-400" />
                    {formatDuration(currentAttempt.durationSeconds)}
                  </span>
                )}
                {currentAttempt.completedAt && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <Calendar size={12} className="text-gray-400" />
                    {formatDate(currentAttempt.completedAt)} {formatTime(currentAttempt.completedAt)}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

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
                    answers={effectiveAnswers}
                    isMiniChallenge={isMiniChallenge}
                    isReviewMode={isReviewMode}
                    result={effectiveResult}
                    onAnswer={handleAnswer}
                  />
                )}

                {block.type === 'reading' && (
                  <ReadingBlock
                    blockId={block.id}
                    text={block.content?.text}
                    questions={block.content?.questions || []}
                    passages={block.content?.passages}
                    answers={effectiveAnswers}
                    isMiniChallenge={isMiniChallenge}
                    isReviewMode={isReviewMode}
                    result={effectiveResult}
                    onAnswer={handleAnswer}
                  />
                )}

                {block.type === 'fill_blank' && (
                  <FillBlankBlock
                    blockId={block.id}
                    questions={block.content?.questions}
                    text={block.content?.text}
                    answer={block.content?.answer}
                    answers={effectiveAnswers}
                    isMiniChallenge={isMiniChallenge}
                    isReviewMode={isReviewMode}
                    result={effectiveResult}
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
                        answers={effectiveAnswers}
                        isReviewMode={isReviewMode}
                        result={effectiveResult}
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
                    answers={effectiveAnswers}
                    isReviewMode={isReviewMode}
                    result={effectiveResult}
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
        onSubmit={() => setShowConfirmModal(true)}
        onRetake={onRetakeClicked}
        onClose={onClose}
        onViewSummary={() => setShowSummary(true)}
        lastSavedAt={lastSavedAt}
      />

      <SubmitConfirmModal
        isOpen={showConfirmModal && !result}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
        stats={examStats}
        isMiniChallenge={isMiniChallenge}
      />
    </div>
  )
}
