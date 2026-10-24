'use client'

import React from 'react'
import { PanelLeftClose, X, Sparkles, FileCode2, Plus } from 'lucide-react'
import { TEMPLATES } from './constants'
import type { TemplateType } from './types'
import type { VocabItemData } from '@/modules/teacher/types'

type TestBuilderSidebarProps = {
  vocabItems?: VocabItemData[]
  onOpenGenerator: () => void
  onOpenFullExamImport: () => void
  onAddBlock: (type: TemplateType, title: string) => void
  onOpenReadingPicker?: () => void
  onCloseSidebar: () => void
  onCloseModal: () => void
}

export default function TestBuilderSidebar({
  vocabItems,
  onOpenGenerator,
  onOpenFullExamImport,
  onAddBlock,
  onOpenReadingPicker,
  onCloseSidebar,
  onCloseModal,
}: TestBuilderSidebarProps) {
  return (
    <div className="w-full md:w-72 lg:w-80 bg-white border-r border-gray-200 h-auto max-h-[40vh] md:max-h-none md:h-full flex flex-col shrink-0 z-10">
      <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Kho Template</h2>
          <p className="text-xs text-gray-500 mt-0.5">Từ lớp 3 đến lớp 12</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCloseSidebar}
            className="hidden md:flex p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Thu gọn kho template"
          >
            <PanelLeftClose size={18} />
          </button>
          <button
            onClick={onCloseModal}
            className="md:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 overflow-y-auto flex-1 custom-scrollbar space-y-3">
        {/* Quick Generation Tools inside Sidebar */}
        <div className="space-y-2 mb-3 pb-3 border-b border-gray-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
            Công cụ tạo nhanh
          </div>
          {vocabItems && vocabItems.length > 0 && (
            <button
              type="button"
              onClick={onOpenGenerator}
              className="w-full p-2.5 sm:p-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-left hover:shadow-md transition-all flex items-center gap-3 group hover:-translate-y-0.5"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs">Sinh đề tự động bằng AI</div>
                <div className="text-[11px] text-purple-100 truncate">
                  Từ {vocabItems.length} từ vựng bài học
                </div>
              </div>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenFullExamImport}
            className="w-full p-2.5 sm:p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-xl text-left transition-all flex items-center gap-3 group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <FileCode2 size={16} className="text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs">Import đề từ file JSON</div>
              <div className="text-[11px] text-purple-600/70 truncate">Nạp đề thi hoàn chỉnh</div>
            </div>
          </button>
        </div>

        <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
          Thêm phần thi (Template)
        </div>

        {TEMPLATES.map((tpl) => (
          <div
            key={tpl.type}
            onClick={() => {
              if (tpl.type === 'reading' && onOpenReadingPicker) {
                onOpenReadingPicker()
              } else {
                onAddBlock(tpl.type, tpl.title)
              }
            }}
            className="group relative bg-white border border-gray-200 rounded-xl p-3.5 sm:p-4 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            <div className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={16} />
            </div>
            <div className="w-9 h-9 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center mb-2.5 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <tpl.icon size={18} />
            </div>
            <h3 className="font-bold text-gray-800 text-sm mb-1">{tpl.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{tpl.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
