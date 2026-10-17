'use client'

import React from 'react'
import { Award, BarChart3, X } from 'lucide-react'
import type { TestResultsTab } from './types'

type TestResultsHeaderProps = {
  testTitle: string
  duration: number
  submissionsCount: number
  activeTab: TestResultsTab
  onTabChange: (tab: TestResultsTab) => void
  hardQuestionsCount: number
  onClose: () => void
}

export default function TestResultsHeader({
  testTitle,
  duration,
  submissionsCount,
  activeTab,
  onTabChange,
  hardQuestionsCount,
  onClose,
}: TestResultsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:px-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50/40 to-purple-50/30 gap-4">
      <div className="w-full">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 text-[11px] font-black uppercase tracking-wider">
            Báo Cáo Bài Thi
          </span>
          <h2 className="text-xl md:text-2xl font-black text-gray-900">{testTitle}</h2>
        </div>
        <p className="text-gray-500 text-xs mt-1">
          Thời gian làm bài: {duration || 45} phút | Tổng số lượt nộp: <b>{submissionsCount}</b> học
          sinh
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Tabs */}
        <div className="flex p-1 bg-white/80 backdrop-blur rounded-2xl border border-indigo-100 shadow-xs text-xs font-bold">
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <Award size={15} /> Bảng Xếp Hạng ({submissionsCount})
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            <BarChart3 size={15} /> Phân Tích Câu Hỏi
            {hardQuestionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {hardQuestionsCount}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 hover:bg-white text-gray-400 hover:text-gray-700 rounded-full transition-colors shrink-0 shadow-xs"
        >
          <X size={22} />
        </button>
      </div>
    </div>
  )
}
