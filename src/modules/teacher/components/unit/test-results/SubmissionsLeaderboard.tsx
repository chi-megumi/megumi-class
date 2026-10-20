'use client'

import React from 'react'
import Image from 'next/image'
import { Award, Clock, Calendar } from 'lucide-react'
import { formatDateTime } from '@/modules/teacher/utils/date'
import type { Submission } from './types'
import { SubmissionsLeaderboardSkeleton } from './loading/TestResultsSkeleton'

type SubmissionsLeaderboardProps = {
  submissions: Submission[]
  selectedSubmission: Submission | null
  onSelectSubmission: (submission: Submission) => void
  isLoading: boolean
  error: string | null
}

export default function SubmissionsLeaderboard({
  submissions,
  selectedSubmission,
  onSelectSubmission,
  isLoading,
  error,
}: SubmissionsLeaderboardProps) {
  return (
    <div className="w-full md:w-1/3 flex flex-col gap-3 md:border-r border-gray-100 md:pr-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
          <Award size={16} className="text-amber-500" /> Bảng xếp hạng nộp bài
        </h3>
        <span className="text-xs font-semibold text-gray-400">{submissions.length} em</span>
      </div>

      {isLoading ? (
        <SubmissionsLeaderboardSkeleton count={5} />
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-6">
          <Award className="mx-auto text-gray-300 mb-2" size={32} />
          <p className="text-sm font-semibold">Chưa có học sinh nào nộp bài</p>
          <p className="text-xs text-gray-400 mt-1">
            Khi học sinh làm bài xong, bảng xếp hạng sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
          {submissions.map((sub, index) => {
            const isTop1 = index === 0
            const isTop2 = index === 1
            const isTop3 = index === 2
            const isSelected = selectedSubmission?.user.id === sub.user.id
            const dt = formatDateTime(sub.result.completedAt)

            return (
              <button
                key={sub.user.id}
                onClick={() => onSelectSubmission(sub)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left relative overflow-hidden ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/80 shadow-xs'
                    : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50/80'
                }`}
              >
                {/* Rank Badge */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                    isTop1
                      ? 'bg-gradient-to-br from-amber-300 to-yellow-500 text-white'
                      : isTop2
                        ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800'
                        : isTop3
                          ? 'bg-gradient-to-br from-amber-600 to-orange-500 text-white'
                          : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${index + 1}`}
                </div>

                <div className="w-9 h-9 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center overflow-hidden font-bold text-indigo-700 text-xs">
                  {sub.user.avatarUrl ? (
                    <Image
                      src={sub.user.avatarUrl}
                      alt={sub.user.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    sub.user.name.charAt(0)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{sub.user.name}</p>
                  {!dt ? (
                    <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                      <Clock size={11} /> Chưa có giờ nộp
                    </p>
                  ) : (
                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <Clock size={11} className="text-indigo-500 shrink-0" />
                        {dt.timeWithSeconds}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="flex items-center gap-1 font-medium text-gray-500">
                        <Calendar size={11} className="text-indigo-400 shrink-0" />
                        {dt.date}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-black text-sm ${
                      sub.result.score >= 80
                        ? 'text-emerald-600'
                        : sub.result.score >= 50
                          ? 'text-indigo-600'
                          : 'text-rose-600'
                    }`}
                  >
                    {sub.result.score}đ
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {sub.result.correctAnswers}/{sub.result.totalQuestions} câu
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
