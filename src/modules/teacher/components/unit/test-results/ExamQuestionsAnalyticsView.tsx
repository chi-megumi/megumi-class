'use client'

import React, { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import ExamAnalyticsStatCards from './ExamAnalyticsStatCards'
import HardQuestionsAlert from './HardQuestionsAlert'
import QuestionStatCard from './QuestionStatCard'
import type { QuestionAnalytics, DifficultyFilter } from './types'

type ExamQuestionsAnalyticsViewProps = {
  analytics: QuestionAnalytics | null
  isLoading: boolean
}

export default function ExamQuestionsAnalyticsView({
  analytics,
  isLoading,
}: ExamQuestionsAnalyticsViewProps) {
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyFilter>('all')

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-6 flex items-center justify-center text-gray-400">
        Đang phân tích dữ liệu câu hỏi...
      </div>
    )
  }

  if (!analytics || analytics.totalSubmissions === 0) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className="text-center py-16 text-gray-400 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 p-8">
          <BarChart3 className="mx-auto text-gray-300 mb-3" size={40} />
          <h4 className="text-base font-bold text-gray-700">Chưa có dữ liệu phân tích</h4>
          <p className="text-xs text-gray-400 mt-1">
            Cần có ít nhất 1 học sinh nộp bài để thống kê và phân tích các câu hỏi khó.
          </p>
        </div>
      </div>
    )
  }

  const hardQuestionsCount = analytics.questionStats.filter((q) => q.difficultyLevel === 'hard').length
  const mediumQuestionsCount = analytics.questionStats.filter((q) => q.difficultyLevel === 'medium').length
  const easyQuestionsCount = analytics.questionStats.filter((q) => q.difficultyLevel === 'easy').length

  const filteredQuestions = analytics.questionStats.filter((q) => {
    if (filterDifficulty === 'all') return true
    return q.difficultyLevel === filterDifficulty
  })

  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Stat Cards */}
      <ExamAnalyticsStatCards analytics={analytics} />

      {/* Warning Banner on Hard Questions */}
      <HardQuestionsAlert hardQuestionsCount={analytics.hardQuestionsCount} />

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Lọc theo độ khó:</span>
          <div className="flex gap-1.5 p-1 bg-gray-100/80 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterDifficulty('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterDifficulty === 'all'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Tất cả ({analytics.questionStats.length})
            </button>
            <button
              onClick={() => setFilterDifficulty('hard')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                filterDifficulty === 'hard'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              🔴 Khó ({hardQuestionsCount})
            </button>
            <button
              onClick={() => setFilterDifficulty('medium')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                filterDifficulty === 'medium'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              🟡 Trung bình ({mediumQuestionsCount})
            </button>
            <button
              onClick={() => setFilterDifficulty('easy')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                filterDifficulty === 'easy'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              🟢 Nắm vững ({easyQuestionsCount})
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-400 font-medium">
          Hiển thị {filteredQuestions.length} câu hỏi
        </div>
      </div>

      {/* Question list */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
            Không có câu hỏi nào thuộc phân loại này.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <QuestionStatCard key={`${q.blockId}_${q.id}_${idx}`} question={q} />
          ))
        )}
      </div>
    </div>
  )
}
