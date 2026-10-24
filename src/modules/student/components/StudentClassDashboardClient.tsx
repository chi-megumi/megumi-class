'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookA,
  PlayCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Trophy,
  RotateCcw,
  FileText,
  BookOpen,
  GraduationCap,
} from 'lucide-react'
import type { ClassData, ExamData } from '@/modules/teacher/types'
import { sortUnits } from '@/modules/teacher/utils/unitSort'
import { startTest } from '@/actions/analytics/exam-session'
import type { TestResultPayload } from '@/actions/analytics/types'
import TestConfirmModal from './exam/TestConfirmModal'

type StudentClassDashboardClientProps = {
  classData: ClassData
  classId: string
}

export default function StudentClassDashboardClient({
  classData,
  classId,
}: StudentClassDashboardClientProps) {
  const router = useRouter()
  const [confirmTest, setConfirmTest] = useState<ExamData | null>(null)
  const [isStartingTest, setIsStartingTest] = useState(false)
  const [testSessionData] = useState<Record<string, TestResultPayload>>({})

  const handleStartDirectTest = async (test: ExamData, forceRetake = false) => {
    if (isStartingTest) return
    setIsStartingTest(true)
    try {
      await startTest({
        classId,
        testId: test.id,
        forceRetake,
      })
      router.push(
        `/student/classes/${classId}/exams/${test.id}${forceRetake ? '?retake=1' : ''}`,
      )
    } catch (e) {
      console.error(e)
      alert('Lỗi khởi tạo bài thi. Vui lòng thử lại.')
    } finally {
      setIsStartingTest(false)
    }
  }

  const handleConfirmStart = async () => {
    if (!confirmTest || isStartingTest) return
    setIsStartingTest(true)
    try {
      await startTest({
        classId,
        testId: confirmTest.id,
      })
      const testId = confirmTest.id
      setConfirmTest(null)
      router.push(`/student/classes/${classId}/exams/${testId}`)
    } catch {
      alert('Lỗi khởi tạo bài thi. Vui lòng thử lại.')
    } finally {
      setIsStartingTest(false)
    }
  }

  // Published and enabled class-level exams
  const publishedClassExams = (classData.exams || []).filter((t) => t.isEnabled && t.isPublished)
  const publishedUnits = (classData.units || []).filter((u) => u.isPublished)

  const getExamResult = (test: ExamData): TestResultPayload | undefined => {
    if (!test) return undefined
    if (testSessionData[test.id]) return testSessionData[test.id]
    if (test.results && test.results[0]) {
      const r = test.results[0]
      const payload = (r.answers as TestResultPayload | null) || {}
      const hasAnswers = payload.answers && Object.keys(payload.answers).length > 0
      const isBogusAutoSubmit =
        !!payload.isInterrupted && !hasAnswers && (r.score === 0 || r.score === null)
      if (isBogusAutoSubmit) {
        return undefined
      }
      return {
        score: r.score ?? payload.score,
        startedAt: r.startedAt ? new Date(r.startedAt).toISOString() : undefined,
        completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : undefined,
        answers: payload.answers,
        correctAnswersDetail: payload.correctAnswersDetail,
        correctAnswers: payload.correctAnswers,
        totalQuestions: payload.totalQuestions,
      }
    }
    return undefined
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Test Confirmation Modal */}
      <TestConfirmModal
        test={confirmTest}
        isLoading={isStartingTest}
        onCancel={() => setConfirmTest(null)}
        onConfirm={handleConfirmStart}
      />

      {/* HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-8 md:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-4 border border-white/20">
            <Sparkles size={14} className="text-amber-300" />
            Lớp học trực tuyến
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            {classData.name}
          </h1>
          {classData.description && (
            <p className="text-indigo-100/90 text-sm md:text-base leading-relaxed mb-6 font-normal">
              {classData.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-indigo-200">
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
              <GraduationCap size={16} className="text-indigo-300" />
              <span>GV: {classData.teacher?.name || 'Giáo viên phụ trách'}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10">
              <BookOpen size={16} className="text-indigo-300" />
              <span>{publishedUnits.length} bài học</span>
            </div>
            {publishedClassExams.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-400/20 text-amber-200 px-3.5 py-1.5 rounded-full border border-amber-300/30">
                <Trophy size={16} className="text-amber-300" />
                <span>{publishedClassExams.length} bài thi tổng hợp</span>
              </div>
            )}
          </div>
        </div>

        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 w-64 h-64 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* BÀI THI TỔNG HỢP CẤP LỚP */}
      {publishedClassExams.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider mb-1">
                <Trophy size={18} />
                Đánh giá định kỳ & Tổng kết
              </div>
              <h2 className="text-2xl font-black text-gray-900">Bài kiểm tra tổng hợp</h2>
              <p className="text-gray-500 text-sm mt-1">
                Các bài thi lớn tích hợp kiến thức nhiều bài học để đánh giá năng lực toàn diện.
              </p>
            </div>
            <div className="self-start sm:self-auto text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 shrink-0">
              {publishedClassExams.length} bài thi đang mở
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedClassExams.map((test) => {
              const testResult = getExamResult(test)
              const isCompleted = !!testResult?.completedAt
              const isInProgress = !!testResult?.startedAt && !isCompleted

              return (
                <div
                  key={test.id}
                  onClick={() => {
                    if (isCompleted) {
                      router.push(`/student/classes/${classId}/exams/${test.id}`)
                    } else if (test.isRetakable) {
                      handleStartDirectTest(test, false)
                    } else {
                      setConfirmTest(test)
                    }
                  }}
                  className={`group relative bg-gradient-to-b from-white to-gray-50/50 border rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/20 shadow-sm hover:shadow-md cursor-pointer hover:border-emerald-300'
                      : isInProgress
                        ? 'border-amber-300 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer bg-amber-50/20 ring-2 ring-amber-400/20'
                        : 'border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 cursor-pointer'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        test.isRetakable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isCompleted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isInProgress
                              ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {test.isRetakable
                        ? 'Luyện tập'
                        : isCompleted
                          ? 'Đã hoàn thành'
                          : isInProgress
                            ? 'Đang làm dở'
                            : 'Đợt thi chính thức'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-100 shadow-2xs">
                      <Clock size={14} className="text-indigo-500" />
                      {test.duration} phút
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform">
                        <FileText size={16} />
                      </div>
                      <h3 className="font-extrabold text-gray-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {test.title}
                      </h3>
                    </div>

                    <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                      {test.isRetakable
                        ? 'Đề thi tự do: Bạn có thể thi lại nhiều lần để nâng cao thành tích.'
                        : 'Lưu ý: Chỉ làm được 1 lần duy nhất, kết quả sẽ gửi thẳng đến giáo viên.'}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                    {isCompleted ? (
                      <>
                        <span className="text-emerald-700 font-extrabold text-sm bg-emerald-100/70 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 size={16} />
                          {Math.round(testResult.score || 0)}/100 điểm
                        </span>
                        <div className="flex items-center gap-2">
                          {test.isRetakable && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartDirectTest(test, true)
                              }}
                              disabled={isStartingTest}
                              className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 transition-colors flex items-center gap-1 shadow-2xs"
                              title="Làm lại bài ngay (đề sẽ được xáo trộn)"
                            >
                              <RotateCcw size={12} />
                              <span>Làm lại</span>
                            </button>
                          )}
                          <span className="text-indigo-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Xem đáp án <ChevronRight size={14} />
                          </span>
                        </div>
                      </>
                    ) : isInProgress ? (
                      <>
                        <span className="text-amber-700 font-bold text-xs bg-amber-100/70 px-2.5 py-1.5 rounded-lg">
                          Chưa nộp bài
                        </span>
                        <span className="text-amber-700 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Tiếp tục làm <ChevronRight size={16} />
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-400 font-medium text-xs">Chưa bắt đầu</span>
                        <span className="text-indigo-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Bắt đầu thi <ChevronRight size={16} />
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* LỘ TRÌNH HỌC TẬP (UNITS) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <BookA className="text-indigo-500" />
          Lộ trình học tập (Units)
        </h2>

        {publishedUnits.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-lg font-medium">Giáo viên chưa mở bài học nào.</p>
            <p className="text-sm text-gray-400 mt-1">Hãy quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortUnits(publishedUnits).map((unit, index) => (
              <Link
                key={unit.id}
                href={`/student/classes/${classId}/units/${unit.id}`}
                className="group flex flex-col bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">
                    Đã mở
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{unit.title}</h3>
                {unit.description && (
                  <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">
                    {unit.description}
                  </p>
                )}

                <div className="mt-auto flex items-center text-indigo-600 font-semibold group-hover:text-indigo-700 gap-2">
                  <PlayCircle size={18} />
                  Vào học ngay
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
