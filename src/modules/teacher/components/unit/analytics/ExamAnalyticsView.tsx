'use client'

import React from 'react'
import { ClipboardList } from 'lucide-react'
import ExamAnalyticsCard from './ExamAnalyticsCard'
import type { ExamData } from '@/modules/teacher/types'

type ExamAnalyticsViewProps = {
  exams: ExamData[]
  totalStudents: number
  onViewExamResults?: (exam: ExamData) => void
}

export default function ExamAnalyticsView({
  exams,
  totalStudents,
  onViewExamResults,
}: ExamAnalyticsViewProps) {
  const publishedExams = exams.filter((e) => e.isPublished)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header info */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900">Danh sách bài kiểm tra trong Unit</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Theo dõi kết quả điểm số, số lượt nộp bài và phân tích thống kê từng bài thi.
          </p>
        </div>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-100">
          {publishedExams.length} bài thi đang mở
        </span>
      </div>

      {/* Exams Grid */}
      {exams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center">
          <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-bold text-gray-600">
            Chưa có bài kiểm tra nào trong Unit này
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Chuyển sang tab &quot;Hoạt động &amp; Trò chơi&quot; để tạo bài kiểm tra hoặc đề thi AI.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <ExamAnalyticsCard
              key={exam.id}
              exam={exam}
              totalStudents={totalStudents}
              onViewExamResults={onViewExamResults}
            />
          ))}
        </div>
      )}
    </div>
  )
}
