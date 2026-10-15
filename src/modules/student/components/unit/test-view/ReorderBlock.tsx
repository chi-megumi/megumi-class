import React from 'react'
import { CheckCircle2, X, RotateCcw } from 'lucide-react'
import type { TestQuestion } from '~/modules/teacher/types'
import type { TestResultPayload } from '@/actions/analytics/types'
import { normalizeSentence } from './constants'

type ReorderBlockProps = {
  questions: TestQuestion[]
  answers: Record<string, string | number>
  isReviewMode: boolean
  result: TestResultPayload | null
  shuffledWordsMap: Record<string, string[]>
  reorderSelections: Record<string, number[]>
  dragOverReorderZone: string | null
  dragOverReorderPos: number | null
  onSelectWord: (questionId: string, wordIdx: number, words: string[]) => void
  onRemoveWord: (questionId: string, positionInSentence: number, words: string[]) => void
  onResetReorder: (questionId: string) => void
  onDragStartBankWord: (e: React.DragEvent, questionId: string, wordIdx: number) => void
  onDragStartSentenceWord: (e: React.DragEvent, questionId: string, wordIdx: number, sentencePos: number) => void
  onDropOnSentenceSlot: (e: React.DragEvent, questionId: string, words: string[], targetPos?: number) => void
  onDragOverZone: (questionId: string) => void
  onDragLeaveZone: () => void
  onDragOverPos: (pos: number) => void
}

export default function ReorderBlock({
  questions, answers, isReviewMode, result,
  shuffledWordsMap, reorderSelections,
  dragOverReorderZone, dragOverReorderPos,
  onSelectWord, onRemoveWord, onResetReorder,
  onDragStartBankWord, onDragStartSentenceWord, onDropOnSentenceSlot,
  onDragOverZone, onDragLeaveZone, onDragOverPos,
}: ReorderBlockProps) {
  return (
    <div className="space-y-4">
      {(questions || []).map((q: TestQuestion, qIdx: number) => {
        const words = shuffledWordsMap[q.id] || (q.words && q.words.length > 0 ? q.words : (q.sentence || '').trim().split(/\s+/).filter(Boolean))
        const selectedIndices = reorderSelections[q.id] || []
        const studentSentence = answers[q.id] ? String(answers[q.id]) : ''
        const hasDetail = result?.correctAnswersDetail !== undefined
        const correctSentence = String(result?.correctAnswersDetail?.[q.id] || q.sentence || '')
        const isCorrect = normalizeSentence(studentSentence) === normalizeSentence(correctSentence)
        const showCorrect = isReviewMode && hasDetail && isCorrect
        const showIncorrect = isReviewMode && hasDetail && !isCorrect

        return (
          <div 
            key={q.id}
            className={`p-3 sm:p-3.5 rounded-lg border transition-all ${
              showCorrect 
                ? 'border-green-300 bg-green-50/40' 
                : showIncorrect 
                  ? 'border-red-300 bg-red-50/40' 
                  : 'border-gray-200 bg-white shadow-2xs'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-start gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                  showCorrect ? 'bg-green-100 text-green-700' : showIncorrect ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  {qIdx + 1}
                </span>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">
                    {q.text || 'Sắp xếp các từ sau thành câu hoàn chỉnh:'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Kéo thả từ lên ô câu, hoặc chạm từng từ theo thứ tự để ghép.
                  </p>
                </div>
              </div>

              {!isReviewMode && selectedIndices.length > 0 && (
                <button
                  type="button"
                  onClick={() => onResetReorder(q.id)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 px-1.5 py-0.5 rounded border border-gray-200 transition-colors shrink-0"
                  title="Xóa làm lại câu này"
                >
                  <RotateCcw size={11} /> Làm lại
                </button>
              )}
            </div>

            {/* Sentence Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                onDragOverZone(q.id)
              }}
              onDragLeave={() => onDragLeaveZone()}
              onDrop={(e) => onDropOnSentenceSlot(e, q.id, words)}
              className={`p-2 rounded-lg border-2 min-h-[42px] flex flex-wrap items-center gap-1.5 transition-all mb-2 ${
                showCorrect
                  ? 'border-green-400 bg-white'
                  : showIncorrect
                    ? 'border-red-400 bg-white'
                    : dragOverReorderZone === q.id
                      ? 'border-indigo-500 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-200'
                      : selectedIndices.length > 0
                        ? 'border-indigo-300 bg-indigo-50/30'
                        : 'border-dashed border-gray-300 bg-gray-50/50 hover:border-gray-400'
              }`}
            >
              {isReviewMode ? (
                <div className="w-full space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    {showCorrect ? (
                      <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                    ) : (
                      <X size={14} className="text-red-500 shrink-0" />
                    )}
                    <span className={`font-bold text-xs sm:text-sm ${showCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {studentSentence || '(Chưa làm)'}
                    </span>
                  </div>
                  {showIncorrect && (
                    <div className="text-[11px] text-green-700 font-semibold bg-green-100/80 p-1.5 rounded border border-green-200">
                      Đáp án đúng: <span className="font-bold">{correctSentence}</span>
                    </div>
                  )}
                </div>
              ) : selectedIndices.length === 0 ? (
                <span className="text-gray-400 text-[11px] italic select-none">
                  {dragOverReorderZone === q.id ? 'Thả từ vào đây...' : 'Kéo thả các từ vào đây hoặc chạm từ bên dưới...'}
                </span>
              ) : (
                selectedIndices.map((wordIdx, pos) => (
                  <div
                    key={`${wordIdx}-${pos}`}
                    draggable={true}
                    onDragStart={(e) => onDragStartSentenceWord(e, q.id, wordIdx, pos)}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onDragOverPos(pos)
                    }}
                    onDrop={(e) => {
                      e.stopPropagation()
                      onDropOnSentenceSlot(e, q.id, words, pos)
                    }}
                    onClick={() => onRemoveWord(q.id, pos, words)}
                    className={`px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md text-[11px] shadow-2xs transition-all flex items-center gap-1 cursor-grab active:cursor-grabbing group/chip select-none ${
                      dragOverReorderPos === pos ? 'ring-1 ring-amber-300 scale-105' : ''
                    }`}
                    title="Kéo để đổi vị trí, hoặc chạm để trả về kho từ"
                  >
                    <span>{words[wordIdx]}</span>
                    <X size={11} className="opacity-70 group-hover/chip:opacity-100 shrink-0" />
                  </div>
                ))
              )}
            </div>

            {/* Word Bank Chips */}
            {!isReviewMode && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Kho từ (Kéo lên hoặc chạm để ghép câu):
                </span>
                <div className="flex flex-wrap gap-1">
                  {words.map((w, wIdx) => {
                    const isUsed = selectedIndices.includes(wIdx)
                    return (
                      <button
                        key={wIdx}
                        type="button"
                        disabled={isUsed}
                        draggable={!isUsed}
                        onDragStart={(e) => onDragStartBankWord(e, q.id, wIdx)}
                        onClick={() => onSelectWord(q.id, wIdx, words)}
                        className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all select-none ${
                          isUsed
                            ? 'bg-gray-100 text-gray-300 border border-transparent cursor-not-allowed scale-95 opacity-40'
                            : 'bg-white text-gray-800 border border-gray-200 shadow-2xs hover:border-indigo-400 hover:text-indigo-600 hover:-translate-y-0.5 active:translate-y-0 cursor-grab active:cursor-grabbing'
                        }`}
                        title={isUsed ? 'Đã dùng' : 'Kéo lên ô hoặc chạm để ghép'}
                      >
                        {w}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
