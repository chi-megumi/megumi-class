'use client'

import React from 'react'
import { RotateCcw, Sparkles, GraduationCap } from 'lucide-react'
import ValidatedNumberInput from '@/components/common/ValidatedNumberInput'
import { TARGET_LEVEL_PRESETS } from './constants'

export interface ReadingPromptConfigBarProps {
  numPassages: number
  onNumPassagesChange: (val: number) => void
  wordCount: number
  onWordCountChange: (val: number) => void
  numQuestions: number
  onNumQuestionsChange: (val: number) => void
  isQuestionsCustomized: boolean
  onResetQuestionsToAuto: () => void
  targetLevel: string
  onTargetLevelChange: (level: string) => void
}

const WORD_COUNT_PRESETS = [
  { label: '150 từ (Ngắn)', value: 150 },
  { label: '200 từ (Chuẩn)', value: 200 },
  { label: '350 từ (Vừa)', value: 350 },
  { label: '500 từ (Dài/TOEIC)', value: 500 },
]

const QUESTION_PRESETS = [3, 4, 6, 8, 10]
const PASSAGE_PRESETS = [1, 2, 3]

export default function ReadingPromptConfigBar({
  numPassages,
  onNumPassagesChange,
  wordCount,
  onWordCountChange,
  numQuestions,
  onNumQuestionsChange,
  isQuestionsCustomized,
  onResetQuestionsToAuto,
  targetLevel,
  onTargetLevelChange,
}: ReadingPromptConfigBarProps) {
  return (
    <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 border border-indigo-100/90 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles size={13} />
          </div>
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Tùy chỉnh thông số sinh bài đọc & câu hỏi
          </span>
        </div>
        <span className="text-[11px] text-gray-500 font-medium">
          Mặc định chuẩn khảo thí ~50 từ / câu hỏi
        </span>
      </div>

      {/* 1. Mức độ & Đối tượng học sinh (Target Level / Exam / Band) */}
      <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-1">
          <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <GraduationCap size={15} className="text-indigo-600" />
            <span>Trình độ mục tiêu & Kỳ thi:</span>
          </label>
          <span className="text-[10px] text-gray-400">
            Chọn nhanh hoặc tự gõ band điểm / lớp cụ thể
          </span>
        </div>

        {/* Input tùy chỉnh trực tiếp */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={targetLevel}
            onChange={(e) => onTargetLevelChange(e.target.value)}
            placeholder="VD: IELTS 6.5, TOEIC 750, Tiểu học (Lớp 4), THPT QG..."
            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-medium text-gray-800 text-xs transition-all placeholder:text-gray-400"
          />
          {targetLevel && (
            <button
              type="button"
              onClick={() => onTargetLevelChange('')}
              className="px-2 py-1 text-[11px] text-gray-400 hover:text-red-500 rounded font-medium transition-colors"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Quick chips presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {TARGET_LEVEL_PRESETS.map((preset) => {
            const isMatch = targetLevel === preset.label
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onTargetLevelChange(preset.label)
                  if (!isQuestionsCustomized) {
                    onWordCountChange(preset.suggestedWords)
                  }
                }}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all ${
                  isMatch
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                    : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                }`}
                title={preset.description}
              >
                {preset.badge}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Grid 3 cột thông số (Passages / Word Count / Question Count) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* Số bài đọc */}
        <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Số bài đọc (Passages)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <ValidatedNumberInput
                min={1}
                max={5}
                value={numPassages}
                onChange={onNumPassagesChange}
                className="w-16 px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-bold text-center text-gray-800 text-xs transition-all"
                ariaLabel="Số bài đọc"
              />
              <span className="text-xs text-gray-500 font-medium">bài</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PASSAGE_PRESETS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => onNumPassagesChange(count)}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all ${
                  numPassages === count
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {count} bài
              </button>
            ))}
          </div>
        </div>

        {/* Độ dài mỗi bài đọc */}
        <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">
                Độ dài mỗi bài đọc
              </label>
              <span className="text-[10px] text-gray-400 font-normal">
                80 - 1500 từ
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <ValidatedNumberInput
                min={80}
                max={1500}
                value={wordCount}
                onChange={onWordCountChange}
                className="w-20 px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-bold text-center text-gray-800 text-xs transition-all"
                ariaLabel="Số từ trong bài đọc"
              />
              <span className="text-xs text-gray-500 font-medium">từ / bài</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {WORD_COUNT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => onWordCountChange(preset.value)}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all ${
                  wordCount === preset.value
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Số câu hỏi mỗi bài */}
        <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700">
                Số câu hỏi mỗi bài
              </label>
              {isQuestionsCustomized ? (
                <button
                  type="button"
                  onClick={onResetQuestionsToAuto}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  title="Khôi phục tính tự động theo số từ"
                >
                  <RotateCcw size={10} />
                  <span>Tự tính lại</span>
                </button>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Tự tính (~50 từ/câu)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <ValidatedNumberInput
                min={2}
                max={20}
                value={numQuestions}
                onChange={onNumQuestionsChange}
                className="w-16 px-2.5 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-bold text-center text-gray-800 text-xs transition-all"
                ariaLabel="Số câu hỏi"
              />
              <span className="text-xs text-gray-500 font-medium">câu / bài</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {QUESTION_PRESETS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => onNumQuestionsChange(count)}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all ${
                  numQuestions === count
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {count} câu
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary pill */}
      <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-indigo-100/60 text-indigo-900 border border-indigo-200/70 font-medium flex-wrap gap-1">
        <span>
          Mục tiêu: <strong>{targetLevel || 'Phổ thông chuẩn'}</strong> • <strong>{numPassages}</strong> bài đọc &times;{' '}
          <strong>{numQuestions}</strong> câu hỏi ={' '}
          <strong>{numPassages * numQuestions}</strong> câu hỏi tổng cộng
        </span>
        <span className="text-[11px] text-indigo-700 font-semibold">
          ~{wordCount} từ/bài
        </span>
      </div>
    </div>
  )
}
