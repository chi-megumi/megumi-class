'use client'

import React from 'react'
import { Columns, Rows, GraduationCap, Eye } from 'lucide-react'

type ReadingControlBarProps = {
  layoutMode: 'split' | 'stacked'
  setLayoutMode: (mode: 'split' | 'stacked') => void
  fontSize: 'normal' | 'large'
  setFontSize: (size: 'normal' | 'large') => void
  viewMode?: 'student' | 'teacher'
  onViewModeChange?: (mode: 'student' | 'teacher') => void
}

export default function ReadingControlBar({
  layoutMode,
  setLayoutMode,
  fontSize,
  setFontSize,
  viewMode = 'student',
  onViewModeChange,
}: ReadingControlBarProps) {
  return (
    <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
      {/* Bên trái: Chế độ nếu có onViewModeChange (dành cho Teacher preview) */}
      <div className="flex items-center gap-2">
        {onViewModeChange ? (
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => onViewModeChange('teacher')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'teacher'
                  ? 'bg-white text-indigo-700 shadow-2xs ring-1 ring-black/5'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap size={14} className="text-indigo-600" />
              <span>Đáp án & Lời giải</span>
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('student')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                viewMode === 'student'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={14} />
              <span>Học sinh làm bài</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 px-2 py-1 bg-indigo-50/60 rounded-lg border border-indigo-100">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Phần Đọc hiểu</span>
          </div>
        )}
      </div>

      {/* Bên phải: Cỡ chữ & Bố cục 2 Cột vs Xếp chồng */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Cỡ chữ */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFontSize('normal')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              fontSize === 'normal'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Cỡ chữ tiêu chuẩn"
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setFontSize('large')}
            className={`px-2.5 py-1 rounded-md transition-all font-black text-xs ${
              fontSize === 'large'
                ? 'bg-white text-gray-900 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Cỡ chữ lớn"
          >
            A+
          </button>
        </div>

        {/* Bố cục: 2 Cột vs Xếp chồng (hiển thị từ md trở lên) */}
        <div className="hidden md:flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setLayoutMode('split')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              layoutMode === 'split'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Chia 2 cột: Bài đọc bên trái, Câu hỏi bên phải"
          >
            <Columns size={13} />
            <span>Chia 2 cột</span>
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode('stacked')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              layoutMode === 'stacked'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
            title="Xếp chồng: Bài đọc ở trên, Câu hỏi bên dưới"
          >
            <Rows size={13} />
            <span>Xếp chồng</span>
          </button>
        </div>
      </div>
    </div>
  )
}
