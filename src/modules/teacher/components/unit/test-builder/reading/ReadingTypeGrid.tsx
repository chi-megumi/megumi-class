'use client'

import React from 'react'
import { Check, Sparkles, Layers } from 'lucide-react'
import type { ReadingInteractionType } from './types'
import { READING_TYPES } from './constants'

export interface ReadingTypeGridProps {
  selectedTypes: ReadingInteractionType[]
  onToggleType: (type: ReadingInteractionType) => void
  onSelectOnlyType: (type: ReadingInteractionType) => void
  onSelectMixPreset: (types: ReadingInteractionType[]) => void
}

const MIX_PRESETS: Array<{ label: string; types: ReadingInteractionType[] }> = [
  {
    label: 'IELTS Academic Mix',
    types: ['matching_heading', 'multiple_choice', 'true_false'],
  },
  {
    label: 'THPT QG Mix',
    types: ['multiple_choice', 'cloze'],
  },
  {
    label: 'Cambridge / KET Mix',
    types: ['true_false', 'short_answer'],
  },
  {
    label: 'Tất cả 6 dạng',
    types: ['multiple_choice', 'true_false', 'cloze', 'matching_heading', 'sentence_insertion', 'short_answer'],
  },
]

export default function ReadingTypeGrid({
  selectedTypes,
  onToggleType,
  onSelectOnlyType,
  onSelectMixPreset,
}: ReadingTypeGridProps) {
  const isMixed = selectedTypes.length > 1

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px] font-black">
            1
          </span>
          <span>Chọn định dạng câu hỏi (Có thể Mix nhiều dạng trong 1 bài đọc):</span>
        </label>

        <div className="flex items-center gap-1.5">
          {isMixed ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 animate-in fade-in">
              <Sparkles size={11} />
              <span>Đang Mix {selectedTypes.length} dạng câu hỏi</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              Đang chọn 1 dạng duy nhất
            </span>
          )}
        </div>
      </div>

      {/* Quick mix preset buttons */}
      <div className="flex items-center gap-1.5 flex-wrap pb-0.5">
        <span className="text-[10px] text-gray-400 font-semibold uppercase flex items-center gap-1 mr-1">
          <Layers size={11} /> Gợi ý Mix:
        </span>
        {MIX_PRESETS.map((preset) => {
          const isActive =
            preset.types.length === selectedTypes.length &&
            preset.types.every((t) => selectedTypes.includes(t))

          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onSelectMixPreset(preset.types)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border transition-all ${
                isActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {preset.label}
            </button>
          )
        })}

        {isMixed && (
          <button
            type="button"
            onClick={() => onSelectMixPreset(['multiple_choice'])}
            className="px-2 py-0.5 text-[10px] font-semibold text-gray-500 hover:text-indigo-600 transition-colors ml-auto underline"
          >
            Chỉ chọn 1 dạng trắc nghiệm
          </button>
        )}
      </div>

      {/* 6 Types Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {READING_TYPES.map((item) => {
          const isSelected = selectedTypes.includes(item.type)
          return (
            <div
              key={item.type}
              onClick={() => onToggleType(item.type)}
              className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer select-none ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-200 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="font-bold text-xs text-gray-800 line-clamp-1">
                  {item.title}
                </span>

                {/* Checkbox indicator */}
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && <Check size={11} strokeWidth={3} />}
                </div>
              </div>

              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="inline-block text-[10px] font-semibold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>

                {/* Quick link: Chỉ chọn dạng này */}
                {(!isSelected || isMixed) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectOnlyType(item.type)
                    }}
                    className="text-[10px] text-gray-400 hover:text-indigo-600 font-medium transition-colors"
                  >
                    Chỉ chọn dạng này
                  </button>
                )}
              </div>

              <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
