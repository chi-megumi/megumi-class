'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { submitTestResult, startTest } from '@/actions/analytics/exam-session'
import { useParams, useRouter } from 'next/navigation'
import { TestBlock } from '~/modules/teacher/types'
import type { TestResultPayload } from '@/actions/analytics/types'
import { shuffleRetakableExam } from '@/modules/student/utils/examShuffler'

import type { TestViewProps, MatchingSelection, MatchingSlotSelection, DraggedReorderWord } from './types'
import type { MatchingPair } from '~/modules/teacher/types'
import TestSummary from './TestSummary'
import TestHeader from './TestHeader'
import TestFooter from './TestFooter'
import MultipleChoiceBlock from './MultipleChoiceBlock'
import FillBlankBlock from './FillBlankBlock'
import MatchingBlock from './MatchingBlock'
import ReorderBlock from './ReorderBlock'

function initializeReorderState(blocks: TestBlock[], initialAnswers: Record<string, string | number>) {
  const wordsMap: Record<string, string[]> = {}
  const initSelections: Record<string, number[]> = {}

  blocks.forEach(block => {
    if (block.type === 'reorder' && block.content?.questions) {
      block.content.questions.forEach(q => {
        let words = (q.words && q.words.length > 0) ? q.words : []
        if (words.length === 0 && q.sentence) {
          const raw = q.sentence.trim().split(/\s+/).filter(Boolean)
          const shuffled = [...raw]
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
          }
          words = shuffled
        }
        wordsMap[q.id] = words

        const ans = initialAnswers[q.id]
        if (typeof ans === 'string' && ans.trim()) {
          const ansWords = ans.trim().split(/\s+/)
          const used = new Set<number>()
          const indices: number[] = []
          ansWords.forEach(aw => {
            const foundIdx = words.findIndex((w, i) => w.toLowerCase() === aw.toLowerCase() && !used.has(i))
            if (foundIdx !== -1) {
              used.add(foundIdx)
              indices.push(foundIdx)
            }
          })
          initSelections[q.id] = indices
        }
      })
    }
  })

  return { wordsMap, initSelections }
}

export default function TestView({ testData, unitId, onClose, initialResult, onTestComplete, isRetake }: TestViewProps) {
  const router = useRouter()
  const params = useParams()
  const classId = params.classId as string

  // Support both old TestContent (blocks) and new ExamData (content) shape
  const rawBlocks: TestBlock[] = ('content' in testData ? testData.content : testData.blocks) || []

  const [isReviewMode, setIsReviewMode] = useState<boolean>(!isRetake && !!initialResult && !!initialResult.completedAt)
  const [isRetaking, setIsRetaking] = useState(false)

  const [currentBlocks, setCurrentBlocks] = useState<TestBlock[]>(() => {
    if (testData.isRetakable && (isRetake || !(initialResult && initialResult.completedAt))) {
      return shuffleRetakableExam(rawBlocks)
    }
    return rawBlocks
  })

  const [answers, setAnswers] = useState<Record<string, string | number>>(() => {
    if (isRetake || !(initialResult && initialResult.completedAt)) {
      return {}
    }
    return initialResult?.answers || {}
  })
  
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!isRetake && initialResult && initialResult.completedAt) return testData.duration * 60
    if (!isRetake && initialResult?.startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(initialResult.startedAt).getTime()) / 1000)
      const remaining = testData.duration * 60 - elapsed
      return remaining > 0 ? remaining : 0
    }
    return testData.duration * 60
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<TestResultPayload | null>(
    !isRetake && initialResult?.completedAt ? initialResult : null
  )
  const [showSummary, setShowSummary] = useState(!isRetake && !!(initialResult?.completedAt))

  const isMiniChallenge = testData.duration <= 15
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

  // Matching states
  const [selectedMatchingRight, setSelectedMatchingRight] = useState<MatchingSelection | null>(null)
  const [selectedMatchingSlot, setSelectedMatchingSlot] = useState<MatchingSlotSelection | null>(null)
  const [dragOverMatchingSlot, setDragOverMatchingSlot] = useState<string | null>(null)
  const [draggedMatchingRight, setDraggedMatchingRight] = useState<MatchingSelection | null>(null)

  // Reorder states: initialized once based on initial test blocks & answers
  const [shuffledWordsMap, setShuffledWordsMap] = useState<Record<string, string[]>>(() => {
    return initializeReorderState(currentBlocks, answers).wordsMap
  })
  const [reorderSelections, setReorderSelections] = useState<Record<string, number[]>>(() => {
    return initializeReorderState(currentBlocks, answers).initSelections
  })
  const [draggedReorderWord, setDraggedReorderWord] = useState<DraggedReorderWord | null>(null)
  const [dragOverReorderZone, setDragOverReorderZone] = useState<string | null>(null)
  const [dragOverReorderPos, setDragOverReorderPos] = useState<number | null>(null)

  // --- ANSWER HANDLER ---
  const handleAnswer = (questionId: string, value: string | number) => {
    if (result || isReviewMode) return
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  // --- MATCHING HANDLERS ---
  const assignMatchingPair = (blockId: string, leftId: string, rightId: string, pairs: MatchingPair[]) => {
    if (result || isReviewMode) return
    const updatedAnswers = { ...answers }
    pairs.forEach(p => {
      const k = `${blockId}_${p.id}`
      if (updatedAnswers[k] === rightId) {
        delete updatedAnswers[k]
      }
    })
    updatedAnswers[`${blockId}_${leftId}`] = rightId
    setAnswers(updatedAnswers)
    setSelectedMatchingRight(null)
    setSelectedMatchingSlot(null)
    setDragOverMatchingSlot(null)
    setDraggedMatchingRight(null)
  }

  const handleMatchingSlotClick = (blockId: string, leftId: string, pairs: MatchingPair[]) => {
    if (result || isReviewMode) return
    if (selectedMatchingRight && selectedMatchingRight.blockId === blockId) {
      assignMatchingPair(blockId, leftId, selectedMatchingRight.rightId, pairs)
      return
    }
    const currentMatched = answers[`${blockId}_${leftId}`]
    if (currentMatched) {
      handleUnmatch(blockId, leftId)
      return
    }
    if (selectedMatchingSlot?.blockId === blockId && selectedMatchingSlot?.leftId === leftId) {
      setSelectedMatchingSlot(null)
    } else {
      setSelectedMatchingSlot({ blockId, leftId })
    }
  }

  const handleMatchingBankItemClick = (blockId: string, rightItem: { id: string; text: string }, pairs: MatchingPair[], isUsed: boolean) => {
    if (result || isReviewMode) return
    if (isUsed) {
      const matchedPair = pairs.find(p => answers[`${blockId}_${p.id}`] === rightItem.id)
      if (matchedPair) {
        handleUnmatch(blockId, matchedPair.id)
      }
      return
    }
    if (selectedMatchingSlot && selectedMatchingSlot.blockId === blockId) {
      assignMatchingPair(blockId, selectedMatchingSlot.leftId, rightItem.id, pairs)
      return
    }
    if (selectedMatchingRight?.blockId === blockId && selectedMatchingRight?.rightId === rightItem.id) {
      setSelectedMatchingRight(null)
    } else {
      setSelectedMatchingRight({ blockId, rightId: rightItem.id })
    }
  }

  const handleUnmatch = (blockId: string, leftId: string) => {
    if (result || isReviewMode) return
    const answerKey = `${blockId}_${leftId}`
    const updatedAnswers = { ...answers }
    delete updatedAnswers[answerKey]
    setAnswers(updatedAnswers)
    if (selectedMatchingSlot?.leftId === leftId) {
      setSelectedMatchingSlot(null)
    }
  }

  const handleDragStartMatchingRight = (e: React.DragEvent, blockId: string, rightId: string) => {
    if (result || isReviewMode) return
    setDraggedMatchingRight({ blockId, rightId })
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'matching_right', blockId, rightId }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropMatchingSlot = (e: React.DragEvent, blockId: string, leftId: string, pairs: MatchingPair[]) => {
    e.preventDefault()
    setDragOverMatchingSlot(null)
    if (result || isReviewMode) return

    let rightId = draggedMatchingRight?.rightId
    try {
      const dataStr = e.dataTransfer.getData('application/json')
      if (dataStr) {
        const parsed = JSON.parse(dataStr)
        if (parsed.type === 'matching_right' && parsed.blockId === blockId) {
          rightId = parsed.rightId
        }
      }
    } catch {}

    if (rightId) {
      assignMatchingPair(blockId, leftId, rightId, pairs)
    }
  }

  // --- REORDER HANDLERS ---
  const handleSelectWord = (questionId: string, wordIdx: number, words: string[]) => {
    if (result || isReviewMode) return
    const currentIndices = reorderSelections[questionId] || []
    if (currentIndices.includes(wordIdx)) return
    const newIndices = [...currentIndices, wordIdx]
    setReorderSelections(prev => ({ ...prev, [questionId]: newIndices }))
    const assembled = newIndices.map(i => words[i]).join(' ')
    handleAnswer(questionId, assembled)
  }

  const handleRemoveWord = (questionId: string, positionInSentence: number, words: string[]) => {
    if (result || isReviewMode) return
    const currentIndices = reorderSelections[questionId] || []
    const newIndices = [...currentIndices]
    newIndices.splice(positionInSentence, 1)
    setReorderSelections(prev => ({ ...prev, [questionId]: newIndices }))
    const assembled = newIndices.map(i => words[i]).join(' ')
    handleAnswer(questionId, assembled)
  }

  const handleResetReorder = (questionId: string) => {
    if (result || isReviewMode) return
    setReorderSelections(prev => ({ ...prev, [questionId]: [] }))
    handleAnswer(questionId, '')
  }

  const handleDragStartBankWord = (e: React.DragEvent, questionId: string, wordIdx: number) => {
    if (result || isReviewMode) return
    setDraggedReorderWord({ questionId, wordIdx, fromSentence: false })
    e.dataTransfer.setData('application/json', JSON.stringify({ questionId, wordIdx, fromSentence: false }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragStartSentenceWord = (e: React.DragEvent, questionId: string, wordIdx: number, sentencePos: number) => {
    if (result || isReviewMode) return
    setDraggedReorderWord({ questionId, wordIdx, fromSentence: true, sentencePos })
    e.dataTransfer.setData('application/json', JSON.stringify({ questionId, wordIdx, fromSentence: true, sentencePos }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropOnSentenceSlot = (e: React.DragEvent, questionId: string, words: string[], targetPos?: number) => {
    e.preventDefault()
    setDragOverReorderZone(null)
    setDragOverReorderPos(null)
    if (result || isReviewMode) return

    let dragData = draggedReorderWord
    try {
      const dataStr = e.dataTransfer.getData('application/json')
      if (dataStr) {
        const parsed = JSON.parse(dataStr)
        if (parsed.questionId === questionId) {
          dragData = parsed
        }
      }
    } catch {}

    if (!dragData || dragData.questionId !== questionId) return

    const currentIndices = reorderSelections[questionId] || []

    if (dragData.fromSentence && typeof dragData.sentencePos === 'number') {
      const fromPos = dragData.sentencePos
      const toPos = typeof targetPos === 'number' ? targetPos : currentIndices.length - 1
      if (fromPos === toPos) return
      const newIndices = [...currentIndices]
      const [movedItem] = newIndices.splice(fromPos, 1)
      newIndices.splice(toPos, 0, movedItem)
      setReorderSelections(prev => ({ ...prev, [questionId]: newIndices }))
      const assembled = newIndices.map(i => words[i]).join(' ')
      handleAnswer(questionId, assembled)
    } else {
      const wordIdx = dragData.wordIdx
      if (currentIndices.includes(wordIdx)) return
      const newIndices = [...currentIndices]
      if (typeof targetPos === 'number') {
        newIndices.splice(targetPos, 0, wordIdx)
      } else {
        newIndices.push(wordIdx)
      }
      setReorderSelections(prev => ({ ...prev, [questionId]: newIndices }))
      const assembled = newIndices.map(i => words[i]).join(' ')
      handleAnswer(questionId, assembled)
    }

    setDraggedReorderWord(null)
  }

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
  }, [isSubmitting, result, isReviewMode, onTestComplete, classId, unitId, testData.id, answers, router, sessionKey])

  // --- TIMER & BEFOREUNLOAD / PAGEHIDE BEACON ---
  useEffect(() => {
    if (isReviewMode) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasSubmittedRef.current || isReviewMode || result) return
      e.preventDefault()
      e.returnValue = '' // Shows browser's native warning dialog
    }

    const handlePageHide = () => {
      if (hasSubmittedRef.current || isReviewMode || result) return
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
        answers: answersRef.current,
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

    if (timeLeft <= 0) {
      if (!isSubmitting && !result) {
        setTimeout(() => {
          handleSubmit()
        }, 0)
      }
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        window.removeEventListener('pagehide', handlePageHide)
      }
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => {
      clearInterval(timer)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [timeLeft, isSubmitting, result, handleSubmit, isReviewMode, classId, unitId, testData.id, sessionKey])

  // --- RETAKE ---
  const handleRetake = async () => {
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

      const sourceBlocks = ('content' in testData ? testData.content : testData.blocks) || []
      const shuffled = shuffleRetakableExam(sourceBlocks)
      const { wordsMap: nextWordsMap, initSelections: nextSelections } = initializeReorderState(shuffled, {})

      setCurrentBlocks(shuffled)
      setShuffledWordsMap(nextWordsMap)
      setReorderSelections(nextSelections)
      setAnswers({})
      setTimeLeft(testData.duration * 60)
      setResult(null)
      setShowSummary(false)
      setIsReviewMode(false)
      hasSubmittedRef.current = false
      setSelectedMatchingRight(null)
      setSelectedMatchingSlot(null)
      setReorderSelections({})
    } catch (e) {
      console.error(e)
      alert('Không thể khởi tạo lượt làm lại. Vui lòng thử lại.')
    } finally {
      setIsRetaking(false)
    }
  }

  // --- RENDER ---
  if (result && showSummary) {
    return (
      <TestSummary
        result={result}
        isRetakable={testData.isRetakable}
        isRetaking={isRetaking}
        onRetake={handleRetake}
        onViewDetail={() => setShowSummary(false)}
        onClose={onClose}
      />
    )
  }

  return (
    <div className={`max-w-[620px] mx-auto flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden border ${isMiniChallenge ? 'border-orange-200 shadow-orange-100/50' : 'border-gray-200'}`}>
      
      <TestHeader
        title={testData.title}
        isMiniChallenge={isMiniChallenge}
        isReviewMode={isReviewMode}
        timeLeft={timeLeft}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 bg-[#f8f9fa] relative">
        <div className="max-w-xl mx-auto space-y-3.5">
          {currentBlocks.map((block: TestBlock, index: number) => (
            <div key={block.id} className={`bg-white rounded-xl shadow-xs border p-3 sm:p-3.5 transition-transform ${
              isMiniChallenge ? 'border-orange-200 hover:shadow-orange-100/50' : 'border-gray-200 hover:shadow-sm'
            }`}>
              <div className="mb-2.5 flex items-center gap-2 border-b border-gray-100 pb-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs shadow-2xs ${
                  isMiniChallenge ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {index + 1}
                </div>
                <h3 className={`text-sm sm:text-base font-bold ${isMiniChallenge ? 'text-orange-900' : 'text-gray-800'}`}>
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

              {block.type === 'matching' && (() => {
                const pairs = block.content?.pairs || []
                const rightItems = block.content?.shuffledRight || pairs.map(p => ({ id: p.id, text: p.right || '' }))

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
          ))}
        </div>
      </div>

      <TestFooter
        isReviewMode={isReviewMode}
        isMiniChallenge={isMiniChallenge}
        isSubmitting={isSubmitting}
        isRetakable={testData.isRetakable}
        isRetaking={isRetaking}
        onSubmit={handleSubmit}
        onRetake={handleRetake}
        onClose={onClose}
      />
    </div>
  )
}
