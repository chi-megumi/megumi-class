'use client'

import React from 'react'
import { ClipboardCheck } from 'lucide-react'
import type { ExamData } from '@/modules/teacher/types'
import type { TestResultPayload } from '@/actions/analytics/types'
import StudentExamCard from '../exam/StudentExamCard'

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
        {publishedExams.map((test) => (
          <StudentExamCard
            key={test.id}
            test={test}
            testResult={getExamResult(test)}
            isStarting={isStartingTest}
            startLabel="Bắt đầu làm bài"
            onSelect={onSelectTest}
            onRetake={onRetakeTest}
          />
        ))}
      </div>
    </div>
  )
}
