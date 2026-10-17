'use client'

import React from 'react'
import { Plus, Trash2, Sparkles } from 'lucide-react'
import type { TestBlock, TestQuestion } from '@/modules/teacher/types'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-2">
        <span>
          Gõ câu tiếng Anh hoàn chỉnh. Hệ thống sẽ tự động tách các từ và xáo trộn vị trí khi học
          sinh làm bài.
        </span>
        <span className="font-bold text-indigo-600">{questions.length} câu</span>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const words = (q.sentence || '').trim().split(/\s+/).filter(Boolean)
          return (
            <div
              key={q.id}
              className={`flex gap-4 items-start p-5 rounded-2xl border relative group/q transition-all ${
                isMiniChallenge
                  ? 'bg-gradient-to-br from-orange-50/20 to-pink-50/20 border-orange-100 shadow-sm'
                  : 'bg-gray-50/60 border-gray-100 shadow-sm hover:border-gray-200'
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
                    <span className="text-[11px] text-gray-400">{words.length} từ</span>
                  </div>
                  <textarea
                    rows={2}
                    value={q.sentence || ''}
                    onChange={(e) => {
                      const newQs = [...questions]
                      newQs[qIndex] = { ...newQs[qIndex], sentence: e.target.value }
                      onUpdateContent({ ...block.content, questions: newQs })
                    }}
                    placeholder="VD: He decided to abandon the old car."
                    className={`w-full font-bold px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 resize-none ${
                      isMiniChallenge
                        ? 'border-orange-200 text-orange-950 focus:ring-orange-400/30'
                        : 'border-gray-200 text-gray-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                    }`}
                  />
                </div>

                {/* Live chips preview */}
                {words.length > 0 && (
                  <div className="p-3 bg-white/80 rounded-xl border border-gray-200/80">
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>Xem trước các thẻ từ (Word Chips) học sinh sẽ nhận:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {words.map((w, wIdx) => (
                        <span
                          key={wIdx}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 shadow-2xs"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Delete button */}
              {questions.length > 1 && (
                <button
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
