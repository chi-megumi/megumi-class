'use client'

import React from 'react'
import { CheckCircle2, X, HelpCircle } from 'lucide-react'
import { getActiveQuestionOptions } from '@/modules/teacher/utils/questionUtils'
import { normalizeSentence } from '@/actions/analytics/grading'
import type { ReadingQuestionItemViewProps, ReadingQuestionKind } from './types'

function getKindBadge(kind?: ReadingQuestionKind | string) {
  switch (kind) {
    case 'true_false':
      return {
        label: 'True / False / Not Given',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
      }
    case 'cloze_choice':
    case 'cloze_text':
      return {
        label: 'Đục lỗ điền từ',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      }
    case 'matching_heading':
      return {
        label: 'Ghép tiêu đề',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      }
    case 'sentence_insertion':
      return {
        label: 'Chèn câu',
        className: 'bg-purple-50 text-purple-700 border-purple-200',
      }
    case 'short_answer':
      return {
        label: 'Trả lời ngắn',
        className: 'bg-teal-50 text-teal-700 border-teal-200',
      }
    case 'multiple_choice':
    default:
      return {
        label: 'Trắc nghiệm (A-D)',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      }
  }
}

export default function ReadingQuestionItemView({
  question,
  index,
  answers = {},
  isMiniChallenge,
  isReviewMode,
  result,
  onAnswer,
  viewMode = 'student',
}: ReadingQuestionItemViewProps) {
  const kind = (question.kind || 'multiple_choice') as ReadingQuestionKind
  const kindBadge = getKindBadge(kind)
  const displayOptions = getActiveQuestionOptions(question.options)
  const isMultipleChoice = displayOptions.length > 0
  const isTwoOptions = displayOptions.length <= 2
  const studentAns = answers[question.id]

  // Kiểm tra kết quả trong Review Mode
  const correctDetail = result?.correctAnswersDetail?.[question.id]
  const hasResult = result !== null && correctDetail !== undefined

  // Teacher mode: luôn hiện đáp án đúng
  const isTeacherView = viewMode === 'teacher'

  return (
    <div className="space-y-3 p-3.5 sm:p-4 rounded-xl bg-white border border-gray-200 shadow-2xs hover:border-gray-300 transition-all">
      {/* Tiêu đề câu hỏi + Badge phân loại */}
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs sm:text-sm font-bold text-gray-800 leading-snug flex items-start gap-2 min-w-0">
          <span className="w-5 h-5 rounded-md bg-indigo-50 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-indigo-100">
            {index + 1}
          </span>
          <span className="pt-0.5">{question.text}</span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${kindBadge.className}`}
        >
          {kindBadge.label}
        </span>
      </div>

      {/* Nếu là dạng chèn câu, hiển thị câu văn cần chèn */}
      {question.sentence && (
        <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-950 font-medium space-y-0.5">
          <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 block">
            💬 Câu văn cần chèn vào bài đọc:
          </span>
          <p className="italic font-semibold">&ldquo;{question.sentence}&rdquo;</p>
        </div>
      )}

      {/* Dạng trắc nghiệm hoặc lựa chọn */}
      {isMultipleChoice ? (
        <div
          className={`grid gap-1.5 pt-1 ${
            isTwoOptions ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {displayOptions.map((opt) => {
            const oIdx = opt.index
            const isSelected = studentAns === oIdx
            const correctOptIdx = isTeacherView ? (question.correctIndex ?? 0) : Number(correctDetail)
            const isCorrectAnswer = correctOptIdx === oIdx
            const showCorrect = (isTeacherView || (isReviewMode && hasResult)) && isCorrectAnswer
            const showIncorrect = !isTeacherView && isReviewMode && hasResult && isSelected && !isCorrectAnswer

            if (isTeacherView) {
              return (
                <div
                  key={opt.label}
                  className={`flex items-start sm:items-center gap-2.5 p-2 sm:p-2.5 rounded-lg border text-xs sm:text-sm transition-all ${
                    isCorrectAnswer
                      ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950 font-semibold shadow-2xs ring-1 ring-emerald-200'
                      : 'border-gray-100 bg-gray-50/50 text-gray-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCorrectAnswer
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="flex-1 leading-snug">{opt.text}</span>
                  {isCorrectAnswer && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-700" />
                      <span>Đáp án đúng</span>
                    </span>
                  )}
                </div>
              )
            }

            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => onAnswer?.(question.id, oIdx)}
                disabled={isReviewMode}
                className={`flex items-start sm:items-center gap-2.5 py-2 px-2.5 rounded-lg border text-left transition-colors duration-150 min-h-[38px] ${
                  showCorrect
                    ? 'border-green-500 bg-green-50 ring-1 ring-green-300 text-green-950 font-medium'
                    : showIncorrect
                      ? 'border-red-500 bg-red-50 ring-1 ring-red-300 text-red-950'
                      : isSelected
                        ? isMiniChallenge
                          ? 'border-orange-500 bg-orange-50/70 ring-1 ring-orange-300 text-orange-950 font-medium'
                          : 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-300 text-indigo-950 font-medium'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-800'
                } ${isReviewMode ? 'cursor-default' : ''}`}
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 ${
                    showCorrect
                      ? 'border-green-500 bg-green-500 text-white'
                      : showIncorrect
                        ? 'border-red-500 bg-red-500 text-white'
                        : isSelected
                          ? isMiniChallenge
                            ? 'border-orange-500'
                            : 'border-indigo-500'
                          : 'border-gray-300'
                  }`}
                >
                  {showCorrect ? (
                    <CheckCircle2 size={10} />
                  ) : showIncorrect ? (
                    <X size={10} />
                  ) : (
                    isSelected && (
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isMiniChallenge ? 'bg-orange-500' : 'bg-indigo-500'
                        }`}
                      />
                    )
                  )}
                </div>
                <span className="font-bold text-gray-500 text-xs shrink-0">{opt.label}.</span>
                <span className="font-medium text-xs flex-1">{opt.text}</span>
              </button>
            )
          })}
        </div>
      ) : (
        /* Dạng tự gõ đáp án (Short answer / Cloze text) */
        <div className="pt-1 space-y-1.5">
          {isTeacherView ? (
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                <span>Đáp án đúng được chấp nhận:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {String(question.answer || '')
                  .split('|')
                  .map((ans, aIdx) => (
                    <span
                      key={aIdx}
                      className="px-2 py-0.5 bg-white rounded border border-emerald-300 text-emerald-950 font-bold text-xs"
                    >
                      {ans.trim()}
                    </span>
                  ))}
              </div>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={studentAns ? String(studentAns) : ''}
                onChange={(e) => onAnswer?.(question.id, e.target.value)}
                disabled={isReviewMode}
                placeholder="Gõ câu trả lời của bạn..."
                className={`w-full p-2.5 rounded-lg border text-xs sm:text-sm focus:outline-none transition-all ${
                  isReviewMode && hasResult
                    ? (() => {
                        const acceptable = String(correctDetail || '')
                          .split('|')
                          .map((s) => normalizeSentence(s))
                          .filter(Boolean)
                        const isRight = acceptable.includes(
                          normalizeSentence(String(studentAns || '')),
                        )
                        return isRight
                          ? 'border-green-500 bg-green-50/50 text-green-900 font-semibold'
                          : 'border-red-500 bg-red-50/50 text-red-900 font-semibold'
                      })()
                    : 'border-gray-200 bg-white focus:border-indigo-500'
                }`}
              />

              {isReviewMode && hasResult && (
                <div className="text-[11px] text-gray-600">
                  Đáp án đúng:{' '}
                  <span className="font-bold text-green-700">
                    {String(correctDetail || '').replace(/\|/g, ' hoặc ')}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Hiển thị giải thích trong Teacher Mode hoặc Review Mode */}
      {(isTeacherView || (isReviewMode && question.explanation)) && question.explanation && (
        <div className="mt-1.5 p-2 rounded-lg bg-gray-50 border border-gray-100 flex items-start gap-1.5 text-xs text-gray-600">
          <HelpCircle size={14} className="text-gray-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-gray-700 text-[11px] block">
              💡 Dẫn chứng & Giải thích:
            </span>
            <p className="leading-relaxed">{question.explanation}</p>
          </div>
        </div>
      )}
    </div>
  )
}
