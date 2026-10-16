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
} from 'lucide-react'
import { StudentAnalyticsData, StudentExamDetail, PracticeSessionEntry } from '../../types'
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
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" /> Chi tiết hoạt động luyện tập
                  </h4>
                  <span className="text-[11px] text-gray-400 font-medium">Bấm dòng để thu gọn</span>
                </div>

                {/* 1. Lật thẻ (Flashcard) */}
                <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        <BookA size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-gray-800 block">Lật Thẻ 3D</span>
                        {totalFlashcardSeconds > 0 && (
                          <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                            <Clock size={10} /> Tổng thời gian: {formatDuration(totalFlashcardSeconds)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {data.games.flashcard.timesPlayed} lượt
                    </span>
                  </div>

                  {flashcardSessions.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {flashcardSessions.map((h, idx) => {
                        const isQuick =
                          h.isQuickExit ||
                          (h.durationSeconds !== undefined && h.durationSeconds < 5)
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl border transition-all ${
                              isQuick
                                ? 'bg-amber-50/70 border-amber-200/90 text-amber-900'
                                : 'bg-gray-50/80 border-gray-100 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-800">
                                Lượt #{h.attempt || idx + 1}
                              </span>
                              {isQuick ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <AlertTriangle size={10} /> Thoát ngay (&lt; 5s)
                                </span>
                              ) : h.isLegacy ? (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                  Lượt trước nâng cấp
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Hợp lệ
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold flex items-center gap-1 ${
                                  isQuick ? 'text-amber-700' : 'text-gray-700'
                                }`}
                              >
                                <Clock
                                  size={11}
                                  className={isQuick ? 'text-amber-500' : 'text-gray-400'}
                                />
                                {h.isLegacy ? '~1-2 phút' : formatDuration(h.durationSeconds)}
                              </span>
                              {h.isInterrupted && !isQuick && (
                                <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                  F5 / Thoát dở
                                </span>
                              )}
                              {h.completedAt && !h.isLegacy && (
                                <span className="text-[10px] text-gray-400 hidden sm:inline">
                                  {new Date(h.completedAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa tham gia lật thẻ</p>
                  )}
                </div>

                {/* 2. Đố vui (Quiz) */}
                <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                        <Gamepad2 size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-gray-800 block">Đố Vui Trắc Nghiệm</span>
                        {totalQuizSeconds > 0 && (
                          <span className="text-[11px] text-purple-600 font-medium flex items-center gap-1">
                            <Clock size={10} /> Tổng thời gian: {formatDuration(totalQuizSeconds)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        {data.games.quiz.timesPlayed} lượt
                      </span>
                      {data.games.quiz.score > 0 && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Cao nhất: {data.games.quiz.score}đ
                        </span>
                      )}
                    </div>
                  </div>

                  {quizSessions.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {quizSessions.map((h, idx) => {
                        const isQuick =
                          h.isQuickExit ||
                          (h.durationSeconds !== undefined && h.durationSeconds < 5) ||
                          (h.score === 0 &&
                            (h.totalCount ?? 0) === 0 &&
                            (h.durationSeconds ?? 0) < 10)
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl border transition-all ${
                              isQuick
                                ? 'bg-amber-50/70 border-amber-200/90 text-amber-900'
                                : 'bg-gray-50/80 border-gray-100 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-800">
                                Lượt #{h.attempt || idx + 1}
                              </span>
                              {isQuick ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <AlertTriangle size={10} /> Thoát ngay (&lt; 5s)
                                </span>
                              ) : h.isLegacy ? (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                  Lượt trước nâng cấp
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Hợp lệ
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!isQuick && (
                                <span className="font-bold text-purple-700">
                                  {h.score ?? (h.isLegacy ? data.games.quiz.score : 0)}đ
                                </span>
                              )}
                              {h.correctCount !== undefined && h.totalCount !== undefined && (
                                <span className="text-gray-400 text-[11px]">
                                  ({h.correctCount}/{h.totalCount} câu)
                                </span>
                              )}
                              <span
                                className={`font-semibold flex items-center gap-1 ${
                                  isQuick ? 'text-amber-700' : 'text-gray-700'
                                }`}
                              >
                                <Clock
                                  size={11}
                                  className={isQuick ? 'text-amber-500' : 'text-gray-400'}
                                />
                                {h.isLegacy ? '~2-3 phút' : formatDuration(h.durationSeconds)}
                              </span>
                              {h.isInterrupted && !isQuick && (
                                <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                  F5 / Thoát dở
                                </span>
                              )}
                              {h.completedAt && !h.isLegacy && (
                                <span className="text-[10px] text-gray-400 hidden sm:inline">
                                  {new Date(h.completedAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa tham gia đố vui</p>
                  )}
                </div>

                {/* 3. Ghép thẻ (Match Game) */}
                <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                        <Zap size={16} />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-gray-800 block">Ghép Thẻ Nhanh</span>
                        {totalMatchSeconds > 0 && (
                          <span className="text-[11px] text-orange-600 font-medium flex items-center gap-1">
                            <Clock size={10} /> Tổng thời gian: {formatDuration(totalMatchSeconds)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                        {data.games.match.timesPlayed} lượt
                      </span>
                      {data.games.match.bestTime && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          ⚡ {data.games.match.bestTime}s
                        </span>
                      )}
                    </div>
                  </div>

                  {matchSessions.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {matchSessions.map((h, idx) => {
                        const isQuick =
                          h.isQuickExit ||
                          (h.durationSeconds !== undefined && h.durationSeconds < 5)
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl border transition-all ${
                              isQuick
                                ? 'bg-amber-50/70 border-amber-200/90 text-amber-900'
                                : 'bg-gray-50/80 border-gray-100 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-800">
                                Lượt #{h.attempt || idx + 1}
                              </span>
                              {isQuick ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                  <AlertTriangle size={10} /> Thoát ngay (&lt; 5s)
                                </span>
                              ) : h.isLegacy ? (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                                  Lượt trước nâng cấp
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Hợp lệ
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold flex items-center gap-1 ${
                                  isQuick ? 'text-amber-700' : 'text-orange-700'
                                }`}
                              >
                                <Clock
                                  size={11}
                                  className={isQuick ? 'text-amber-500' : 'text-orange-400'}
                                />
                                {h.isLegacy
                                  ? data.games.match.bestTime
                                    ? `${data.games.match.bestTime}s`
                                    : '~1 phút'
                                  : formatDuration(h.durationSeconds)}
                              </span>
                              {h.isInterrupted && !isQuick && (
                                <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                  F5 / Thoát dở
                                </span>
                              )}
                              {h.completedAt && !h.isLegacy && (
                                <span className="text-[10px] text-gray-400 hidden sm:inline">
                                  {new Date(h.completedAt).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa tham gia ghép thẻ</p>
                  )}
                </div>
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

                              {exam.isCompleted && exam.completedAt && (
                                <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                                  <Calendar size={12} /> Đã nộp:{' '}
                                  {new Date(exam.completedAt).toLocaleString('vi-VN')}
                                </p>
                              )}
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
