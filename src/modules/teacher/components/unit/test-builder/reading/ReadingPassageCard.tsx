'use client'

import React from 'react'
import { BookOpen, Trash2 } from 'lucide-react'
import ReadingPassageEditor from './ReadingPassageEditor'
import ReadingQuestionList from './ReadingQuestionList'
import type {
  ReadingPassageCardProps,
  ReadingQuestionExtended,
} from './types'

export default function ReadingPassageCard({
  passage,
  index,
  totalCount,
  isMiniChallenge,
  vocabItems = [],
  onUpdatePassage,
  onRemovePassage,
}: ReadingPassageCardProps) {
  // Cập nhật văn bản bài đọc
  const handleChangeText = (newText: string) => {
    onUpdatePassage({
      ...passage,
      text: newText,
    })
  }

  // Chèn vị trí đục lỗ (1)______, (2)______...
  const handleInsertBlank = () => {
    const existingMatches = passage.text.match(/\((\d+)\)/g) || []
    const nextNumber = existingMatches.length + 1
    const blankTag = `(${nextNumber})______ `
    const separator = passage.text.trim() ? ' ' : ''
    handleChangeText(passage.text + separator + blankTag)
  }

  // Chèn vị trí [A], [B], [C], [D] cho dạng chèn câu
  const handleInsertInsertionMarker = () => {
    const markers = ['[A]', '[B]', '[C]', '[D]']
    const existingCount = markers.filter((m) => passage.text.includes(m)).length
    if (existingCount < markers.length) {
      const nextMarker = markers[existingCount]
      const separator = passage.text.trim() ? ' ' : ''
      handleChangeText(`${passage.text + separator + nextMarker} `)
    }
  }

  // Cập nhật mảng câu hỏi của bài đọc này
  const handleUpdateQuestions = (newQuestions: ReadingQuestionExtended[]) => {
    onUpdatePassage({
      ...passage,
      questions: newQuestions,
    })
  }

  // Thêm nhanh 1 câu hỏi mới vào bài đọc này (Không mở modal, chọn định dạng trực tiếp tại câu hỏi)
  const handleAddQuestionDirectly = () => {
    const nextIndex = (passage.questions || []).length + 1
    const newQuestion: ReadingQuestionExtended = {
      id: crypto.randomUUID(),
      text: `Câu hỏi ${nextIndex}:`,
      options: ['', '', '', ''],
      correctIndex: 0,
      kind: 'multiple_choice',
    }
    handleUpdateQuestions([...(passage.questions || []), newQuestion])
  }

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 space-y-5 transition-all ${
        isMiniChallenge
          ? 'bg-orange-50/20 border-orange-200'
          : 'bg-white border-gray-200 shadow-xs'
      }`}
    >
      {/* Header của từng bài đọc */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
              isMiniChallenge
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-indigo-600 text-white shadow-xs'
            }`}
          >
            <BookOpen size={15} />
          </div>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={passage.title || `Bài đọc ${index + 1}`}
              onChange={(e) =>
                onUpdatePassage({
                  ...passage,
                  title: e.target.value,
                })
              }
              placeholder={`Bài đọc ${index + 1}...`}
              className={`w-full font-bold text-sm sm:text-base border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none transition-colors py-0.5 bg-transparent ${
                isMiniChallenge ? 'text-orange-950' : 'text-gray-900'
              }`}
            />
          </div>
        </div>

        {totalCount > 1 && (
          <button
            type="button"
            onClick={onRemovePassage}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            title="Xóa bài đọc này"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Soạn thảo nội dung đoạn văn */}
      <ReadingPassageEditor
        text={passage.text || ''}
        isMiniChallenge={isMiniChallenge}
        vocabItems={vocabItems}
        onChangeText={handleChangeText}
        onInsertBlank={handleInsertBlank}
        onInsertInsertionMarker={handleInsertInsertionMarker}
      />

      {/* Danh sách câu hỏi của bài đọc này */}
      <ReadingQuestionList
        questions={passage.questions || []}
        isMiniChallenge={isMiniChallenge}
        onUpdateQuestions={handleUpdateQuestions}
        onAddQuestion={handleAddQuestionDirectly}
      />
    </div>
  )
}
