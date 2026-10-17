'use client'

import React, { useState } from 'react'
import {
  BookA,
  Gamepad2,
  Zap,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import { StudentAnalyticsData, StudentExamDetail, PracticeSessionEntry } from '../../types'
import { formatDateTime } from '../../utils/date'
import ExamSubmissionReview from '../unit/ExamSubmissionReview'

type UnitProgressStudentRowProps = {
  data: StudentAnalyticsData
}

type EnrichedPracticeSession = PracticeSessionEntry & {
  isLegacy?: boolean
}

function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return '0s'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}p ${s > 0 ? `${s}s` : ''}`
}

function getSessionList(
  timesPlayed: number,
  history?: PracticeSessionEntry[],
  defaultDuration = 90,
): EnrichedPracticeSession[] {
  // 1. Deduplicate raw history entries (e.g. rapid duplicate triggers within 15 seconds)
  const rawList: PracticeSessionEntry[] = history && Array.isArray(history) ? [...history] : []
  const cleanedList: PracticeSessionEntry[] = []

  for (const item of rawList) {
    const prev = cleanedList[cleanedList.length - 1]
    if (
      prev &&
      (prev.isInterrupted || item.isInterrupted) &&
      item.completedAt &&
      prev.completedAt &&
      Math.abs(new Date(item.completedAt).getTime() - new Date(prev.completedAt).getTime()) < 15000
    ) {
      // Merge into previous entry, taking max duration
      prev.durationSeconds = Math.max(prev.durationSeconds || 0, item.durationSeconds || 0)
      prev.isQuickExit = prev.durationSeconds < 5
    } else {
      cleanedList.push({ ...item })
    }
  }

  // 2. Count valid attempts in cleaned list
  const validHistoryCount = cleanedList.filter(
    (h) => !h.isQuickExit && (h.durationSeconds === undefined || h.durationSeconds >= 5),
  ).length
  const missingLegacyCount = Math.max(0, timesPlayed - validHistoryCount)

  // 3. Synthesize legacy entries if student had plays before history tracking
  const legacyEntries: EnrichedPracticeSession[] = []
  for (let i = 1; i <= missingLegacyCount; i++) {
    legacyEntries.push({
      attempt: i,
      durationSeconds: defaultDuration,
      isQuickExit: false,
      isInterrupted: false,
      completedAt: new Date(0),
      isLegacy: true,
    })
  }

  // 4. Combine and strictly re-index all attempts sequentially (1, 2, 3...)
  const combined = [...legacyEntries, ...cleanedList]
  return combined.map((entry, index) => ({
    ...entry,
    attempt: index + 1,
  }))
}

type PracticeActivityCardProps = {
  title: string
  subtitle: string
  emptyText: string
  icon: React.ReactNode
  iconBg: string
  cardBorder: string
  badgeColor: string
  calendarColor: string
  timesPlayed: number
  totalSeconds: number
  bestMetricBadge?: React.ReactNode
  sessions: EnrichedPracticeSession[]
  type: 'flashcard' | 'quiz' | 'match'
  legacyDurationText?: string
}

function PracticeActivityCard({
  title,
  subtitle,
  emptyText,
  icon,
  iconBg,
  cardBorder,
  badgeColor,
  calendarColor,
  timesPlayed,
  totalSeconds,
  bestMetricBadge,
  sessions,
  type,
  legacyDurationText = '~1-2 phút',
}: PracticeActivityCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-4.5 border ${cardBorder} shadow-xs hover:shadow-sm transition-all space-y-3.5`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center text-white shadow-xs shrink-0`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm text-gray-900 block leading-tight">{title}</span>
            {totalSeconds > 0 ? (
              <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                <Clock size={11} className="text-gray-400 shrink-0" /> Tổng thời gian:{' '}
                <strong className="text-gray-700 font-semibold">
                  {formatDuration(totalSeconds)}
                </strong>
              </span>
            ) : (
              <span className="text-[11px] text-gray-400 font-medium block mt-0.5 truncate">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {bestMetricBadge}
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              timesPlayed > 0 ? badgeColor : 'text-gray-400 bg-gray-50 border-gray-200'
            }`}
          >
            {timesPlayed} lượt
          </span>
        </div>
      </div>

      {/* Attempt Sessions List */}
      {sessions.length > 0 ? (
        <div className="space-y-2 pt-1">
          {sessions.map((h, idx) => {
            const isQuick =
              h.isQuickExit ||
              (h.durationSeconds !== undefined && h.durationSeconds < 5) ||
              (type === 'quiz' &&
                h.score === 0 &&
                (h.totalCount ?? 0) === 0 &&
                (h.durationSeconds ?? 0) < 10)
            const dt = formatDateTime(h.completedAt)

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all text-xs ${
                  isQuick
                    ? 'bg-amber-50/60 border-amber-200/90 text-amber-950'
                    : 'bg-slate-50/80 hover:bg-white border-slate-200/80 text-slate-800 shadow-2xs'
                }`}
              >
                {/* Top line: Attempt # + Status badge + Score + Duration */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded-md border border-gray-200/80 shadow-2xs">
                      Lượt #{h.attempt || idx + 1}
                    </span>
                    {isQuick ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                        <AlertTriangle size={10} /> Thoát ngay (&lt; 5s)
                      </span>
                    ) : h.isLegacy ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Lượt trước nâng cấp
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-emerald-500" /> Hợp lệ
                      </span>
                    )}
                    {h.isInterrupted && !isQuick && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                        <AlertTriangle size={10} /> F5 / Thoát dở
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {type === 'quiz' && !isQuick && (
                      <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 shadow-2xs">
                        <span className="font-extrabold text-xs text-purple-700">
                          {h.score ?? 0}đ
                        </span>
                        {h.correctCount !== undefined && h.totalCount !== undefined && (
                          <span className="text-purple-600 text-[10px] font-medium">
                            ({h.correctCount}/{h.totalCount} câu)
                          </span>
                        )}
                      </div>
                    )}
                    <span
                      className={`font-bold flex items-center gap-1 px-2 py-0.5 rounded-md border shadow-2xs ${
                        isQuick
                          ? 'bg-amber-100/70 text-amber-800 border-amber-200'
                          : 'bg-white text-gray-700 border-gray-200/80'
                      }`}
                    >
                      <Clock
                        size={11}
                        className={isQuick ? 'text-amber-600' : 'text-gray-400'}
                      />
                      {h.isLegacy ? legacyDurationText : formatDuration(h.durationSeconds)}
                    </span>
                  </div>
                </div>

                {/* Bottom line: Ngày tháng năm làm bài & Giờ hoàn thành */}
                {dt && !h.isLegacy && (
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-[11px] text-gray-500 flex-wrap">
                    <div className="flex items-center gap-1.5 font-medium text-gray-600">
                      <Calendar size={12} className={`${calendarColor} shrink-0`} />
                      <span>
                        Ngày làm: <strong className="text-gray-800">{dt.date}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock size={12} className="text-gray-400 shrink-0" />
                      <span>
                        Giờ hoàn thành:{' '}
                        <strong className="text-gray-800">{dt.timeWithSeconds}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-3 px-3 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-xs text-slate-400 flex items-center justify-center gap-2">
          <Clock size={13} className="text-slate-300" />
          <span>{emptyText}</span>
        </div>
      )}
    </div>
  )
}

export default function UnitProgressStudentRow({ data }: UnitProgressStudentRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null)

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev)
  }

  const toggleExamDetail = (examId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedExamId((prev) => (prev === examId ? null : examId))
  }

  const flashcardSessions = getSessionList(
    data.games.flashcard.timesPlayed,
    data.games.flashcard.history,
    90,
  )
  const totalFlashcardSeconds = flashcardSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0)

  const quizSessions = getSessionList(data.games.quiz.timesPlayed, data.games.quiz.history, 120)
  const totalQuizSeconds = quizSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0)

  const matchSessions = getSessionList(data.games.match.timesPlayed, data.games.match.history, 45)
  const totalMatchSeconds = matchSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0)

  return (
    <>
      {/* Main Table Row */}
      <tr
        onClick={toggleExpanded}
        className={`border-b border-gray-100 cursor-pointer transition-colors ${
          isExpanded ? 'bg-indigo-50/40' : 'hover:bg-blue-50/20'
        }`}
      >
        {/* Student Info */}
        <td className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
              {data.student.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-gray-800 flex items-center gap-1.5">
                {data.student.name}
                <span className="text-gray-400 text-xs">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </span>
              {data.student.email && (
                <span className="text-[11px] text-gray-400 truncate">{data.student.email}</span>
              )}
            </div>
          </div>
        </td>

        {/* Mastery Progress */}
        <td className="py-4 px-6">
          <div className="flex flex-col gap-1 pr-8">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-gray-700">Đã thuộc</span>
              <span className="font-bold text-emerald-600">{data.masteryProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${data.masteryProgress}%` }}
              ></div>
            </div>
          </div>
        </td>

        {/* Game Activities Summary */}
        <td className="py-4 px-6">
          <div className="flex flex-wrap gap-2">
            {data.games.flashcard.played && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-xs font-semibold">
                <BookA size={12} />
                <span>{data.games.flashcard.timesPlayed} lượt</span>
                {totalFlashcardSeconds > 0 && (
                  <span className="text-[10px] text-blue-500 font-normal">
                    ({formatDuration(totalFlashcardSeconds)})
                  </span>
                )}
              </div>
            )}
            {data.games.quiz.played && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 text-xs font-semibold">
                <Gamepad2 size={12} />
                <span>{data.games.quiz.timesPlayed} lượt</span>
                {totalQuizSeconds > 0 && (
                  <span className="text-[10px] text-purple-500 font-normal">
                    ({formatDuration(totalQuizSeconds)})
                  </span>
                )}
              </div>
            )}
            {data.games.match.played && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg border border-orange-100 text-xs font-semibold">
                <Zap size={12} />
                <span>{data.games.match.timesPlayed} lượt</span>
                {data.games.match.bestTime && (
                  <span className="text-[10px] text-orange-500 font-normal">
                    (⚡ {data.games.match.bestTime}s)
                  </span>
                )}
              </div>
            )}
            {!data.games.flashcard.played &&
              !data.games.quiz.played &&
              !data.games.match.played && (
                <span className="text-xs text-gray-400 italic">Chưa tham gia luyện tập</span>
              )}
          </div>
        </td>

        {/* Unit Exams Summary */}
        <td className="py-4 px-6">
          <div className="flex flex-wrap gap-1.5">
            {data.exams && data.exams.length > 0 ? (
              data.exams.map((exam) => (
                <div
                  key={exam.id}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    exam.isCompleted
                      ? (exam.score ?? 0) >= 80
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : (exam.score ?? 0) >= 50
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                      : exam.isInProgress
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}
                  title={exam.title}
                >
                  <span className="truncate max-w-[120px]">{exam.title}:</span>
                  <span>{exam.isCompleted ? `${exam.score}đ` : exam.isInProgress ? 'Đang làm' : 'Chưa làm'}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">Chưa có bài thi</span>
            )}
          </div>
        </td>
      </tr>

      {/* Accordion Expandable Detail Row */}
      {isExpanded && (
        <tr className="bg-slate-50/70 border-b border-indigo-100/70 animate-in fade-in duration-200">
          <td colSpan={4} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Chi tiết Hoạt động luyện tập (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-amber-100 text-amber-600">
                      <Zap size={16} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Chi tiết hoạt động luyện tập
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {data.games.flashcard.timesPlayed +
                        data.games.quiz.timesPlayed +
                        data.games.match.timesPlayed}{' '}
                      lượt
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Bấm dòng để thu gọn
                  </span>
                </div>

                {/* 1. Lật thẻ (Flashcard) */}
                <PracticeActivityCard
                  type="flashcard"
                  title="Lật Thẻ 3D"
                  subtitle="Học từ vựng trực quan"
                  emptyText="Chưa tham gia lật thẻ"
                  icon={<BookA size={18} />}
                  iconBg="bg-gradient-to-br from-blue-500 to-indigo-600"
                  cardBorder="border-blue-100/90 hover:border-blue-200"
                  badgeColor="text-blue-700 bg-blue-50 border-blue-200"
                  calendarColor="text-blue-500"
                  timesPlayed={data.games.flashcard.timesPlayed}
                  totalSeconds={totalFlashcardSeconds}
                  sessions={flashcardSessions}
                  legacyDurationText="~1-2 phút"
                />

                {/* 2. Đố vui (Quiz) */}
                <PracticeActivityCard
                  type="quiz"
                  title="Đố Vui Trắc Nghiệm"
                  subtitle="Kiểm tra phản xạ từ vựng"
                  emptyText="Chưa tham gia đố vui"
                  icon={<Gamepad2 size={18} />}
                  iconBg="bg-gradient-to-br from-purple-500 to-fuchsia-600"
                  cardBorder="border-purple-100/90 hover:border-purple-200"
                  badgeColor="text-purple-700 bg-purple-50 border-purple-200"
                  calendarColor="text-purple-500"
                  timesPlayed={data.games.quiz.timesPlayed}
                  totalSeconds={totalQuizSeconds}
                  bestMetricBadge={
                    data.games.quiz.score > 0 ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Cao nhất: {data.games.quiz.score}đ
                      </span>
                    ) : undefined
                  }
                  sessions={quizSessions}
                  legacyDurationText="~2-3 phút"
                />

                {/* 3. Ghép thẻ (Match Game) */}
                <PracticeActivityCard
                  type="match"
                  title="Ghép Thẻ Nhanh"
                  subtitle="Thử thách phản xạ nhanh"
                  emptyText="Chưa tham gia ghép thẻ"
                  icon={<Zap size={18} />}
                  iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
                  cardBorder="border-amber-100/90 hover:border-amber-200"
                  badgeColor="text-orange-700 bg-orange-50 border-orange-200"
                  calendarColor="text-orange-500"
                  timesPlayed={data.games.match.timesPlayed}
                  totalSeconds={totalMatchSeconds}
                  bestMetricBadge={
                    data.games.match.bestTime ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        ⚡ {data.games.match.bestTime}s
                      </span>
                    ) : undefined
                  }
                  sessions={matchSessions}
                  legacyDurationText={
                    data.games.match.bestTime ? `${data.games.match.bestTime}s` : '~1 phút'
                  }
                />
              </div>

              {/* Right Column: Danh sách Bài kiểm tra đầy đủ (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" /> Danh sách bài kiểm tra đầy đủ (
                    {data.exams?.length || 0})
                  </h4>
                </div>

                {!data.exams || data.exams.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 text-xs">
                    Chưa có bài kiểm tra nào được gán cho nội dung này.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.exams.map((exam: StudentExamDetail) => {
                      const isReviewOpen = expandedExamId === exam.id
                      return (
                        <div
                          key={exam.id}
                          className={`rounded-2xl border transition-all overflow-hidden ${
                            exam.isCompleted
                              ? 'bg-white border-gray-200/90 shadow-xs'
                              : exam.isInProgress
                              ? 'bg-amber-50/40 border-amber-200'
                              : 'bg-white border-gray-200/60 opacity-80'
                          }`}
                        >
                          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                                    exam.type === 'class'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                  }`}
                                >
                                  {exam.type === 'class'
                                    ? 'Đề Tổng Hợp'
                                    : exam.unitTitle || 'Đề Unit'}
                                </span>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock size={12} /> {exam.duration || 45} phút
                                </span>
                                {exam.isInterrupted && (
                                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-bold border border-rose-200 flex items-center gap-1">
                                    <AlertTriangle size={11} /> Nộp do tải lại trang / F5
                                  </span>
                                )}
                              </div>
                              <h5 className="font-bold text-gray-900 text-sm">{exam.title}</h5>

                              {exam.isCompleted && exam.completedAt && (() => {
                                const dt = formatDateTime(exam.completedAt)
                                return (
                                  <div className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1.5 flex-wrap">
                                    <span className="flex items-center gap-1 font-medium text-gray-700">
                                      <Clock size={12} className="text-indigo-500 shrink-0" />
                                      Đã nộp: <strong>{dt ? dt.timeWithSeconds : ''}</strong>
                                    </span>
                                    {dt && (
                                      <>
                                        <span className="text-gray-300">•</span>
                                        <span className="flex items-center gap-1 font-medium text-gray-600">
                                          <Calendar size={12} className="text-indigo-400 shrink-0" />
                                          <strong>{dt.date}</strong>
                                        </span>
                                      </>
                                    )}
                                  </div>
                                )
                              })()}
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {exam.isCompleted ? (
                                <div className="text-right">
                                  <div
                                    className={`font-black text-xl ${
                                      (exam.score ?? 0) >= 80
                                        ? 'text-emerald-600'
                                        : (exam.score ?? 0) >= 50
                                        ? 'text-indigo-600'
                                        : 'text-rose-600'
                                    }`}
                                  >
                                    {exam.score}đ
                                  </div>
                                  <div className="text-[11px] text-gray-400 font-medium">
                                    {exam.correctAnswers !== null && exam.correctAnswers !== undefined
                                      ? `Đúng ${exam.correctAnswers}/${exam.totalQuestions ?? 0} câu`
                                      : 'Hoàn thành'}
                                  </div>
                                </div>
                              ) : exam.isInProgress ? (
                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                                  Đang làm dở
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                  Chưa làm
                                </span>
                              )}

                              {exam.isCompleted && (
                                <button
                                  onClick={(e) => toggleExamDetail(exam.id, e)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0 ${
                                    isReviewOpen
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                  }`}
                                >
                                  {isReviewOpen ? (
                                    <>
                                      Thu gọn <ChevronUp size={14} />
                                    </>
                                  ) : (
                                    <>
                                      Xem bài làm <ChevronDown size={14} />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Nested Exam Submission Review */}
                          {isReviewOpen && exam.isCompleted && (
                            <div className="p-4 border-t border-gray-100 bg-gray-50/70 animate-in slide-in-from-top-2 duration-200">
                              <ExamSubmissionReview
                                content={exam.content}
                                answers={(exam.answers as Record<string, unknown>) || {}}
                                correctAnswersDetail={exam.correctAnswersDetail}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
