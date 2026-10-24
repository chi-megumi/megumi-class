'use client'

import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { TestBlock, TestQuestion } from '@/modules/teacher/types'

type FillBlankEditorProps = {
  block: TestBlock
  isMiniChallenge: boolean
  onUpdateContent: (newContent: TestBlock['content']) => void
  onAddQuestion: () => void
}

export default function FillBlankEditor({
  block,
  isMiniChallenge,
  onUpdateContent,
  onAddQuestion,
}: FillBlankEditorProps) {
  const questions =
    block.content?.questions && block.content.questions.length > 0
      ? block.content.questions
      : [{ id: block.id, text: block.content?.text || '', answer: block.content?.answer || '' }]

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {questions.map((q: TestQuestion, qIndex: number) => (
          <div
            key={q.id}
            className={`flex gap-4 items-start p-5 rounded-2xl border relative group/q transition-colors ${
              isMiniChallenge
                ? 'bg-gradient-to-br from-orange-50/30 to-pink-50/30 border-orange-100'
                : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
            }`}
          >
            <div
              className={`font-bold text-lg mt-2 flex items-center justify-center shrink-0 ${
                isMiniChallenge
                  ? 'w-10 h-10 rounded-full bg-orange-100 text-orange-600 border border-orange-200'
                  : 'w-8 h-8 rounded-full bg-indigo-50 text-indigo-600'
              }`}
            >
              {qIndex + 1}
            </div>
            <div className="flex-1 space-y-3">
              <div
                className={`p-4 border rounded-xl ${
                  isMiniChallenge
                    ? 'bg-white border-orange-200 shadow-inner'
                    : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <p
                  className={`text-xs font-semibold mb-2 ${
                    isMiniChallenge ? 'text-orange-500' : 'text-gray-500'
                  }`}
                >
                  Gõ câu hỏi, dùng dấu{' '}
                  <code
                    className={`${
                      isMiniChallenge
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-indigo-50 text-indigo-600'
                    } px-1.5 py-0.5 rounded font-bold`}
                  >
                    ___
                  </code>{' '}
                  để tạo ô trống
                </p>
                <textarea
                  rows={2}
                  value={q.text || ''}
                  onChange={(e) => {
                    const newQs = [...questions]
                    newQs[qIndex] = { ...newQs[qIndex], text: e.target.value }
                    onUpdateContent({ ...block.content, questions: newQs })
                  }}
                  placeholder="VD: Could you bring me an extra ___? (Bạn có thể mang cho tôi thêm một chiếc chăn không?)"
                  className={`w-full text-base font-medium bg-transparent resize-none focus:outline-none ${
                    isMiniChallenge
                      ? 'text-orange-900 placeholder:text-orange-300'
                      : 'text-gray-800'
                  }`}
                />
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-bold ${
                    isMiniChallenge ? 'text-orange-600' : 'text-gray-600'
                  }`}
                >
                  Đáp án đúng:
                </span>
                <input
                  type="text"
                  value={q.answer || ''}
                  onChange={(e) => {
                    const newQs = [...questions]
                    newQs[qIndex] = { ...newQs[qIndex], answer: e.target.value }
                    onUpdateContent({ ...block.content, questions: newQs })
                  }}
                  placeholder="VD: blanket"
                  className={`flex-1 font-bold px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 ${
                    isMiniChallenge
                      ? 'bg-orange-100 border border-orange-300 text-orange-800 focus:ring-orange-500/30'
                      : 'bg-green-50 border border-green-200 text-green-700 focus:ring-green-500/20'
                  }`}
                />
              </div>
              <p
                className={`text-[11px] italic ${
                  isMiniChallenge ? 'text-orange-400' : 'text-gray-400'
                }`}
              >
                * Hệ thống chấm điểm tự động không phân biệt chữ hoa/chữ thường.
              </p>
            </div>

            {questions.length > 1 && (
              <button
                className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/q:opacity-100"
                onClick={() => {
                  const newQuestions = [...questions]
                  newQuestions.splice(qIndex, 1)
                  onUpdateContent({ ...block.content, questions: newQuestions })
                }}
                title="Xóa câu hỏi này"
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
          <Plus size={18} /> Thêm câu hỏi điền khuyết
        </button>
      </div>
    </div>
  )
}
