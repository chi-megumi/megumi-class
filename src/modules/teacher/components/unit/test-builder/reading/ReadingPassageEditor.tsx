'use client'

import React, { useMemo } from 'react'
import { FileText, PlusCircle, BookmarkCheck } from 'lucide-react'
import type { ReadingPassageEditorProps } from './types'

export default function ReadingPassageEditor({
  text,
  isMiniChallenge,
  vocabItems = [],
  onChangeText,
  onInsertBlank,
  onInsertInsertionMarker,
}: ReadingPassageEditorProps) {
  // Tính số từ trong đoạn văn
  const wordCount = useMemo(() => {
    if (!text || !text.trim()) return 0
    return text.trim().split(/\s+/).filter(Boolean).length
  }, [text])

  // Quét danh sách từ vựng Unit đã xuất hiện trong bài đọc
  const matchedVocab = useMemo(() => {
    if (!text || vocabItems.length === 0) return []
    const normalizedText = text.toLowerCase()
    return vocabItems.filter((item) => {
      const w = item.word.trim().toLowerCase()
      if (!w || w.length < 2) return false
      // Regex boundary hoặc substring đơn giản
      const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`\\b${escaped}\\b`, 'i')
      return regex.test(normalizedText)
    })
  }, [text, vocabItems])

  return (
    <div className="space-y-3">
      {/* Header khu vực Passage */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileText
            size={16}
            className={isMiniChallenge ? 'text-orange-500' : 'text-indigo-600'}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Nội dung bài đọc (Reading Passage)
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
              wordCount > 0
                ? isMiniChallenge
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-indigo-50 text-indigo-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {wordCount} từ
          </span>
        </div>

        {/* Toolbar công cụ chèn nhanh */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={onInsertBlank}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            title="Chèn vị trí đục lỗ (1)______ vào cuối hoặc vị trí con trỏ"
          >
            <PlusCircle size={13} className="text-gray-500" />
            <span>Chèn đục lỗ (1)</span>
          </button>
          <button
            type="button"
            onClick={onInsertInsertionMarker}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            title="Chèn ký hiệu [A], [B], [C], [D] vào đoạn văn"
          >
            <PlusCircle size={13} className="text-gray-500" />
            <span>Chèn [A]-[D]</span>
          </button>
        </div>
      </div>

      {/* Textarea nhập bài đọc */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          rows={7}
          placeholder="Dán hoặc tự gõ nội dung bài đọc tiếng Anh vào đây..."
          className={`w-full p-4 rounded-xl border text-sm sm:text-base leading-relaxed focus:outline-none transition-all resize-y ${
            isMiniChallenge
              ? 'border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-orange-50/20'
              : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 bg-white'
          }`}
        />
      </div>

      {/* Thanh hiển thị độ phủ từ vựng Unit */}
      {vocabItems.length > 0 && (
        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-start gap-2 text-xs">
          <BookmarkCheck
            size={16}
            className={`shrink-0 mt-0.5 ${
              matchedVocab.length > 0 ? 'text-emerald-500' : 'text-gray-400'
            }`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-700">
                Từ vựng Unit trong bài ({matchedVocab.length}/{vocabItems.length}):
              </span>
              {matchedVocab.length === 0 ? (
                <span className="text-gray-400 italic">
                  Chưa phát hiện từ vựng nào của Unit trong đoạn văn.
                </span>
              ) : (
                matchedVocab.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    ✓ {item.word}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
