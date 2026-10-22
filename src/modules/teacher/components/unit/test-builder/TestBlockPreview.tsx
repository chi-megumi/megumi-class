'use client'

import React from 'react'
import type { TestBlock, TestQuestion } from '@/modules/teacher/types'
import { getActiveQuestionOptions } from '@/modules/teacher/utils/questionUtils'

type TestBlockPreviewProps = {
  block: TestBlock
  index: number
}

export default function TestBlockPreview({ block, index }: TestBlockPreviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="bg-indigo-50/50 px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-indigo-900">
          Phần {index + 1}: {(block.title || '').replace(/^Phần\s+\d+:\s*/i, '')}
        </h2>
      </div>
      <div className="p-6">
        {/* Multiple Choice Preview */}
        {block.type === 'multiple_choice' && (
          <div
            className={`grid gap-8 ${
              (block.content?.questions?.length ?? 0) > 1
                ? 'grid-cols-1 md:grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            {block.content?.questions?.map((q: TestQuestion, qIndex: number) => {
              const displayOptions = getActiveQuestionOptions(q.options)
              const isTwoOptions = displayOptions.length <= 2

              return (
                <div key={q.id} className="flex gap-4 items-start">
                  <span className="font-bold text-lg text-indigo-600 shrink-0">{qIndex + 1}.</span>
                  <div className="flex-1 space-y-4">
                    <p className="text-lg font-medium text-gray-800">{q.text || '...'}</p>
                    <div
                      className={`grid gap-2.5 ${
                        isTwoOptions ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                      }`}
                    >
                      {displayOptions.map((opt) => {
                        const oIdx = opt.index
                        const isCorrect = q.correctIndex === oIdx
                        return (
                          <div
                            key={opt.label}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                              isCorrect
                                ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-medium shadow-2xs'
                                : 'border-gray-100 bg-white text-gray-700'
                            }`}
                          >
                            <span className={`font-bold w-5 ${isCorrect ? 'text-emerald-700' : 'text-gray-500'}`}>
                              {opt.label}.
                            </span>
                            <span className="flex-1">{opt.text || '...'}</span>
                            {isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md shrink-0">
                                ✓ Đáp án đúng
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Fill Blank Preview */}
        {block.type === 'fill_blank' && (
          <div className="space-y-6">
            {(block.content?.questions && block.content.questions.length > 0
              ? block.content.questions
              : block.content?.text
                ? [{ id: block.id, text: block.content.text, answer: block.content.answer || '' }]
                : []
            ).map((q: TestQuestion, qIdx: number) => (
              <div key={q.id} className="flex gap-4 items-start">
                <span className="font-bold text-lg text-indigo-600 shrink-0">{qIdx + 1}.</span>
                <div className="flex-1 space-y-3">
                  <p className="text-lg font-medium text-gray-800 leading-relaxed">
                    {(q.text || '...')
                      .split('___')
                      .map((part: string, i: number, arr: string[]) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="mx-1 px-2.5 py-0.5 border-b-2 border-indigo-400 font-bold text-indigo-700 bg-indigo-50/70 rounded">
                              {q.answer || '_____'}
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                  </p>
                  {q.answer && (
                    <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                      <span>✓ Đáp án:</span> <b className="font-bold">{q.answer}</b>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Matching Preview */}
        {block.type === 'matching' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-medium">
              Các cặp ghép nối từ vựng (Cột A ↔ Cột B):
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-gray-50/70 border border-gray-200">
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <span>Cột A (Từ / Khái niệm)</span>
                </h4>
                {(block.content?.pairs || []).map((p, pIdx) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {pIdx + 1}
                    </span>
                    <span className="font-bold text-gray-800">
                      {p.left || `(Mục ${pIdx + 1})`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                  <span>Cột B (Nghĩa / Định nghĩa)</span>
                </h4>
                {(block.content?.pairs || []).map((p, pIdx) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + pIdx)}
                    </span>
                    <span className="font-semibold text-gray-700">
                      {p.right || `(Nghĩa ${pIdx + 1})`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reorder Preview */}
        {block.type === 'reorder' && (
          <div className="space-y-6">
            {(block.content?.questions || []).map((q, qIdx) => {
              const words = (q.sentence || '').trim().split(/\s+/).filter(Boolean)
              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600 text-sm">Câu {qIdx + 1}:</span>
                    <span className="text-gray-700 font-medium">
                      {q.text || 'Sắp xếp các từ sau thành câu hoàn chỉnh:'}
                    </span>
                  </div>
                  {q.sentence && (
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center gap-2">
                      <span className="text-emerald-600 font-bold shrink-0 text-xs uppercase tracking-wider">
                        ✓ Câu hoàn chỉnh:
                      </span>
                      <span>{q.sentence}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {words.length > 0 ? (
                      words.map((w, wIdx) => (
                        <span
                          key={wIdx}
                          className="px-3 py-1.5 bg-white text-gray-700 rounded-xl text-xs font-semibold border border-gray-200 shadow-2xs"
                        >
                          {w}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Chưa nhập câu</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {['reading', 'listening'].includes(block.type) && (
          <p className="text-gray-400 italic">
            Dạng bài này sẽ được hiển thị khi học sinh làm bài.
          </p>
        )}
      </div>
    </div>
  )
}
