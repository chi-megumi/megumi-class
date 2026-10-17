'use client'

import React from 'react'
import { CheckCircle2, Clock, Calendar } from 'lucide-react'
import { formatDateTime } from '@/modules/teacher/utils/date'
import BlockAnswerReview from './BlockAnswerReview'
import type { ExamData, TestBlock, TestContent } from '@/modules/teacher/types'
import type { Submission } from './types'

type SubmissionDetailViewProps = {
  submission: Submission | null
  testData: ExamData | TestContent
}

export default function SubmissionDetailView({
  submission,
  testData,
}: SubmissionDetailViewProps) {
  if (!submission) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <CheckCircle2 size={48} className="mb-4 opacity-20" />
        <p>Chọn một học sinh bên trái để xem chi tiết bài làm.</p>
      </div>
    )
  }

  const dt = formatDateTime(submission.result.completedAt)
  const blocks = (('content' in testData && testData.content) ||
    ('blocks' in testData && testData.blocks) ||
    []) as TestBlock[]

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl font-bold text-indigo-600 border border-indigo-100">
            {submission.result.score}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-base">{submission.user.name}</p>
            <p className="text-sm text-gray-500">
              Đúng {submission.result.correctAnswers}/{submission.result.totalQuestions} câu
            </p>
          </div>
        </div>
        {dt && (
          <div className="text-right text-xs sm:text-sm bg-white px-3.5 py-2 rounded-xl border border-gray-200/80 shadow-2xs flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock size={14} className="text-indigo-600 shrink-0" />
              <span>Nộp lúc:</span>
              <span className="font-bold text-gray-900">{dt.timeWithSeconds}</span>
            </div>
            <span className="text-gray-300 font-bold">•</span>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar size={14} className="text-indigo-600 shrink-0" />
              <span>Ngày:</span>
              <span className="font-bold text-gray-900">{dt.date}</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-gray-700">Chi tiết đáp án:</h4>
        {blocks.map((block: TestBlock, index: number) => (
          <BlockAnswerReview
            key={block.id}
            block={block}
            index={index}
            submission={submission}
          />
        ))}
      </div>
    </div>
  )
}
