'use client'

import React from 'react'
import {
  X,
  PanelLeftOpen,
  Clock,
  Lock,
  RotateCcw,
  FileCode2,
  Sparkles,
  Eye,
  Save,
} from 'lucide-react'
import type { VocabItemData } from '@/modules/teacher/types'

type TestBuilderHeaderProps = {
  testTitle: string
  onTitleChange: (title: string) => void
  testDuration: number
  onDurationChange: (duration: number) => void
  isRetakable: boolean
  onRetakableChange: (isRetakable: boolean) => void
  isPreview: boolean
  onTogglePreview: () => void
  isSidebarOpen: boolean
  onOpenSidebar: () => void
  isSaving: boolean
  onSave: () => void
  onClose: () => void
  onOpenFullExamImport: () => void
  onOpenGenerator: () => void
  vocabItems?: VocabItemData[]
}

export default function TestBuilderHeader({
  testTitle,
  onTitleChange,
  testDuration,
  onDurationChange,
  isRetakable,
  onRetakableChange,
  isPreview,
  onTogglePreview,
  isSidebarOpen,
  onOpenSidebar,
  isSaving,
  onSave,
  onClose,
  onOpenFullExamImport,
  onOpenGenerator,
  vocabItems,
}: TestBuilderHeaderProps) {
  return (
    <div className="min-h-16 bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2.5 flex items-center justify-between gap-2.5 sm:gap-3 shrink-0 shadow-xs z-10">
      {/* Left toolbar items */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors shrink-0"
          title="Đóng"
        >
          <X size={20} />
        </button>

        {!isPreview && !isSidebarOpen && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="hidden md:flex p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0 items-center gap-1.5 text-xs font-bold border border-indigo-100"
            title="Mở lại kho template"
          >
            <PanelLeftOpen size={17} />
            <span className="hidden xl:inline">Kho Template</span>
          </button>
        )}

        <div className="relative min-w-[130px] max-w-[200px] md:max-w-[240px] lg:max-w-xs flex-1 shrink">
          <input
            type="text"
            value={testTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full text-sm md:text-base font-bold text-gray-800 bg-gray-50 hover:bg-gray-100/70 focus:bg-white border border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none px-3 py-1.5 rounded-xl transition-all shadow-2xs truncate"
            placeholder="Nhập tên bài kiểm tra..."
            title={testTitle}
          />
        </div>

        {/* Duration Badge */}
        <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200 shrink-0 text-xs font-semibold shadow-2xs">
          <Clock size={14} className="text-gray-400 shrink-0" />
          <span className="hidden sm:inline text-gray-500 font-medium">Thời gian:</span>
          <input
            type="number"
            min={1}
            value={testDuration}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            className="w-9 bg-white border border-gray-200 rounded px-1 font-bold text-gray-800 focus:outline-none focus:border-indigo-400 text-center"
          />
          <span className="text-gray-500 font-medium">phút</span>
        </div>

        {/* Mode Button: Làm 1 lần vs Luyện tập */}
        <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => onRetakableChange(false)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
              !isRetakable
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            title="Học sinh chỉ được nộp bài 1 lần duy nhất, kết quả chốt điểm ngay."
          >
            <Lock size={12} />
            <span className="hidden sm:inline">1 lần</span>
          </button>
          <button
            type="button"
            onClick={() => onRetakableChange(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
              isRetakable
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            title="Học sinh có thể làm đi làm lại nhiều lần. Mỗi lần làm lại hệ thống sẽ tự động xáo trộn câu hỏi."
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Luyện tập</span>
          </button>
        </div>
      </div>

      {/* Right action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {!isPreview && (
          <button
            type="button"
            onClick={onOpenFullExamImport}
            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl border border-purple-200 shadow-2xs transition-all flex items-center gap-1.5 text-xs whitespace-nowrap shrink-0 hover:border-purple-300"
            title="Import nhanh toàn bộ đề thi từ file JSON"
          >
            <FileCode2 size={15} />
            <span className="hidden xl:inline">Import JSON</span>
            <span className="xl:hidden">JSON</span>
          </button>
        )}

        {vocabItems && vocabItems.length > 0 && !isPreview && (
          <button
            type="button"
            onClick={onOpenGenerator}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 text-xs whitespace-nowrap shrink-0 hover:-translate-y-0.5 hover:shadow-xs"
            title="Tự động sinh câu hỏi từ danh sách từ vựng của bài học"
          >
            <Sparkles size={15} className="text-amber-300" />
            <span className="hidden xl:inline">Sinh Đề Từ Vựng</span>
            <span className="xl:hidden">Sinh Đề AI</span>
          </button>
        )}

        <button
          onClick={onTogglePreview}
          className="px-3.5 py-1.5 text-indigo-700 font-semibold bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 border border-indigo-100"
          title={isPreview ? 'Quay lại chỉnh sửa đề thi' : 'Xem trước giao diện học sinh làm bài'}
        >
          <Eye size={15} />
          <span>{isPreview ? 'Sửa đề' : 'Xem thử'}</span>
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
        >
          <Save size={15} />
          <span>{isSaving ? 'Đang lưu...' : 'Lưu Đề Thi'}</span>
        </button>
      </div>
    </div>
  )
}
