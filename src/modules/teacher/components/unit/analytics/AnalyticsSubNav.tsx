'use client'

import React from 'react'
import { BookOpen, GraduationCap, ClipboardList, Loader2 } from 'lucide-react'
import type { AnalyticsSubTab } from './types'

type AnalyticsSubNavProps = {
  subTab: AnalyticsSubTab
  onTabChange: (tab: AnalyticsSubTab) => void
  hardVocabsCount: number
  totalStudentsCount: number
  publishedExamsCount: number
  isLoading: boolean
}

export default function AnalyticsSubNav({
  subTab,
  onTabChange,
  hardVocabsCount,
  totalStudentsCount,
  publishedExamsCount,
  isLoading,
}: AnalyticsSubNavProps) {
  return (
    <div className="px-6 py-1.5 shrink-0 flex items-center justify-between border-b border-gray-200/60 bg-white">
      <div className="flex gap-1.5">
        <button
          onClick={() => onTabChange('vocab')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            subTab === 'vocab'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <BookOpen size={14} />
          <span>Phân tích từ vựng &amp; Lỗi sai</span>
          {hardVocabsCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                subTab === 'vocab' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {hardVocabsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('students')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            subTab === 'students'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <GraduationCap size={14} />
          <span>Tiến độ từng học sinh</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              subTab === 'students' ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {totalStudentsCount}
          </span>
        </button>

        <button
          onClick={() => onTabChange('exams')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            subTab === 'exams'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ClipboardList size={14} />
          <span>Bài kiểm tra Unit</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              subTab === 'exams' ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {publishedExamsCount}
          </span>
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
          <Loader2 size={13} className="animate-spin" />
          <span>Đang tải...</span>
        </div>
      )}
    </div>
  )
}
