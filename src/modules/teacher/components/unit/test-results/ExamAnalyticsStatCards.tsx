'use client'

import React from 'react'
import { User, BarChart3, Award, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { QuestionAnalytics } from './types'

type ExamAnalyticsStatCardsProps = {
  analytics: QuestionAnalytics
}

export default function ExamAnalyticsStatCards({ analytics }: ExamAnalyticsStatCardsProps) {
  const hasHardQuestions = analytics.hardQuestionsCount > 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Submissions */}
      <div className="bg-indigo-50/60 border border-indigo-100 p-4.5 rounded-2xl flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
          <User size={22} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            Lượt nộp bài
          </p>
          <p className="text-2xl font-black text-indigo-950">{analytics.totalSubmissions}</p>
        </div>
      </div>

      {/* Average Score */}
      <div className="bg-purple-50/60 border border-purple-100 p-4.5 rounded-2xl flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs shrink-0">
          <BarChart3 size={22} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
            Điểm trung bình
          </p>
          <p className="text-2xl font-black text-purple-950">{analytics.averageScore}đ</p>
        </div>
      </div>

      {/* Highest / Lowest */}
      <div className="bg-emerald-50/60 border border-emerald-100 p-4.5 rounded-2xl flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
          <Award size={22} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            Cao nhất / Thấp nhất
          </p>
          <p className="text-2xl font-black text-emerald-950">
            {analytics.highestScore}đ{' '}
            <span className="text-sm font-semibold text-gray-400">
              / {analytics.lowestScore}đ
            </span>
          </p>
        </div>
      </div>

      {/* Hard questions */}
      <div
        className={`p-4.5 rounded-2xl flex items-center gap-3.5 border transition-all ${
          hasHardQuestions ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-100'
        }`}
      >
        <div
          className={`w-11 h-11 rounded-xl text-white flex items-center justify-center shadow-xs shrink-0 ${
            hasHardQuestions ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        >
          {hasHardQuestions ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
        </div>
        <div>
          <p
            className={`text-[11px] font-bold uppercase tracking-wider ${
              hasHardQuestions ? 'text-rose-600' : 'text-emerald-600'
            }`}
          >
            Câu hỏi khó (&lt;50%)
          </p>
          <p
            className={`text-2xl font-black ${
              hasHardQuestions ? 'text-rose-950' : 'text-emerald-950'
            }`}
          >
            {analytics.hardQuestionsCount} câu
          </p>
        </div>
      </div>
    </div>
  )
}
