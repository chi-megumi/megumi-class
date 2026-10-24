'use client'

import React from 'react'
import ReadingQuestionItemView from './ReadingQuestionItemView'
import type { ReadingQuestionsViewProps } from './types'

export default function ReadingQuestionsView({
  questions,
  answers = {},
  isMiniChallenge = false,
  isReviewMode = false,
  result = null,
  onAnswer,
  viewMode = 'student',
}: ReadingQuestionsViewProps) {
  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-gray-400 italic bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
        Không có câu hỏi nào cho bài đọc này.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Câu hỏi đọc hiểu ({questions.length} câu)
        </h4>
        {viewMode === 'teacher' && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Hiển thị đáp án giáo viên
          </span>
        )}
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <ReadingQuestionItemView
            key={q.id ? `${q.id}_${idx}` : `rq-${idx}`}
            question={q}
            index={idx}
            answers={answers}
            isMiniChallenge={isMiniChallenge}
            isReviewMode={isReviewMode}
            result={result}
            onAnswer={onAnswer}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  )
}
