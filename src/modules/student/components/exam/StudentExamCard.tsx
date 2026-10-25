'use client'

import React from 'react'
import { Clock, FileText, CheckCircle2, RotateCcw, ChevronRight } from 'lucide-react'
import type { ExamData } from '@/modules/teacher/types'
import type { TestResultPayload } from '@/actions/analytics/types'

export type StudentExamCardProps = {
  test: ExamData
  testResult?: TestResultPayload
  isStarting?: boolean
  startLabel?: string
  description?: string
  onSelect: (test: ExamData) => void
  onRetake?: (test: ExamData) => void
  className?: string
}

export default function StudentExamCard({
  test,
  testResult,
  isStarting = false,
  startLabel = 'Bắt đầu thi',
  description,
  onSelect,
  onRetake,
  className = '',
}: StudentExamCardProps) {
  const isCompleted = !!testResult?.completedAt
  const isInProgress = !!testResult?.startedAt && !isCompleted
  const attemptCount = Math.max(testResult?.attemptCount || 0, testResult?.history?.length || 0)

  const handleClick = () => {
    if (isStarting) return
    onSelect(test)
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-gradient-to-b from-white to-gray-50/50 border rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between ${
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/20 shadow-sm hover:shadow-md cursor-pointer hover:border-emerald-300'
          : isInProgress
            ? 'border-amber-300 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-amber-50/20 ring-2 ring-amber-400/20'
            : 'border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 cursor-pointer'
      } ${className}`}
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span
          className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
            test.isRetakable
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : isCompleted
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : isInProgress
                  ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
          }`}
        >
          {test.isRetakable
            ? 'Luyện tập'
            : isCompleted
              ? 'Đã hoàn thành'
              : isInProgress
                ? 'Đang làm dở'
                : 'Đợt thi chính thức'}
        </span>
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-100 shadow-2xs">
          <Clock size={14} className="text-indigo-500" />
          {test.duration || 15} phút
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
            <FileText size={16} />
          </div>
          <h3 className="font-extrabold text-gray-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {test.title || 'Bài kiểm tra'}
          </h3>
        </div>

        <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
          {description ||
            (test.isRetakable
              ? 'Đề thi tự do: Bạn có thể thi lại nhiều lần để nâng cao thành tích.'
              : 'Lưu ý: Chỉ làm được 1 lần duy nhất, kết quả sẽ gửi thẳng đến giáo viên.')}
        </p>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
        {isCompleted ? (
          <>
            <div className="flex flex-col items-start justify-between gap-1.5 flex-wrap">
              <span className="text-emerald-700 font-extrabold text-sm bg-emerald-100/70 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                {Math.round(testResult?.score || 0)}/100 điểm
              </span>
              {attemptCount > 1 && (
                <span className="text-indigo-700 font-bold text-xs bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200">
                  {attemptCount} lượt làm
                </span>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              {test.isRetakable && onRetake && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRetake(test)
                  }}
                  disabled={isStarting}
                  className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Làm lại bài ngay (đề sẽ được xáo trộn)"
                >
                  <RotateCcw size={12} />
                  <span>Làm lại</span>
                </button>
              )}
              <span className="text-indigo-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Xem lại bài <ChevronRight size={14} />
              </span>
            </div>
          </>
        ) : isInProgress ? (
          <>
            <span className="text-amber-700 font-bold text-xs bg-amber-100/70 px-2.5 py-1.5 rounded-lg">
              Chưa nộp bài
            </span>
            <span className="text-amber-700 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Tiếp tục làm <ChevronRight size={16} />
            </span>
          </>
        ) : (
          <>
            <span className="text-gray-400 font-medium text-xs">Chưa bắt đầu</span>
            <span className="text-indigo-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {startLabel} <ChevronRight size={16} />
            </span>
          </>
        )}
      </div>
    </div>
  )
}
