'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  Sparkles,
  Shuffle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  ArrowLeftRight,
} from 'lucide-react'
import type { TestBlock, TestQuestion } from '@/modules/teacher/types'
import {
  splitSentenceWords,
  shuffleReorderWords,
  isMultisetEqual,
  areWordsIdenticalToSentence,
} from '@/modules/teacher/utils/reorderUtils'

type ReorderEditorProps = {
  block: TestBlock
  isMiniChallenge: boolean
  onUpdateContent: (newContent: TestBlock['content']) => void
  onAddQuestion: () => void
}

export default function ReorderEditor({
  block,
  isMiniChallenge,
  onUpdateContent,
  onAddQuestion,
}: ReorderEditorProps) {
  const questions: TestQuestion[] = block.content?.questions || []

  // Track chip selected for click-to-swap: qIndex -> wordIndex
  const [selectedSwap, setSelectedSwap] = useState<Record<number, number | null>>({})
  // Track dragging: qIndex & wordIndex
  const [dragInfo, setDragInfo] = useState<{ qIndex: number; wIdx: number } | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<{ qIndex: number; wIdx: number } | null>(
    null
  )
  const initializedBlockIdRef = React.useRef<string | null>(null)

  // Auto-shuffle on initial load if questions lack words or are identical to sentence order
  useEffect(() => {
    if (initializedBlockIdRef.current === block.id) return
    initializedBlockIdRef.current = block.id

    let hasChanges = false
    const currentQuestions = block.content?.questions || []
    const newQs = currentQuestions.map((q) => {
      const raw = splitSentenceWords(q.sentence)
      if (raw.length <= 1) return q

      const isUnset =
        !q.words || q.words.length !== raw.length || !isMultisetEqual(q.words, raw)
      const isIdentical =
        q.words && q.words.length === raw.length && q.words.every((w, i) => w === raw[i])

      if (isUnset || isIdentical) {
        hasChanges = true
        return {
          ...q,
          words: shuffleReorderWords(raw),
        }
      }
      return q
    })

    if (hasChanges) {
      onUpdateContent({ ...block.content, questions: newQs })
    }
  }, [block.id, block.content, onUpdateContent])

  // Helper to get effective words for a question
  const getQuestionWords = (q: TestQuestion): string[] => {
    const raw = splitSentenceWords(q.sentence)
    if (raw.length <= 1) return raw
    if (q.words && q.words.length === raw.length && isMultisetEqual(q.words, raw)) {
      return q.words
    }
    return raw
  }

  // Handle sentence text editing
  const handleSentenceChange = (qIndex: number, newSentence: string) => {
    const newQs = [...questions]
    const newRaw = splitSentenceWords(newSentence)
    const oldWords = newQs[qIndex].words

    let newWords: string[]
    if (oldWords && isMultisetEqual(oldWords, newRaw)) {
      newWords = oldWords
    } else {
      newWords = shuffleReorderWords(newRaw)
    }

    newQs[qIndex] = {
      ...newQs[qIndex],
      sentence: newSentence,
      words: newWords,
    }
    onUpdateContent({ ...block.content, questions: newQs })
    setSelectedSwap((prev) => ({ ...prev, [qIndex]: null }))
  }

  // Re-shuffle words randomly (ensuring non-identical order)
  const handleShuffle = (qIndex: number) => {
    const q = questions[qIndex]
    const raw = splitSentenceWords(q.sentence)
    if (raw.length <= 1) return

    const shuffled = shuffleReorderWords(raw)
    const newQs = [...questions]
    newQs[qIndex] = {
      ...q,
      words: shuffled,
    }
    onUpdateContent({ ...block.content, questions: newQs })
    setSelectedSwap((prev) => ({ ...prev, [qIndex]: null }))
  }

  // Reset words back to original sentence order
  const handleResetToOriginal = (qIndex: number) => {
    const q = questions[qIndex]
    const raw = splitSentenceWords(q.sentence)
    const newQs = [...questions]
    newQs[qIndex] = {
      ...q,
      words: [...raw],
    }
    onUpdateContent({ ...block.content, questions: newQs })
    setSelectedSwap((prev) => ({ ...prev, [qIndex]: null }))
  }

  // Move word from one index to another (via arrows or drag-and-drop)
  const handleMoveWord = (qIndex: number, fromIdx: number, toIdx: number) => {
    const q = questions[qIndex]
    const currentWords = getQuestionWords(q)
    if (
      fromIdx < 0 ||
      fromIdx >= currentWords.length ||
      toIdx < 0 ||
      toIdx >= currentWords.length ||
      fromIdx === toIdx
    ) {
      return
    }

    const updated = [...currentWords]
    const [moved] = updated.splice(fromIdx, 1)
    updated.splice(toIdx, 0, moved)

    const newQs = [...questions]
    newQs[qIndex] = {
      ...q,
      words: updated,
    }
    onUpdateContent({ ...block.content, questions: newQs })
    setSelectedSwap((prev) => ({ ...prev, [qIndex]: null }))
  }

  // Swap two words at specified indices
  const handleSwapWords = (qIndex: number, idxA: number, idxB: number) => {
    const q = questions[qIndex]
    const currentWords = getQuestionWords(q)
    if (
      idxA < 0 ||
      idxA >= currentWords.length ||
      idxB < 0 ||
      idxB >= currentWords.length ||
      idxA === idxB
    ) {
      return
    }

    const updated = [...currentWords]
    ;[updated[idxA], updated[idxB]] = [updated[idxB], updated[idxA]]

    const newQs = [...questions]
    newQs[qIndex] = {
      ...q,
      words: updated,
    }
    onUpdateContent({ ...block.content, questions: newQs })
    setSelectedSwap((prev) => ({ ...prev, [qIndex]: null }))
  }

  // Click-to-swap interaction
  const handleChipClick = (qIndex: number, wIdx: number) => {
    const active = selectedSwap[qIndex]
    if (active === null || active === undefined) {
      setSelectedSwap((prev) => ({ ...prev, [qIndex]: wIdx }))
    } else if (active === wIdx) {
      setSelectedSwap((prev) => ({ ...prev, [qIndex]: null }))
    } else {
      handleSwapWords(qIndex, active, wIdx)
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (qIndex: number, wIdx: number, e: React.DragEvent) => {
    setDragInfo({ qIndex, wIdx })
    e.dataTransfer.setData('text/plain', String(wIdx))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (qIndex: number, wIdx: number, e: React.DragEvent) => {
    if (dragInfo && dragInfo.qIndex === qIndex) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      if (!dragOverTarget || dragOverTarget.qIndex !== qIndex || dragOverTarget.wIdx !== wIdx) {
        setDragOverTarget({ qIndex, wIdx })
      }
    }
  }

  const handleDrop = (qIndex: number, targetIdx: number, e: React.DragEvent) => {
    e.preventDefault()
    if (dragInfo && dragInfo.qIndex === qIndex && dragInfo.wIdx !== targetIdx) {
      handleMoveWord(qIndex, dragInfo.wIdx, targetIdx)
    }
    setDragInfo(null)
    setDragOverTarget(null)
  }

  const handleDragEnd = () => {
    setDragInfo(null)
    setDragOverTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-2">
        <span>
          Gõ câu tiếng Anh hoàn chỉnh. Hệ thống sẽ tự động tách các từ và xáo trộn vị trí. Giáo viên
          có thể kéo thả hoặc bấm nút để tùy chỉnh thứ tự từ theo ý muốn.
        </span>
        <span className="font-bold text-indigo-600">{questions.length} câu</span>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const rawWords = splitSentenceWords(q.sentence)
          const currentWords = getQuestionWords(q)
          const isIdentical = areWordsIdenticalToSentence(currentWords, q.sentence)
          const isSingleWord = rawWords.length <= 1
          const activeSwapIdx = selectedSwap[qIndex]

          return (
            <div
              key={q.id}
              className={`flex gap-4 items-start p-5 rounded-2xl border relative group/q transition-colors ${
                isMiniChallenge
                  ? 'bg-gradient-to-br from-orange-50/20 to-pink-50/20 border-orange-100'
                  : 'bg-gray-50/60 border-gray-100 hover:border-gray-200'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-2 ${
                  isMiniChallenge ? 'bg-orange-100 text-orange-700' : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                {qIndex + 1}
              </div>

              <div className="flex-1 space-y-4">
                {/* Prompt / Vietnamese meaning */}
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Gợi ý / Nghĩa tiếng Việt (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={q.text || ''}
                    onChange={(e) => {
                      const newQs = [...questions]
                      newQs[qIndex] = { ...newQs[qIndex], text: e.target.value }
                      onUpdateContent({ ...block.content, questions: newQs })
                    }}
                    placeholder="VD: Dịch sang tiếng Anh: Anh ấy quyết định từ bỏ chiếc xe cũ."
                    className={`w-full font-medium px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 ${
                      isMiniChallenge
                        ? 'border-orange-200 text-orange-950 focus:ring-orange-400/30'
                        : 'border-gray-200 text-gray-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                    }`}
                  />
                </div>

                {/* English Full Sentence */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">
                      Câu tiếng Anh hoàn chỉnh (Học sinh cần sắp xếp thành câu này) *
                    </label>
                    <span className="text-[11px] text-gray-400">{rawWords.length} từ</span>
                  </div>
                  <textarea
                    rows={2}
                    value={q.sentence || ''}
                    onChange={(e) => handleSentenceChange(qIndex, e.target.value)}
                    placeholder="VD: He decided to abandon the old car."
                    className={`w-full font-bold px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 resize-none ${
                      isMiniChallenge
                        ? 'border-orange-200 text-orange-950 focus:ring-orange-400/30'
                        : 'border-gray-200 text-gray-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                    }`}
                  />
                </div>

                {/* Interactive Word Chips Section */}
                {rawWords.length > 0 && (
                  <div className="p-3.5 bg-white/90 rounded-xl border border-gray-200/90 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <Sparkles size={14} className="text-indigo-600" />
                        <span>Thứ tự thẻ từ học sinh sẽ nhận:</span>
                      </div>

                      {/* Control buttons: Shuffle & Reset */}
                      {!isSingleWord && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleShuffle(qIndex)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors shadow-2xs"
                            title="Xáo trộn ngẫu nhiên vị trí các thẻ từ"
                          >
                            <Shuffle size={13} />
                            <span>Xáo trộn</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResetToOriginal(qIndex)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                            title="Đặt lại theo thứ tự câu hoàn chỉnh ban đầu"
                          >
                            <RotateCcw size={12} />
                            <span>Đặt về câu gốc</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Chips Display with Drag & Drop, Arrow Controls, and Click-to-swap */}
                    <div className="flex flex-wrap gap-2 pt-1 items-center">
                      {currentWords.map((w, wIdx) => {
                        const isSwapSource = activeSwapIdx === wIdx
                        const isDragTarget =
                          dragOverTarget?.qIndex === qIndex && dragOverTarget?.wIdx === wIdx

                        return (
                          <div
                            key={wIdx}
                            draggable={!isSingleWord}
                            onDragStart={(e) => handleDragStart(qIndex, wIdx, e)}
                            onDragOver={(e) => handleDragOver(qIndex, wIdx, e)}
                            onDrop={(e) => handleDrop(qIndex, wIdx, e)}
                            onDragEnd={handleDragEnd}
                            onClick={() => !isSingleWord && handleChipClick(qIndex, wIdx)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all select-none ${
                              isSingleWord ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
                            } ${
                              isSwapSource
                                ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-400/50 shadow-sm scale-105'
                                : isDragTarget
                                  ? 'bg-indigo-100 text-indigo-900 border-indigo-500 ring-2 ring-indigo-400/50 scale-105'
                                  : 'bg-indigo-50 text-indigo-800 border-indigo-200/80 hover:bg-indigo-100 hover:border-indigo-300 shadow-2xs'
                            }`}
                            title={
                              isSingleWord
                                ? undefined
                                : 'Kéo thả, bấm ‹ › hoặc bấm chọn 2 thẻ từ để hoán đổi vị trí'
                            }
                          >
                            {/* Left Arrow Button */}
                            {!isSingleWord && (
                              <button
                                type="button"
                                disabled={wIdx === 0}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMoveWord(qIndex, wIdx, wIdx - 1)
                                }}
                                className="w-4 h-4 rounded hover:bg-indigo-200/80 disabled:opacity-20 disabled:hover:bg-transparent flex items-center justify-center text-indigo-700 transition-colors cursor-pointer disabled:cursor-default"
                                title="Di chuyển sang trái"
                              >
                                <ChevronLeft size={13} />
                              </button>
                            )}

                            <span className="px-1 text-xs font-semibold">{w}</span>

                            {/* Right Arrow Button */}
                            {!isSingleWord && (
                              <button
                                type="button"
                                disabled={wIdx === currentWords.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMoveWord(qIndex, wIdx, wIdx + 1)
                                }}
                                className="w-4 h-4 rounded hover:bg-indigo-200/80 disabled:opacity-20 disabled:hover:bg-transparent flex items-center justify-center text-indigo-700 transition-colors cursor-pointer disabled:cursor-default"
                                title="Di chuyển sang phải"
                              >
                                <ChevronRight size={13} />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Status & Guidance alert */}
                    {!isSingleWord && (
                      <div className="pt-1">
                        {isIdentical ? (
                          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200">
                            <AlertCircle size={14} className="shrink-0 text-amber-600" />
                            <span>
                              <b>Cảnh báo:</b> Các từ đang theo đúng thứ tự câu hoàn chỉnh! Học sinh
                              sẽ nhìn thấy đáp án ngay. Hãy bấm <b>Xáo trộn</b> hoặc đổi vị trí từ.
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                              <Check size={13} className="text-emerald-600 shrink-0" />
                              Đã xáo trộn vị trí ({currentWords.length} thẻ từ)
                            </span>
                            <span className="hidden sm:inline-flex items-center gap-1 text-gray-400">
                              <ArrowLeftRight size={11} /> Kéo thả, bấm ‹ › hoặc chạm vào 2 thẻ từ
                              để hoán đổi vị trí
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delete button */}
              {questions.length > 1 && (
                <button
                  type="button"
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/q:opacity-100 mt-2"
                  onClick={() => {
                    const newQs = [...questions]
                    newQs.splice(qIndex, 1)
                    onUpdateContent({ ...block.content, questions: newQs })
                  }}
                  title="Xóa câu này"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onAddQuestion}
          className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors border border-dashed ${
            isMiniChallenge
              ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 shadow-sm'
              : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
          }`}
        >
          <Plus size={18} /> Thêm câu sắp xếp
        </button>
      </div>
    </div>
  )
}
