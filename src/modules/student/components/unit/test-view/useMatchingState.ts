'use client'

import { useState } from 'react'
import type { MatchingPair } from '~/modules/teacher/types'
import type { MatchingSelection, MatchingSlotSelection } from './types'

type UseMatchingStateParams = {
  answers: Record<string, string | number>
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string | number>>>
  isReviewMode: boolean
  hasResult: boolean
}

export function useMatchingState({
  answers,
  setAnswers,
  isReviewMode,
  hasResult,
}: UseMatchingStateParams) {
  const [selectedMatchingRight, setSelectedMatchingRight] = useState<MatchingSelection | null>(null)
  const [selectedMatchingSlot, setSelectedMatchingSlot] = useState<MatchingSlotSelection | null>(null)
  const [dragOverMatchingSlot, setDragOverMatchingSlot] = useState<string | null>(null)
  const [draggedMatchingRight, setDraggedMatchingRight] = useState<MatchingSelection | null>(null)

  const assignMatchingPair = (
    blockId: string,
    leftId: string,
    rightId: string,
    pairs: MatchingPair[],
  ) => {
    if (hasResult || isReviewMode) return
    const updatedAnswers = { ...answers }
    pairs.forEach((p) => {
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

  const handleMatchingSlotClick = (
    blockId: string,
    leftId: string,
    pairs: MatchingPair[],
  ) => {
    if (hasResult || isReviewMode) return
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

  const handleMatchingBankItemClick = (
    blockId: string,
    rightItem: { id: string; text: string },
    pairs: MatchingPair[],
    isUsed: boolean,
  ) => {
    if (hasResult || isReviewMode) return
    if (isUsed) {
      const matchedPair = pairs.find((p) => answers[`${blockId}_${p.id}`] === rightItem.id)
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
    if (hasResult || isReviewMode) return
    const answerKey = `${blockId}_${leftId}`
    const updatedAnswers = { ...answers }
    delete updatedAnswers[answerKey]
    setAnswers(updatedAnswers)
    if (selectedMatchingSlot?.leftId === leftId) {
      setSelectedMatchingSlot(null)
    }
  }

  const handleDragStartMatchingRight = (
    e: React.DragEvent,
    blockId: string,
    rightId: string,
  ) => {
    if (hasResult || isReviewMode) return
    setDraggedMatchingRight({ blockId, rightId })
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'matching_right', blockId, rightId }),
    )
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropMatchingSlot = (
    e: React.DragEvent,
    blockId: string,
    leftId: string,
    pairs: MatchingPair[],
  ) => {
    e.preventDefault()
    setDragOverMatchingSlot(null)
    if (hasResult || isReviewMode) return

    let rightId = draggedMatchingRight?.rightId
    try {
      const dataStr = e.dataTransfer.getData('application/json')
      if (dataStr) {
        const parsed = JSON.parse(dataStr)
        if (parsed.type === 'matching_right' && parsed.blockId === blockId) {
          rightId = parsed.rightId
        }
      }
    } catch {
      // Ignore invalid JSON
    }

    if (rightId) {
      assignMatchingPair(blockId, leftId, rightId, pairs)
    }
  }

  const resetMatching = () => {
    setSelectedMatchingRight(null)
    setSelectedMatchingSlot(null)
    setDragOverMatchingSlot(null)
    setDraggedMatchingRight(null)
  }

  return {
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
  }
}
