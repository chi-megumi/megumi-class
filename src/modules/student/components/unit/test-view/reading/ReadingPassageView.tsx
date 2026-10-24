'use client'

import React from 'react'
import { BookOpen, Copy, Check } from 'lucide-react'
import FormattedPassageContent from './FormattedPassageContent'
import type { ReadingPassageViewProps } from './types'

export default function ReadingPassageView({
  text = '',
  title,
  isMiniChallenge,
  fontSize = 'normal',
  passageId,
  copiedPassageId,
  onCopy,
}: ReadingPassageViewProps) {
  const wordCount = (text || '').trim().split(/\s+/).filter(Boolean).length
  const readingTimeMin = Math.max(1, Math.round(wordCount / 180))

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 shadow-2xs relative ${
        isMiniChallenge
          ? 'bg-orange-50/20 border-orange-200'
          : 'bg-slate-50/70 border-gray-200/90'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-gray-200/80 text-xs font-bold text-gray-500 uppercase tracking-wider flex-wrap gap-2">
        <span className="flex items-center gap-1.5 text-indigo-900 font-bold">
          <BookOpen
            size={15}
            className={isMiniChallenge ? 'text-orange-500' : 'text-indigo-600'}
          />
          <span>{title || 'Nội dung bài đọc (Reading Passage)'}</span>
        </span>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-normal text-gray-400 lowercase">
            {wordCount} từ • ~{readingTimeMin} phút đọc
          </span>
          {onCopy && (
            <button
              type="button"
              onClick={() => onCopy(text, passageId || 'default')}
              className="p-1 px-2 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 text-xs font-semibold flex items-center gap-1"
              title="Sao chép toàn bộ nội dung bài đọc"
            >
              {copiedPassageId === (passageId || 'default') ? (
                <>
                  <Check size={12} className="text-emerald-600" />
                  <span className="text-emerald-700 text-[11px]">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span className="text-[11px]">Chép</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <FormattedPassageContent text={text} fontSize={fontSize} />
    </div>
  )
}
