'use client'

import React from 'react'
import { Users, Award, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'

type AnalyticsKpiCardsProps = {
  participatedStudents: number
  totalStudents: number
  participationRate: number
  avgMastery: number
  vocabCount: number
  avgExamScore: number
  avgQuizScore: number
  hardVocabsCount: number
  mediumVocabsCount: number
  easyVocabsCount: number
}

export default function AnalyticsKpiCards({
  participatedStudents,
  totalStudents,
  participationRate,
  avgMastery,
  vocabCount,
  avgExamScore,
  avgQuizScore,
  hardVocabsCount,
  mediumVocabsCount,
  easyVocabsCount,
}: AnalyticsKpiCardsProps) {
  const displayExamScore = avgExamScore > 0 ? avgExamScore : avgQuizScore > 0 ? avgQuizScore : 0

  return (
    <div className="px-6 py-2.5 shrink-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Participation */}
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-gray-200/70 shadow-2xs hover:border-indigo-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Tỷ lệ tham gia
            </p>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={13} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-black text-gray-800">
              {participatedStudents}
              <span className="text-xs font-semibold text-gray-400">/{totalStudents}</span>
            </span>
            <span className="text-[11px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
              {participationRate}%
            </span>
          </div>
          <div className="mt-1.5">
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${participationRate}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 truncate">
              {participatedStudents === totalStudents
                ? 'Đủ 100% học sinh đã học'
                : `Còn ${totalStudents - participatedStudents} em chưa học`}
            </p>
          </div>
        </div>

        {/* Card 2: Mastery */}
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-gray-200/70 shadow-2xs hover:border-emerald-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Thuộc từ trung bình
            </p>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Award size={13} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-black text-emerald-600">{avgMastery}%</span>
            <span className="text-[11px] text-gray-400 font-medium">({vocabCount} từ)</span>
          </div>
          <div className="mt-1.5">
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${avgMastery}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 truncate">
              {avgMastery >= 80
                ? 'Mức độ nhớ rất cao 🎉'
                : avgMastery >= 50
                  ? 'Đang tiến bộ ổn định'
                  : 'Cần thêm thời gian luyện'}
            </p>
          </div>
        </div>

        {/* Card 3: Avg Score */}
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-gray-200/70 shadow-2xs hover:border-purple-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Điểm kiểm tra TB
            </p>
            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <TrendingUp size={13} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-black text-purple-600">{displayExamScore}</span>
            <span className="text-[11px] text-gray-400 font-medium">/ 100đ</span>
          </div>
          <div className="mt-1.5">
            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${displayExamScore}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
              <span>Quiz: {avgQuizScore > 0 ? `${avgQuizScore}đ` : '—'}</span>
              <span>Bài thi: {avgExamScore > 0 ? `${avgExamScore}đ` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Weak words */}
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-gray-200/70 shadow-2xs hover:border-amber-200 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Từ vựng cần chú ý
            </p>
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                hardVocabsCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {hardVocabsCount > 0 ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className={`text-lg font-black ${
                hardVocabsCount > 0 ? 'text-rose-600' : 'text-gray-700'
              }`}
            >
              {hardVocabsCount}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">từ hay sai</span>
          </div>
          <div className="mt-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  hardVocabsCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <p className="text-[10px] text-gray-500 truncate">
                {hardVocabsCount > 0
                  ? `${hardVocabsCount} từ có tỷ lệ sai > 50%`
                  : 'Không có từ sai nghiêm trọng'}
              </p>
            </div>
            <p className="text-[9px] text-gray-400 mt-0.5 truncate">
              {mediumVocabsCount} từ TB • {easyVocabsCount} từ đã vững
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
