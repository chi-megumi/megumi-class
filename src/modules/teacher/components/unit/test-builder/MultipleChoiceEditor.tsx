'use client'

import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { TestBlock, TestQuestion } from '@/modules/teacher/types'

type MultipleChoiceEditorProps = {
  block: TestBlock
  isMiniChallenge: boolean
  onUpdateContent: (newContent: TestBlock['content']) => void
  onAddQuestion: () => void
}

export default function MultipleChoiceEditor({
  block,
  isMiniChallenge,
  onUpdateContent,
  onAddQuestion,
}: MultipleChoiceEditorProps) {
  const questions = block.content?.questions || []

  return (
    <div className="space-y-6">
      <div
        className={`grid gap-6 ${
          isMiniChallenge || questions.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {questions.map((q: TestQuestion, qIndex: number) => (
          <div
            key={q.id}
            className={`flex gap-4 items-start p-4 rounded-xl border relative group/q ${
              isMiniChallenge
                ? 'bg-gradient-to-br from-orange-50/30 to-pink-50/30 border-orange-100'
                : 'bg-gray-50/50 border-gray-100'
            }`}
          >
            <div
              className={`font-bold text-lg mt-2 flex items-center justify-center shrink-0 ${
                isMiniChallenge
                  ? 'w-10 h-10 rounded-full bg-orange-100 text-orange-600 border border-orange-200'
                  : 'text-indigo-600'
              }`}
            >
              {qIndex + 1}
              {!isMiniChallenge && '.'}
            </div>
            <div className="flex-1 space-y-4">
              <input
                type="text"
                value={q.text}
                onChange={(e) => {
                  const newQs = [...questions]
                  newQs[qIndex].text = e.target.value
                  onUpdateContent({ ...block.content, questions: newQs })
                }}
                placeholder="Nhập câu hỏi (VD: What ___ your name?)"
                className={`w-full text-lg font-medium border-b-2 focus:outline-none pb-2 bg-transparent transition-colors ${
                  isMiniChallenge
                    ? 'text-orange-900 border-orange-100 focus:border-orange-400 placeholder:text-orange-300'
                    : 'text-gray-800 border-gray-100 focus:border-indigo-400'
                }`}
              />
              {/* Options Mode & Presets */}
              {(() => {
                const curOptions =
                  Array.isArray(q.options) && q.options.length > 0
                    ? q.options
                    : ['', '', '', '']
                const isTwoOptions = curOptions.length <= 2
                const displayedLetters = isTwoOptions ? ['A', 'B'] : ['A', 'B', 'C', 'D']

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400 font-medium text-[11px]">Số đáp án:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newQs = [...questions]
                            const baseOpts = newQs[qIndex].options || []
                            newQs[qIndex].options = [
                              baseOpts[0] || '',
                              baseOpts[1] || '',
                              baseOpts[2] || '',
                              baseOpts[3] || '',
                            ]
                            onUpdateContent({ ...block.content, questions: newQs })
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                            !isTwoOptions
                              ? isMiniChallenge
                                ? 'bg-orange-600 text-white shadow-xs'
                                : 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          4 đáp án (A-D)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newQs = [...questions]
                            const baseOpts = newQs[qIndex].options || []
                            newQs[qIndex].options = [baseOpts[0] || '', baseOpts[1] || '']
                            if ((newQs[qIndex].correctIndex ?? 0) >= 2) {
                              newQs[qIndex].correctIndex = 0
                            }
                            onUpdateContent({ ...block.content, questions: newQs })
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                            isTwoOptions
                              ? isMiniChallenge
                                ? 'bg-orange-600 text-white shadow-xs'
                                : 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          2 đáp án (A, B)
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const newQs = [...questions]
                            newQs[qIndex].options = ['True', 'False']
                            if ((newQs[qIndex].correctIndex ?? 0) >= 2) {
                              newQs[qIndex].correctIndex = 0
                            }
                            onUpdateContent({ ...block.content, questions: newQs })
                          }}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                          title="Điền nhanh True / False"
                        >
                          ⚡ True / False
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newQs = [...questions]
                            newQs[qIndex].options = ['Đúng', 'Sai']
                            if ((newQs[qIndex].correctIndex ?? 0) >= 2) {
                              newQs[qIndex].correctIndex = 0
                            }
                            onUpdateContent({ ...block.content, questions: newQs })
                          }}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title="Điền nhanh Đúng / Sai"
                        >
                          ⚡ Đúng / Sai
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {displayedLetters.map((opt, oIdx) => (
                        <div
                          key={opt}
                          className={`flex items-center gap-3 bg-white rounded-xl p-2.5 border focus-within:shadow-sm transition-all ${
                            q.correctIndex === oIdx
                              ? isMiniChallenge
                                ? 'border-orange-400 bg-orange-50'
                                : 'border-green-300 bg-green-50/30'
                              : isMiniChallenge
                                ? 'border-orange-100 hover:border-orange-300 focus-within:border-orange-400'
                                : 'border-gray-100 focus-within:border-indigo-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctIndex === oIdx}
                            onChange={() => {
                              const newQs = [...questions]
                              newQs[qIndex].correctIndex = oIdx
                              onUpdateContent({ ...block.content, questions: newQs })
                            }}
                            className={`w-5 h-5 ${
                              isMiniChallenge
                                ? 'text-orange-500 focus:ring-orange-500'
                                : 'text-indigo-600 focus:ring-indigo-500'
                            }`}
                          />
                          <span
                            className={`font-bold w-5 ${
                              isMiniChallenge ? 'text-orange-400' : 'text-gray-500'
                            }`}
                          >
                            {opt}.
                          </span>
                          <input
                            type="text"
                            value={q.options?.[oIdx] ?? ''}
                            onChange={(e) => {
                              const newQs = [...questions]
                              const existingOptions = [
                                ...(newQs[qIndex].options ||
                                  (isTwoOptions ? ['', ''] : ['', '', '', ''])),
                              ]
                              while (existingOptions.length < displayedLetters.length) {
                                existingOptions.push('')
                              }
                              existingOptions[oIdx] = e.target.value
                              newQs[qIndex].options = existingOptions
                              onUpdateContent({ ...block.content, questions: newQs })
                            }}
                            placeholder={`Lựa chọn ${opt}`}
                            className={`flex-1 bg-transparent focus:outline-none ${
                              isMiniChallenge ? 'text-orange-800' : 'text-gray-700'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
            {questions.length > 1 && (
              <button
                className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/q:opacity-100"
                onClick={() => {
                  const newQuestions = [...questions]
                  newQuestions.splice(qIndex, 1)
                  onUpdateContent({ ...block.content, questions: newQuestions })
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={onAddQuestion}
          className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors border border-dashed ${
            isMiniChallenge
              ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 shadow-sm'
              : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
          }`}
        >
          <Plus size={18} /> Thêm câu hỏi
        </button>
      </div>
    </div>
  )
}
