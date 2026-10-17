'use client'

import React from 'react'
import { Clock, Eye, ChevronRight } from 'lucide-react'
import type { ExamData, ExamResultData } from '@/modules/teacher/types'

type ExamAnalyticsCardProps = {
  exam: ExamData
  totalStudents: number
  onViewExamResults?: (exam: ExamData) => void
}

export default function ExamAnalyticsCard({
  exam,
  totalStudents,
  onViewExamResults,
}: ExamAnalyticsCardProps) {
  const completedResults = (exam.results || []).filter((r: ExamResultData) => r.completedAt)
  const submissionsCount = completedResults.length
  const scores = completedResults.map((r: ExamResultData) => r.score ?? 0)
  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0
  const max = scores.length > 0 ? Math.max(...scores) : 0
  const min = scores.length > 0 ? Math.min(...scores) : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                exam.isPublished ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            />
            <h5 className="font-bold text-gray-900 text-sm">{exam.title}</h5>
          </div>
          <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shrink-0">
            <Clock size={12} />
            {exam.duration} phút
          </span>
        </div>

        {/* Metric summary */}
        <div className="grid grid-cols-3 gap-2 mt-4 bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Đã nộp bài
            </p>
            <p className="text-base font-black text-gray-800 mt-0.5">
              {submissionsCount}
              <span className="text-xs font-normal text-gray-400">/{totalStudents}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Điểm TB</p>
            <p className="text-base font-black text-indigo-600 mt-0.5">
              {submissionsCount > 0 ? `${avg}đ` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Cao / Thấp
            </p>
            <p className="text-base font-black text-emerald-600 mt-0.5">
              {submissionsCount > 0 ? `${max} / ${min}` : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {submissionsCount === totalStudents
            ? '100% học sinh đã hoàn thành'
            : `${totalStudents - submissionsCount} học sinh chưa nộp`}
        </span>

        {onViewExamResults && (
          <button
            onClick={() => onViewExamResults(exam)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
          >
            <Eye size={14} />
            <span>Xem chi tiết</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
