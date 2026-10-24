'use client'

import { useState } from 'react'
import type { TestBlock } from '~/modules/teacher/types'
import { ensureShuffledWords } from '@/modules/teacher/utils/reorderUtils'
import type { DraggedReorderWord } from './types'

export function initializeReorderState(
  blocks: TestBlock[],
  initialAnswers: Record<string, string | number>,
) {
  const wordsMap: Record<string, string[]> = {}
  const initSelections: Record<string, number[]> = {}

  blocks.forEach((block) => {
    if (block.type === 'reorder' && block.content?.questions) {
      block.content.questions.forEach((q) => {
        const words = ensureShuffledWords(q.sentence, q.words)
        wordsMap[q.id] = words

        const ans = initialAnswers[q.id]
        if (typeof ans === 'string' && ans.trim()) {
          const ansWords = ans.trim().split(/\s+/)
          const used = new Set<number>()
          const indices: number[] = []
          ansWords.forEach((aw) => {
            const foundIdx = words.findIndex(
              (w, i) => w.toLowerCase() === aw.toLowerCase() && !used.has(i),
            )
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

type UseReorderStateParams = {
  currentBlocks: TestBlock[]
  initialAnswers: Record<string, string | number>
  onAnswer: (questionId: string, value: string | number) => void
  isReviewMode: boolean
  hasResult: boolean
}

export function useReorderState({
  currentBlocks,
  initialAnswers,
  onAnswer,
  isReviewMode,
  hasResult,
}: UseReorderStateParams) {
  const [shuffledWordsMap, setShuffledWordsMap] = useState<Record<string, string[]>>(() => {
    return initializeReorderState(currentBlocks, initialAnswers).wordsMap
  })
  const [reorderSelections, setReorderSelections] = useState<Record<string, number[]>>(() => {
    return initializeReorderState(currentBlocks, initialAnswers).initSelections
  })
  const [draggedReorderWord, setDraggedReorderWord] = useState<DraggedReorderWord | null>(null)
  const [dragOverReorderZone, setDragOverReorderZone] = useState<string | null>(null)
  const [dragOverReorderPos, setDragOverReorderPos] = useState<number | null>(null)

  const handleSelectWord = (questionId: string, wordIdx: number, words: string[]) => {
    if (hasResult || isReviewMode) return
    const current = reorderSelections[questionId] || []
    if (current.includes(wordIdx)) return
    const updated = [...current, wordIdx]
    setReorderSelections((prev) => ({ ...prev, [questionId]: updated }))
    const assembled = updated.map((i) => words[i]).join(' ')
    onAnswer(questionId, assembled)
  }

  const handleRemoveWord = (questionId: string, positionInSentence: number, words: string[]) => {
    if (hasResult || isReviewMode) return
    const current = reorderSelections[questionId] || []
    const updated = current.filter((_, idx) => idx !== positionInSentence)
    setReorderSelections((prev) => ({ ...prev, [questionId]: updated }))
    const assembled = updated.map((i) => words[i]).join(' ')
    onAnswer(questionId, assembled)
  }

  const handleMoveWord = (
    questionId: string,
    fromPos: number,
    toPos: number,
    words: string[],
  ) => {
    if (hasResult || isReviewMode) return
    const current = reorderSelections[questionId] || []
    if (fromPos < 0 || fromPos >= current.length || toPos < 0 || toPos >= current.length) return
    const updated = [...current]
    const [moved] = updated.splice(fromPos, 1)
    updated.splice(toPos, 0, moved)
    setReorderSelections((prev) => ({ ...prev, [questionId]: updated }))
    const assembled = updated.map((i) => words[i]).join(' ')
    onAnswer(questionId, assembled)
  }

  const handleSwapWords = (
    questionId: string,
    posA: number,
    posB: number,
    words: string[],
  ) => {
    if (hasResult || isReviewMode) return
    const current = reorderSelections[questionId] || []
    if (posA < 0 || posA >= current.length || posB < 0 || posB >= current.length) return
    const updated = [...current]
    const temp = updated[posA]
    updated[posA] = updated[posB]
    updated[posB] = temp
    setReorderSelections((prev) => ({ ...prev, [questionId]: updated }))
    const assembled = updated.map((i) => words[i]).join(' ')
    onAnswer(questionId, assembled)
  }

  const handleResetReorder = (questionId: string) => {
    if (hasResult || isReviewMode) return
    setReorderSelections((prev) => ({ ...prev, [questionId]: [] }))
    onAnswer(questionId, '')
  }

  const handleDragStartBankWord = (
    e: React.DragEvent,
    questionId: string,
    wordIdx: number,
  ) => {
    if (hasResult || isReviewMode) return
    setDraggedReorderWord({ questionId, wordIdx, fromSentencePos: null })
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'reorder_bank', questionId, wordIdx }),
    )
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragStartSentenceWord = (
    e: React.DragEvent,
    questionId: string,
    wordIdx: number,
    sentencePos: number,
  ) => {
    if (hasResult || isReviewMode) return
    setDraggedReorderWord({ questionId, wordIdx, fromSentencePos: sentencePos })
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'reorder_sentence', questionId, wordIdx, sentencePos }),
    )
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropOnSentenceSlot = (
    e: React.DragEvent,
    questionId: string,
    words: string[],
    targetPos?: number,
  ) => {
    e.preventDefault()
    setDragOverReorderZone(null)
    setDragOverReorderPos(null)
    if (hasResult || isReviewMode) return

    let dragData = draggedReorderWord
    try {
      const dataStr = e.dataTransfer.getData('application/json')
      if (dataStr) {
        const parsed = JSON.parse(dataStr)
        if (parsed.questionId === questionId) {
          dragData = {
            questionId: parsed.questionId,
            wordIdx: parsed.wordIdx,
            fromSentencePos: parsed.sentencePos !== undefined ? parsed.sentencePos : null,
          }
        }
      }
    } catch {
      // Ignore invalid JSON
    }

    if (!dragData || dragData.questionId !== questionId) return

    const currentIndices = reorderSelections[questionId] || []

    if (
      dragData.fromSentencePos !== null &&
      dragData.fromSentencePos !== undefined
    ) {
      const fromPos = dragData.fromSentencePos
      const toPos = typeof targetPos === 'number' ? targetPos : currentIndices.length - 1
      if (fromPos === toPos) return
      const newIndices = [...currentIndices]
      const [moved] = newIndices.splice(fromPos, 1)
      newIndices.splice(toPos, 0, moved)
      setReorderSelections((prev) => ({ ...prev, [questionId]: newIndices }))
      const assembled = newIndices.map((i) => words[i]).join(' ')
      onAnswer(questionId, assembled)
    } else {
      const wordIdx = dragData.wordIdx
      if (currentIndices.includes(wordIdx)) return
      const newIndices = [...currentIndices]
      if (typeof targetPos === 'number') {
        newIndices.splice(targetPos, 0, wordIdx)
      } else {
        newIndices.push(wordIdx)
      }
      setReorderSelections((prev) => ({ ...prev, [questionId]: newIndices }))
      const assembled = newIndices.map((i) => words[i]).join(' ')
      onAnswer(questionId, assembled)
    }

    setDraggedReorderWord(null)
  }

  return {
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
  }
}
