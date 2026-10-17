'use client'

import React from 'react'
import type { TestBlock, TestQuestion } from '@/modules/teacher/types'

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
            {block.content?.questions?.map((q: TestQuestion, qIndex: number) => (
              <div key={q.id} className="flex gap-4 items-start">
                <span className="font-bold text-lg text-indigo-600 shrink-0">{qIndex + 1}.</span>
                <div className="flex-1 space-y-4">
                  <p className="text-lg font-medium text-gray-800">{q.text || '...'}</p>
                  <div className="grid grid-cols-1 gap-3">
                    {['A', 'B', 'C', 'D'].map((opt, oIdx) => (
                      <label
                        key={opt}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`preview-${q.id}`}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-bold text-gray-500 w-5">{opt}.</span>
                        <span className="text-gray-700">{q.options?.[oIdx] || '...'}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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
                            <input
                              type="text"
                              className="mx-2 w-32 border-b-2 border-indigo-200 focus:border-indigo-500 bg-transparent text-center font-bold text-indigo-600 focus:outline-none transition-colors"
                            />
                          )}
                        </React.Fragment>
                      ))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Matching Preview */}
        {block.type === 'matching' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 font-medium">
              Học sinh sẽ ghép nối từng mục ở Cột A với đáp án tương ứng ở Cột B:
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
                    <span className="font-medium text-gray-800">
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
                    <span className="font-medium text-gray-700">
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
                  <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 min-h-[50px] flex items-center text-gray-400 text-sm italic">
                    (Vị trí học sinh ghép câu...)
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {words.length > 0 ? (
                      words.map((w, wIdx) => (
                        <span
                          key={wIdx}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold border border-indigo-100 shadow-2xs"
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
