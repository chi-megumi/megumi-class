'use client'

import React from 'react'
import { CheckCircle2, TrendingDown } from 'lucide-react'
import type { QuestionStat } from './types'

type QuestionStatCardProps = {
  question: QuestionStat
}

export default function QuestionStatCard({ question: q }: QuestionStatCardProps) {
  const isHard = q.difficultyLevel === 'hard'
  const isMedium = q.difficultyLevel === 'medium'

  const typeLabel =
    q.type === 'multiple_choice'
      ? 'Trắc nghiệm'
      : q.type === 'fill_blank'
        ? 'Điền khuyết'
        : q.type === 'matching'
          ? 'Ghép nối'
          : 'Sắp xếp câu'

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        isHard
          ? 'bg-rose-50/30 border-rose-200 shadow-xs'
          : isMedium
            ? 'bg-amber-50/20 border-amber-200'
            : 'bg-white border-gray-100 shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
            {q.blockTitle}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-semibold">
            {typeLabel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
              isHard
                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                : isMedium
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            {isHard ? 'Khó' : isMedium ? 'Trung bình' : 'Nắm vững'}: {q.accuracyRate}% đúng
          </span>
        </div>
      </div>

      {/* Question text */}
      <p className="font-bold text-gray-900 text-sm mb-3">{q.questionText}</p>

      {/* Correct answer display */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs mb-4">
        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
        <span className="text-emerald-800 font-medium">Đáp án chuẩn:</span>
        <span className="font-bold text-emerald-950">{q.correctAnswerText}</span>
      </div>

      {/* Accuracy progress bar */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-xs font-bold text-gray-600">
          <span>
            Tỉ lệ làm đúng: {q.correctCount}/{q.totalAttempts} em
          </span>
          <span className={isHard ? 'text-rose-600' : isMedium ? 'text-amber-600' : 'text-emerald-600'}>
            {q.accuracyRate}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className={`h-full transition-all rounded-l-full ${
              isHard ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${q.accuracyRate}%` }}
          />
          <div
            className="h-full bg-rose-200/60 transition-all rounded-r-full"
            style={{ width: `${100 - q.accuracyRate}%` }}
          />
        </div>
      </div>

      {/* Common mistakes */}
      {q.mistakes.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
            <TrendingDown size={14} className="text-rose-500" />
            Các phương án học sinh hay trả lời sai nhất:
          </p>
          <div className="flex flex-wrap gap-2">
            {q.mistakes.map((m, mIdx) => (
              <div
                key={mIdx}
                className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5"
              >
                <span className="font-semibold line-through text-rose-600">{m.answer}</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 text-[10px] font-black">
                  {m.count} em ({m.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
