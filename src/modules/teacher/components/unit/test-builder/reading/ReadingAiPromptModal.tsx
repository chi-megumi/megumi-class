'use client'

import React, { useState, useMemo } from 'react'
import {
  X,
  Sparkles,
  Copy,
  Check,
  FileCode2,
  BookOpen,
  Shuffle,
} from 'lucide-react'
import Portal from '@/components/common/Portal'
import type { ReadingAiPromptModalProps, ReadingInteractionType } from './types'
import { READING_TYPES, READING_SAMPLE_JSONS } from './constants'
import { generateReadingPrompt, getRandomVocabSample } from './promptHelper'

export default function ReadingAiPromptModal({
  isOpen,
  vocabItems = [],
  unitTitle,
  onClose,
}: ReadingAiPromptModalProps) {
  const [selectedType, setSelectedType] = useState<ReadingInteractionType>('multiple_choice')
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  // Shuffle key để đổi bộ 25 từ ngẫu nhiên khác trong Unit
  const [shuffleKey, setShuffleKey] = useState(0)
  const selectedVocabSample = useMemo(() => {
    return getRandomVocabSample(vocabItems, 25, shuffleKey)
  }, [vocabItems, shuffleKey])

  const handleReshuffleVocab = () => {
    setShuffleKey((prev) => prev + 1)
  }

  // Sinh Prompt tự động dựa trên dạng đã chọn và danh sách từ vựng Unit
  const currentPrompt = useMemo(() => {
    return generateReadingPrompt({
      type: selectedType,
      vocabItems: selectedVocabSample,
      unitTitle,
    })
  }, [selectedType, selectedVocabSample, unitTitle])

  const currentSampleJson = READING_SAMPLE_JSONS[selectedType]

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch {
      // Fallback nếu cần
    }
  }

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(currentSampleJson)
      setCopiedJson(true)
      setTimeout(() => setCopiedJson(false), 2000)
    } catch {
      // Fallback nếu cần
    }
  }

  if (!isOpen) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                  Trợ lý Prompt AI & JSON Mẫu Đọc Hiểu
                </h3>
                <p className="text-xs text-gray-500">
                  Copy sang ChatGPT / Claude để tạo bài đọc bám sát từ vựng Unit
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            {/* Lựa chọn 1 trong 6 dạng đọc hiểu */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                1. Chọn dạng Đọc hiểu mong muốn:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {READING_TYPES.map((item) => {
                  const isSelected = selectedType === item.type
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setSelectedType(item.type)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200 shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-gray-800 line-clamp-1">
                          {item.title}
                        </span>
                      </div>
                      <span className="inline-block text-[10px] font-semibold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded mb-1">
                        {item.badge}
                      </span>
                      <p className="text-[11px] text-gray-500 line-clamp-2">{item.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Thông báo từ vựng Unit sẽ được đính kèm */}
            {vocabItems.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-800">
                  <BookOpen size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    {vocabItems.length > 25 ? (
                      <>
                        Đã tự động chọn ngẫu nhiên <strong>{selectedVocabSample.length}</strong>/{vocabItems.length} từ vựng
                        của Unit vào prompt!
                      </>
                    ) : (
                      <>
                        Đã tự động lồng ghép <strong>{selectedVocabSample.length}</strong> từ vựng
                        của Unit vào prompt!
                      </>
                    )}
                  </span>
                </div>
                {vocabItems.length > 25 && (
                  <button
                    type="button"
                    onClick={handleReshuffleVocab}
                    title="Chọn ngẫu nhiên 25 từ khác trong Unit"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100/70 hover:text-emerald-800 transition-colors shrink-0 shadow-2xs cursor-pointer"
                  >
                    <Shuffle size={13} />
                    <span>Đổi 25 từ khác</span>
                  </button>
                )}
              </div>
            )}

            {/* Khung Prompt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  2. Prompt AI hoàn chỉnh (đã bao gồm từ vựng & yêu cầu):
                </label>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
                >
                  {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedPrompt ? 'Đã sao chép!' : 'Sao chép Prompt'}</span>
                </button>
              </div>

              <pre className="p-3.5 bg-gray-900 text-gray-100 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar border border-gray-800 leading-relaxed">
                {currentPrompt}
              </pre>
            </div>

            {/* Khung JSON Schema mẫu */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <FileCode2 size={14} className="text-gray-400" />
                  <span>3. Cấu trúc JSON mẫu tương ứng:</span>
                </label>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  {copiedJson ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedJson ? 'Đã sao chép' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-3 bg-gray-50 text-gray-700 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar border border-gray-200 leading-relaxed">
                {currentSampleJson}
              </pre>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs text-gray-500">
              Sau khi nhận kết quả JSON từ AI, bấm nút <strong>Import JSON</strong> trên thanh công cụ
              bài đọc để đổ dữ liệu vào.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
