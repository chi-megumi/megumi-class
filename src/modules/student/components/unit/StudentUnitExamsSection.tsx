'use client'

import React from 'react'
import {
  ClipboardCheck,
  RotateCcw,
  Clock,
  FileText,
  Zap,
  ChevronRight,
} from 'lucide-react'
import type { ExamData } from '~/modules/teacher/types'
import type { TestResultPayload } from '@/actions/analytics/types'

type StudentUnitExamsSectionProps = {
  exams: ExamData[]
  getExamResult: (test: ExamData) => TestResultPayload | undefined
  isStartingTest: boolean
  onSelectTest: (test: ExamData) => void
  onRetakeTest: (test: ExamData) => void
}

export default function StudentUnitExamsSection({
  exams,
  getExamResult,
  isStartingTest,
  onSelectTest,
  onRetakeTest,
}: StudentUnitExamsSectionProps) {
  const publishedExams = exams.filter((t) => t.isEnabled && t.isPublished)

  if (publishedExams.length === 0) return null

  return (
    <div className="mb-16 print:hidden">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <ClipboardCheck size={28} className="text-indigo-600 shrink-0" />
          Bài kiểm tra (Tests)
        </h2>
        <div className="text-sm font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          {publishedExams.length} bài thi
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publishedExams.map((test) => {
          const testResult = getExamResult(test)
          const isCompleted = !!testResult?.completedAt
          const isInProgress = !!testResult?.startedAt && !isCompleted

          return (
            <div
              key={test.id}
              className={`group relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm transition-all duration-300 ${
                isCompleted
                  ? 'opacity-80 cursor-pointer'
                  : 'hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-2 cursor-pointer'
              }`}
              onClick={() => onSelectTest(test)}
            >
              {test.isRetakable ? (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-2 flex items-center gap-1">
                  <RotateCcw size={12} /> LUYỆN TẬP
                </div>
              ) : test.duration <= 15 ? (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-3 group-hover:-rotate-12 transition-transform flex items-center gap-1">
                  <span>MINI THỬ THÁCH</span>
                  <Zap size={12} className="text-amber-200 fill-amber-200" />
                </div>
              ) : (
                <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-6">
                  QUAN TRỌNG
                </div>
              )}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform ${
                  test.isRetakable
                    ? 'bg-emerald-50 text-emerald-600'
                    : test.duration <= 15
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-red-50 text-red-600'
                }`}
              >
                {test.isRetakable ? (
                  <RotateCcw size={28} />
                ) : test.duration <= 15 ? (
                  <Clock size={28} />
                ) : (
                  <FileText size={28} />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {test.title || 'Bài Kiểm Tra'}
              </h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                Thời gian: {test.duration} phút.{' '}
                {isCompleted
                  ? 'Đã hoàn thành.'
                  : test.isRetakable
                    ? 'Có thể làm lại nhiều lần để ôn tập.'
                    : 'Hãy tập trung làm bài thật tốt nhé!'}
              </p>

              <div className="flex items-center justify-between mt-auto">
                {isCompleted ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-green-600 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                      Điểm: {Math.round(testResult.score || 0)}/100
                    </span>
                    <div className="flex items-center gap-2">
                      {test.isRetakable && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRetakeTest(test)
                          }}
                          disabled={isStartingTest}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 shadow-2xs"
                          title="Làm lại bài ngay (đề sẽ được xáo trộn)"
                        >
                          <RotateCcw size={12} />
                          <span>Làm lại</span>
                        </button>
                      )}
                      <span className="text-indigo-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Xem đáp án <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                ) : (
                  <span
                    className={`font-bold text-sm flex items-center gap-1 group-hover:translate-x-2 transition-transform ${
                      test.isRetakable
                        ? 'text-emerald-600'
                        : test.duration <= 15
                          ? 'text-orange-600'
                          : 'text-red-600'
                    }`}
                  >
                    {isInProgress ? 'Tiếp tục làm bài' : 'Bắt đầu làm bài'}{' '}
                    <ChevronRight size={16} />
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
