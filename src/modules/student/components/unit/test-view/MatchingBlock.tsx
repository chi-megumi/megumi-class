import React from 'react'
import { CheckCircle2, X, ArrowRight, Link2, Sparkles } from 'lucide-react'
import type { MatchingPair } from '~/modules/teacher/types'
import type { TestResultPayload } from '@/actions/analytics/types'
import { MATCH_COLORS } from './constants'
import type { MatchingSelection, MatchingSlotSelection } from './types'

type MatchingBlockProps = {
  blockId: string
  pairs: MatchingPair[]
  shuffledRight: { id: string; text: string }[]
  answers: Record<string, string | number>
  isReviewMode: boolean
  result: TestResultPayload | null
  // Click-to-place state
  selectedMatchingRight: MatchingSelection | null
  selectedMatchingSlot: MatchingSlotSelection | null
  // Drag state
  dragOverMatchingSlot: string | null
  // Handlers
  onSlotClick: (blockId: string, leftId: string, pairs: MatchingPair[]) => void
  onBankItemClick: (blockId: string, rightItem: { id: string; text: string }, pairs: MatchingPair[], isUsed: boolean) => void
  onUnmatch: (blockId: string, leftId: string) => void
  onDragStartRight: (e: React.DragEvent, blockId: string, rightId: string) => void
  onDropSlot: (e: React.DragEvent, blockId: string, leftId: string, pairs: MatchingPair[]) => void
  onDragOverSlot: (leftId: string) => void
  onDragLeaveSlot: () => void
}

function MatchingReview({ blockId, pairs, shuffledRight, answers, result }: {
  blockId: string
  pairs: MatchingPair[]
  shuffledRight: { id: string; text: string }[]
  answers: Record<string, string | number>
  result: TestResultPayload | null
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-gray-500 mb-1">Kết quả ghép nối:</p>
      <div className="space-y-2">
        {pairs.map((p, pIdx) => {
          const answerKey = `${blockId}_${p.id}`
          const studentMatchedRightId = answers[answerKey]
          const studentMatchedItem = shuffledRight.find(r => r.id === studentMatchedRightId)
          const hasDetail = result?.correctAnswersDetail !== undefined
          const correctDetail = result?.correctAnswersDetail?.[answerKey]
          
          const isCorrect = studentMatchedRightId === p.id || (p.right && String(studentMatchedItem?.text || '').trim().toLowerCase() === String(p.right).trim().toLowerCase())
          const showCorrect = hasDetail && isCorrect
          const showIncorrect = hasDetail && !isCorrect

          return (
            <div 
              key={p.id}
              className={`p-2.5 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-2 ${
                showCorrect 
                  ? 'border-green-300 bg-green-50/60' 
                  : showIncorrect 
                    ? 'border-red-300 bg-red-50/60' 
                    : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                  showCorrect ? 'bg-green-100 text-green-700' : showIncorrect ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {pIdx + 1}
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Cột A</span>
                  <span className="font-bold text-gray-800 text-xs sm:text-sm">{p.left}</span>
                </div>
              </div>

              <div className="hidden md:flex items-center text-gray-400">
                <ArrowRight size={14} />
              </div>

              <div className="flex-1 md:max-w-md">
                <div className="flex items-center gap-1.5">
                  {showCorrect ? (
                    <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                  ) : (
                    <X size={14} className="text-red-500 shrink-0" />
                  )}
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 block">Bạn đã ghép:</span>
                    <span className={`font-bold text-xs ${showCorrect ? 'text-green-800' : 'text-red-800'}`}>
                      {studentMatchedItem ? studentMatchedItem.text : '(Chưa ghép)'}
                    </span>
                  </div>
                </div>
                {showIncorrect && (
                  <div className="mt-0.5 text-[10px] text-green-700 font-semibold bg-green-100/80 px-1.5 py-0.5 rounded inline-block">
                    Đáp án đúng: {String(correctDetail || p.right || '')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MatchingBlock({
  blockId, pairs, shuffledRight, answers, isReviewMode, result,
  selectedMatchingRight, selectedMatchingSlot,
  dragOverMatchingSlot,
  onSlotClick, onBankItemClick, onUnmatch,
  onDragStartRight, onDropSlot, onDragOverSlot, onDragLeaveSlot,
}: MatchingBlockProps) {
  if (isReviewMode) {
    return <MatchingReview blockId={blockId} pairs={pairs} shuffledRight={shuffledRight} answers={answers} result={result} />
  }

  const isRightSelected = !!selectedMatchingRight && selectedMatchingRight.blockId === blockId
  const isSlotSelected = !!selectedMatchingSlot && selectedMatchingSlot.blockId === blockId
  const totalMatched = pairs.filter(p => !!answers[`${blockId}_${p.id}`]).length

  return (
    <div className="space-y-3">
      {/* Instructions header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-600 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 p-2 sm:p-2.5 rounded-lg border border-indigo-100 gap-1.5 shadow-2xs">
        <div className="flex items-center gap-1.5 font-medium text-indigo-950 text-[11px]">
          <Sparkles size={13} className="text-indigo-600 shrink-0" />
          <span>
            <b>Cách làm:</b> Kéo thẻ từ <b>Kho đáp án ở dưới</b> vào ô ở <b>Cột bên phải</b>, hoặc <b>chạm 1 đáp án</b> rồi <b>chạm ô kết quả</b>.
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-[10px]">
            Đã ghép {totalMatched}/{pairs.length} cặp
          </span>
        </div>
      </div>

      {/* Main matching list */}
      <div className="space-y-2">
        {pairs.map((p, pIdx) => {
          const answerKey = `${blockId}_${p.id}`
          const matchedRightId = answers[answerKey]
          const matchedRightItem = shuffledRight.find(r => r.id === matchedRightId)
          const isTargetSlotActive = isSlotSelected && selectedMatchingSlot?.leftId === p.id
          const isDragOver = dragOverMatchingSlot === p.id
          const color = MATCH_COLORS[pIdx % MATCH_COLORS.length]

          return (
            <div
              key={p.id}
              className={`p-2.5 sm:p-3 rounded-lg border transition-all ${
                matchedRightItem
                  ? `${color.border} ${color.bg} shadow-2xs`
                  : isTargetSlotActive || isDragOver
                    ? 'border-indigo-500 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-200'
                    : isRightSelected
                      ? 'border-indigo-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {/* Left Column A */}
                <div className="flex items-center gap-2 sm:w-1/2 min-w-0">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                    matchedRightItem ? `${color.badge} text-white` : 'bg-gray-100 text-gray-700'
                  }`}>
                    {pIdx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">
                      Cột A
                    </span>
                    <span className="font-bold text-gray-900 text-xs sm:text-sm break-words">
                      {p.left}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center text-gray-300 shrink-0">
                  <ArrowRight size={14} />
                </div>

                {/* Right Column: Drop/Click Zone */}
                <div
                  onClick={() => onSlotClick(blockId, p.id, pairs)}
                  onDragOver={(e) => {
                    e.preventDefault()
                    onDragOverSlot(p.id)
                  }}
                  onDragLeave={() => onDragLeaveSlot()}
                  onDrop={(e) => onDropSlot(e, blockId, p.id, pairs)}
                  className={`flex-1 min-h-[36px] sm:min-h-[38px] rounded-md border-2 transition-colors flex items-center justify-between p-1.5 sm:p-2 cursor-pointer ${
                    matchedRightItem
                      ? 'border-white/80 bg-white shadow-2xs'
                      : isDragOver || isTargetSlotActive
                        ? 'border-dashed border-indigo-500 bg-indigo-100/70 shadow-inner'
                        : isRightSelected
                          ? 'border-dashed border-indigo-400 bg-indigo-50/40 animate-pulse hover:bg-indigo-50'
                          : 'border-dashed border-gray-200 bg-gray-50/80 hover:border-gray-300 hover:bg-gray-100/60'
                  }`}
                >
                  {matchedRightItem ? (
                    <div className="flex items-center justify-between w-full gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Link2 size={12} className={`${color.text} shrink-0`} />
                        <span className={`font-bold text-xs ${color.text} break-words`}>
                          {matchedRightItem.text}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onUnmatch(blockId, p.id)
                        }}
                        className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded transition-colors shrink-0"
                        title="Gỡ đáp án này (trả về kho)"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full text-[11px] text-gray-400 font-medium select-none text-center">
                      {isDragOver ? (
                        <span className="text-indigo-600 font-bold">Thả đáp án vào đây...</span>
                      ) : isTargetSlotActive ? (
                        <span className="text-indigo-600 font-bold animate-pulse">Chọn 1 đáp án ở kho dưới</span>
                      ) : isRightSelected ? (
                        <span className="text-indigo-600 font-bold">Chạm để gán đáp án</span>
                      ) : (
                        <span>Kéo thả hoặc chạm để gán</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Answer Bank */}
      <div className="pt-1">
        <div className="p-2.5 sm:p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <h4 className="font-bold text-[10px] uppercase tracking-wider text-purple-900">
                Kho đáp án (Cột B xáo trộn)
              </h4>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              Còn <b>{shuffledRight.length - totalMatched}</b>/{shuffledRight.length} thẻ
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {shuffledRight.map((r, rIdx) => {
              const matchedLeftPair = pairs.find(p => answers[`${blockId}_${p.id}`] === r.id)
              const isUsed = !!matchedLeftPair
              const isCurrentSelected = isRightSelected && selectedMatchingRight?.rightId === r.id

              return (
                <div
                  key={r.id || rIdx}
                  draggable={!isUsed}
                  onDragStart={(e) => onDragStartRight(e, blockId, r.id)}
                  onClick={() => onBankItemClick(blockId, r, pairs, isUsed)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors select-none flex items-center gap-1 ${
                    isUsed
                      ? 'bg-gray-200/60 text-gray-400 border border-transparent cursor-pointer line-through opacity-50 hover:opacity-80'
                      : isCurrentSelected
                        ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-300 border-indigo-600 scale-105 cursor-pointer'
                        : isSlotSelected
                          ? 'bg-white text-indigo-950 border border-indigo-300 shadow-2xs hover:border-indigo-500 hover:bg-indigo-50/60 cursor-pointer animate-pulse'
                          : 'bg-white text-gray-800 border border-gray-200 shadow-2xs hover:border-indigo-400 hover:text-indigo-600 hover:-translate-y-0.5 cursor-grab active:cursor-grabbing'
                  }`}
                  title={isUsed ? 'Đã ghép (chạm để gỡ về kho)' : 'Kéo thả hoặc chạm để gán vào ô'}
                >
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold ${
                    isCurrentSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {String.fromCharCode(65 + rIdx)}
                  </span>
                  <span>{r.text}</span>
                  {isUsed && (
                    <span className="text-[8px] bg-gray-300/80 text-gray-600 px-1 py-0.2 rounded no-underline">
                      Đã ghép
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(MatchingBlock)
