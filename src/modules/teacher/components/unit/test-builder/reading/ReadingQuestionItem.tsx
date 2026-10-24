'use client'

import React from 'react'
import { Trash2, HelpCircle } from 'lucide-react'
import type { ReadingQuestionItemProps, ReadingQuestionKind } from './types'

export default function ReadingQuestionItem({
  question,
  index,
  isMiniChallenge,
  onChangeQuestionText,
  onChangeKind,
  onChangeOptions,
  onChangeCorrectIndex,
  onChangeAnswerText,
  onChangeSentenceToInsert,
  onChangeExplanation,
  onRemove,
}: ReadingQuestionItemProps) {
  const kind: ReadingQuestionKind = question.kind || 'multiple_choice'
  const isShortAnswer = kind === 'short_answer' || kind === 'cloze_text'
  const isSentenceInsertion = kind === 'sentence_insertion'
  const options = question.options && question.options.length > 0 ? question.options : ['', '', '', '']

  // Đổi preset sang 4 đáp án A-D
  const handleSetFourOptions = () => {
    onChangeKind('multiple_choice')
    const current = [...options]
    while (current.length < 4) current.push('')
    onChangeOptions(current.slice(0, 4))
  }

  // Đổi preset sang True / False / Not Given
  const handleSetTrueFalseNotGiven = () => {
    onChangeKind('true_false')
    onChangeOptions(['True', 'False', 'Not Given'])
    if ((question.correctIndex ?? 0) >= 3) onChangeCorrectIndex(0)
  }

  // Đổi preset sang Đúng / Sai
  const handleSetTrueFalse = () => {
    onChangeKind('true_false')
    onChangeOptions(['Đúng', 'Sai'])
    if ((question.correctIndex ?? 0) >= 2) onChangeCorrectIndex(0)
  }

  // Đổi preset sang Chèn câu [A]-[D]
  const handleSetSentenceInsertion = () => {
    onChangeKind('sentence_insertion')
    onChangeOptions(['[A]', '[B]', '[C]', '[D]'])
  }

  // Đổi preset sang Tự gõ đáp án
  const handleSetShortAnswer = () => {
    onChangeKind('short_answer')
  }

  return (
    <div
      className={`p-4 rounded-xl border relative space-y-3.5 transition-all ${
        isMiniChallenge
          ? 'bg-gradient-to-br from-orange-50/20 to-pink-50/20 border-orange-100 shadow-xs'
          : 'bg-white border-gray-200 shadow-xs'
      }`}
    >
      {/* Hàng tiêu đề câu hỏi & nút xóa */}
      <div className="flex items-start gap-3">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-1 ${
            isMiniChallenge
              ? 'bg-orange-100 text-orange-700'
              : 'bg-indigo-50 text-indigo-700'
          }`}
        >
          {index + 1}
        </div>

        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={question.text || ''}
            onChange={(e) => onChangeQuestionText(e.target.value)}
            placeholder="Nhập câu hỏi (VD: What is the main idea? hoặc Chọn từ cho vị trí (1)...)"
            className={`w-full font-medium text-sm sm:text-base border-b focus:outline-none pb-1.5 bg-transparent transition-colors ${
              isMiniChallenge
                ? 'text-orange-950 border-orange-200 focus:border-orange-500'
                : 'text-gray-900 border-gray-200 focus:border-indigo-500'
            }`}
          />

          {/* Nếu là dạng chèn câu, hiển thị thêm ô nhập câu văn cần chèn */}
          {isSentenceInsertion && (
            <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                Câu văn độc lập cần chèn vào bài đọc:
              </span>
              <input
                type="text"
                value={question.sentence || ''}
                onChange={(e) => onChangeSentenceToInsert(e.target.value)}
                placeholder="Nhập câu văn cần chèn (VD: This remarkable discovery changed our view...)"
                className="w-full text-xs sm:text-sm bg-white p-2 rounded border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          title="Xóa câu hỏi này"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Thanh chọn nhanh kiểu đáp án (Presets) */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-gray-100 text-xs">
        <span className="text-gray-400 text-[11px] font-medium mr-1">Định dạng:</span>
        <button
          type="button"
          onClick={handleSetFourOptions}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
            kind === 'multiple_choice' || kind === 'matching_heading' || kind === 'cloze_choice'
              ? isMiniChallenge
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-indigo-600 text-white shadow-xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          4 đáp án (A-D)
        </button>

        <button
          type="button"
          onClick={handleSetTrueFalseNotGiven}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
            kind === 'true_false' && options.length === 3
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          ⚡ True/False/NG
        </button>

        <button
          type="button"
          onClick={handleSetTrueFalse}
          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
        >
          ⚡ Đúng / Sai
        </button>

        <button
          type="button"
          onClick={handleSetSentenceInsertion}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
            isSentenceInsertion
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          ⚡ Chèn câu [A]-[D]
        </button>

        <button
          type="button"
          onClick={handleSetShortAnswer}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
            isShortAnswer
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
          }`}
        >
          ⚡ Tự gõ đáp án
        </button>
      </div>

      {/* Khu vực nhập lựa chọn đáp án */}
      {isShortAnswer ? (
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
            <span>Đáp án đúng (chuẩn hóa không phân biệt hoa thường):</span>
          </label>
          <input
            type="text"
            value={question.answer || ''}
            onChange={(e) => onChangeAnswerText(e.target.value)}
            placeholder="VD: sustainable development (có thể nhập nhiều đáp án ngăn cách bởi dấu |)"
            className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200"
          />
          <p className="text-[11px] text-gray-400">
            Học sinh gõ đúng 1 trong các đáp án này sẽ được tính điểm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {options.map((opt, oIdx) => {
            const letter = String.fromCharCode(65 + oIdx)
            const isCorrect = (question.correctIndex ?? 0) === oIdx

            return (
              <div
                key={`${question.id}-opt-${oIdx}`}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  isCorrect
                    ? 'border-emerald-400 bg-emerald-50/50 ring-1 ring-emerald-200'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={isCorrect}
                  onChange={() => onChangeCorrectIndex(oIdx)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0 cursor-pointer"
                  title="Chọn làm đáp án đúng"
                />
                <span className="text-xs font-bold text-gray-500 shrink-0">{letter}.</span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...options]
                    newOpts[oIdx] = e.target.value
                    onChangeOptions(newOpts)
                  }}
                  placeholder={`Đáp án ${letter}...`}
                  className="flex-1 text-xs sm:text-sm bg-transparent border-0 focus:outline-none text-gray-800"
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Ô nhập giải thích (Explanation) */}
      <div className="pt-1 flex items-center gap-2">
        <HelpCircle size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={question.explanation || ''}
          onChange={(e) => onChangeExplanation(e.target.value)}
          placeholder="Giải thích đáp án (tùy chọn - hiển thị sau khi học sinh nộp bài)..."
          className="flex-1 text-xs text-gray-600 bg-transparent border-b border-dashed border-gray-200 focus:outline-none focus:border-indigo-400 py-1"
        />
      </div>
    </div>
  )
}
