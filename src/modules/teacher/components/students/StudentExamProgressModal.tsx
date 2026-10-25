'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  X,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import { getStudentExamHistory } from '@/actions/analytics/class-analytics'
import type { ExamAttemptHistoryEntry } from '../../types'
import { formatDateTime } from '../../utils/date'
import { formatDuration } from '@/actions/analytics/history-utils'
import ExamSubmissionReview from '../unit/ExamSubmissionReview'
import Portal from '@/components/common/Portal'
import StudentExamProgressSkeleton from './loading/StudentExamProgressSkeleton'

type StudentExamHistoryItem = {
  examId: string
  title: string
  type: 'class' | 'unit'
  unitTitle: string | null
  duration: number
  status: 'completed' | 'in_progress' | 'not_started'
  score: number | null
  correctAnswers: number | null
  totalQuestions: number | null
  startedAt: string | Date | null
  completedAt: string | Date | null
  durationSeconds?: number | null
  attemptCount?: number
  bestScore?: number | null
  history?: ExamAttemptHistoryEntry[]
  answers: Record<string, unknown>
  correctAnswersDetail: Record<string, string | number>
  content: unknown
}

type StudentExamHistoryResponse = {
  student: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
  summary: {
    totalExams: number
    completedCount: number
    inProgressCount: number
    notStartedCount: number
    avgScore: number
    highestScore: number
  }
  history: StudentExamHistoryItem[]
}

type StudentExamProgressModalProps = {
  classId: string
  studentId: string
  studentName?: string
  onClose: () => void
}

export default function StudentExamProgressModal({
  classId,
  studentId,
  studentName,
  onClose,
}: StudentExamProgressModalProps) {
  const [data, setData] = useState<StudentExamHistoryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedAttemptKey, setExpandedAttemptKey] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        const res = await getStudentExamHistory(classId, studentId)
        setData(res as unknown as StudentExamHistoryResponse)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Lỗi khi tải lịch sử kiểm tra của học sinh')
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [classId, studentId])

  return (
    <Portal>
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-gray-200/50">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-purple-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg overflow-hidden shadow-md shrink-0">
              {data?.student?.avatarUrl ? (
                <Image src={data.student.avatarUrl} alt={data.student.name} width={48} height={48} className="w-full h-full object-cover" />
              ) : (
                (data?.student?.name || studentName || 'H').charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                  Hồ Sơ Kiểm Tra
                </span>
                <span className="text-xs text-gray-400">{data?.student?.email}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mt-0.5">
                {data?.student?.name || studentName || 'Học sinh'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white text-gray-400 hover:text-gray-700 rounded-full transition-colors shadow-xs"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <StudentExamProgressSkeleton />
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : !data ? (
            <div className="text-center py-20 text-gray-400">Không có dữ liệu.</div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Số bài đã nộp</p>
                  <p className="text-2xl font-black text-indigo-950 mt-1">
                    {data.summary.completedCount} <span className="text-sm font-semibold text-gray-400">/ {data.summary.totalExams}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Điểm trung bình</p>
                  <p className="text-2xl font-black text-purple-950 mt-1">{data.summary.avgScore}đ</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Điểm cao nhất</p>
                  <p className="text-2xl font-black text-emerald-950 mt-1">{data.summary.highestScore}đ</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Tỷ lệ hoàn thành</p>
                  <p className="text-2xl font-black text-amber-950 mt-1">
                    {data.summary.totalExams > 0
                      ? Math.round((data.summary.completedCount / data.summary.totalExams) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                  <FileText size={16} className="text-indigo-600" /> Danh sách bài kiểm tra ({data.history.length})
                </h3>

                {data.history.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    Chưa có bài kiểm tra nào được phát hành trong lớp học này.
                  </div>
                ) : (
                  data.history.map((item) => {
                    const attempts: ExamAttemptHistoryEntry[] =
                      item.history && item.history.length > 0
                        ? item.history
                        : item.status === 'completed'
                        ? [
                            {
                              attempt: 1,
                              score: item.score ?? 0,
                              correctAnswers: item.correctAnswers ?? null,
                              totalQuestions: item.totalQuestions ?? null,
                              durationSeconds: item.durationSeconds ?? null,
                              startedAt: item.startedAt ? new Date(item.startedAt).toISOString() : '',
                              completedAt: item.completedAt ? new Date(item.completedAt).toISOString() : '',
                              isInterrupted: false,
                              answers: (item.answers as Record<string, unknown>) || {},
                              correctAnswersDetail: item.correctAnswersDetail || {},
                            },
                          ]
                        : []

                    const totalExamSeconds = attempts.reduce(
                      (acc, a) => acc + (a.durationSeconds || 0),
                      0,
                    )
                    const bestScore =
                      item.bestScore ??
                      (attempts.length > 0
                        ? Math.max(...attempts.map((a) => a.score ?? 0))
                        : item.score ?? null)

                    const isCompleted = item.status === 'completed' || attempts.length > 0
                    const isInProgress = item.status === 'in_progress'

                    return (
                      <div
                        key={item.examId}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isCompleted
                            ? 'bg-white border-indigo-100 shadow-xs hover:border-indigo-200'
                            : isInProgress
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-gray-50/60 border-gray-200/80 opacity-75'
                        }`}
                      >
                        {/* Header */}
                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                item.type === 'class'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              }`}>
                                {item.type === 'class' ? 'Đề Tổng Hợp' : item.unitTitle || 'Đề Unit'}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={12} /> Thời gian đề: {item.duration} phút
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-base truncate">{item.title}</h4>

                            {totalExamSeconds > 0 && (
                              <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-1">
                                <Clock size={11} className="text-gray-400 shrink-0" />
                                Tổng thời gian đã làm:{' '}
                                <strong className="text-gray-700 font-semibold">
                                  {formatDuration(totalExamSeconds)}
                                </strong>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {attempts.length > 1 && bestScore !== null && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Cao nhất: {bestScore}đ
                              </span>
                            )}
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                attempts.length > 0
                                  ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                                  : isInProgress
                                  ? 'text-amber-800 bg-amber-100 border-amber-200'
                                  : 'text-gray-400 bg-gray-50 border-gray-200'
                              }`}
                            >
                              {attempts.length > 0
                                ? `${attempts.length} lượt`
                                : isInProgress
                                ? 'Đang làm dở'
                                : 'Chưa làm'}
                            </span>
                          </div>
                        </div>

                        {/* Attempt Sessions List */}
                        {attempts.length > 0 ? (
                          <div className="space-y-2 p-3.5 bg-slate-50/50 border-t border-gray-100">
                            {attempts.map((att) => {
                              const attemptKey = `${item.examId}_${att.attempt}`
                              const isAttemptOpen = expandedAttemptKey === attemptKey
                              const dt = formatDateTime(att.completedAt)

                              return (
                                <div
                                  key={att.attempt}
                                  className="p-3 rounded-xl border bg-white hover:border-indigo-200 border-slate-200/80 text-slate-800 shadow-2xs transition-all space-y-2"
                                >
                                  {/* Top line: Attempt # + Status badge + Score + Duration + Action */}
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-gray-900 bg-slate-50 px-2 py-0.5 rounded-md border border-gray-200/80 shadow-2xs text-xs">
                                        Lượt #{att.attempt}
                                      </span>
                                      {att.isInterrupted ? (
                                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                                          <AlertTriangle size={10} /> Thoát giữa chừng / F5
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                          <CheckCircle2 size={11} className="text-emerald-500" /> Hoàn thành
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <div className="flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                                        <span
                                          className={`font-black text-xs ${
                                            (att.score ?? 0) >= 80
                                              ? 'text-emerald-700'
                                              : (att.score ?? 0) >= 50
                                              ? 'text-indigo-700'
                                              : 'text-rose-700'
                                          }`}
                                        >
                                          {att.score}đ
                                        </span>
                                        {att.correctAnswers !== null &&
                                          att.correctAnswers !== undefined && (
                                            <span className="text-indigo-600 text-[10px] font-medium">
                                              ({att.correctAnswers}/{att.totalQuestions ?? 0} câu)
                                            </span>
                                          )}
                                      </div>

                                      <span className="font-bold text-xs flex items-center gap-1 px-2 py-0.5 rounded-md border shadow-2xs bg-white text-gray-700 border-gray-200/80">
                                        <Clock size={11} className="text-gray-400" />
                                        {formatDuration(att.durationSeconds)}
                                      </span>

                                      <button
                                        onClick={() => setExpandedAttemptKey(isAttemptOpen ? null : attemptKey)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shrink-0 ${
                                          isAttemptOpen
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200'
                                        }`}
                                      >
                                        {isAttemptOpen ? (
                                          <>
                                            Thu gọn <ChevronUp size={13} />
                                          </>
                                        ) : (
                                          <>
                                            Xem bài làm <ChevronDown size={13} />
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Bottom line: Ngày làm & Giờ hoàn thành */}
                                  {dt && (
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-gray-500 flex-wrap">
                                      <div className="flex items-center gap-1.5 font-medium text-gray-600">
                                        <Calendar size={12} className="text-indigo-500 shrink-0" />
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

                                  {/* Submission Review for this attempt */}
                                  {isAttemptOpen && (
                                    <div className="mt-3 p-3.5 border-t border-indigo-100 bg-slate-50/70 rounded-xl shadow-xs animate-in slide-in-from-top-2 duration-200">
                                      <ExamSubmissionReview
                                        content={item.content}
                                        answers={
                                          (att.answers as Record<string, unknown>) ||
                                          (item.answers as Record<string, unknown>) ||
                                          {}
                                        }
                                        correctAnswersDetail={
                                          att.correctAnswersDetail || item.correctAnswersDetail
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ) : isInProgress ? (
                          <div className="p-3.5 bg-amber-50/50 border-t border-amber-100 text-xs text-amber-800 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} className="text-amber-600 animate-pulse" />
                              <span className="font-semibold">Học sinh đang làm dở bài thi này</span>
                            </div>
                            {item.startedAt && (
                              <span className="text-[11px] text-amber-700">
                                Bắt đầu lúc: {formatDateTime(item.startedAt)?.fullWithSeconds || ''}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50/50 border-t border-gray-100 text-xs text-slate-400 flex items-center justify-center gap-2">
                            <Clock size={13} className="text-slate-300" />
                            <span>Chưa làm bài kiểm tra này</span>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </Portal>
  )
}
