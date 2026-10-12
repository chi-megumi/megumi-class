'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  BookA,
  PlayCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Trophy,
  AlertCircle,
} from 'lucide-react'
import { ClassData, ExamData } from '@/modules/teacher/types'
import GamePlayerModal from '@/modules/student/components/unit/GamePlayerModal'
import { startTest } from '@/actions/analytics'

type StudentClassDashboardClientProps = {
  classData: ClassData
  classId: string
}

export default function StudentClassDashboardClient({
  classData,
  classId,
}: StudentClassDashboardClientProps) {
  const [activeTest, setActiveTest] = useState<ExamData | null>(null)
  const [confirmTest, setConfirmTest] = useState<ExamData | null>(null)
  const [isStartingTest, setIsStartingTest] = useState(false)
  const [testSessionData, setTestSessionData] = useState<Record<string, any>>({})

  // Published and enabled class-level exams
  const publishedClassExams = (classData.exams || []).filter((t) => t.isEnabled && t.isPublished)

  const getExamResult = (test: ExamData) => {
    if (!test) return undefined
    if (testSessionData[test.id]) return testSessionData[test.id]
    if (test.results && test.results[0]) {
      const r = test.results[0]
      const payload = r.answers || {}
      return {
        score: r.score ?? payload.score,
        startedAt: r.startedAt ? new Date(r.startedAt).toISOString() : undefined,
        completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : undefined,
        answers: payload.answers || payload,
        correctAnswersDetail: payload.correctAnswersDetail,
        correctAnswers: payload.correctAnswers,
        totalQuestions: payload.totalQuestions,
      }
    }
    return undefined
  }

  return (
    <div className="w-full flex flex-col gap-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Test Runner Modal */}
      {activeTest && (
        <GamePlayerModal
          mode="test"
          testData={activeTest}
          initialResult={getExamResult(activeTest)}
          onClose={() => setActiveTest(null)}
          onTestComplete={(testId, result) => {
            setTestSessionData((prev) => ({
              ...prev,
              [testId]: {
                ...prev[testId],
                score: result.score,
                completedAt: result.completedAt || new Date().toISOString(),
                correctAnswersDetail: result.correctAnswersDetail,
                answers: result.answers,
                correctAnswers: result.correctAnswers,
                totalQuestions: result.totalQuestions,
              },
            }))
          }}
        />
      )}

      {/* Test Confirmation Modal */}
      {confirmTest && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-4">
              📝
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Sẵn sàng làm bài?</h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
              Bạn sắp bắt đầu làm bài kiểm tra tổng hợp{' '}
              <strong className="text-gray-900">{confirmTest.title}</strong>.<br />
              Thời gian giới hạn:{' '}
              <strong className="text-indigo-600">{confirmTest.duration} phút</strong>.
              <br />
              <br />
              <span className="text-rose-600 font-semibold block bg-rose-50 p-3 rounded-xl border border-rose-100">
                ⚠️ Lưu ý quan trọng: Một khi đã bấm bắt đầu, đồng hồ sẽ đếm ngược liên tục. Bạn
                không thể làm lại sau khi nộp bài.
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmTest(null)}
                className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Chưa sẵn sàng
              </button>
              <button
                onClick={async () => {
                  if (isStartingTest) return
                  setIsStartingTest(true)
                  try {
                    const res = await startTest({
                      classId,
                      testId: confirmTest.id,
                    })
                    if (res.success && res.startedAt) {
                      setTestSessionData((prev) => ({
                        ...prev,
                        [confirmTest.id]: {
                          ...(getExamResult(confirmTest) || {}),
                          startedAt: res.startedAt,
                        },
                      }))
                    }
                    setActiveTest(confirmTest)
                    setConfirmTest(null)
                  } catch (e) {
                    alert('Lỗi khởi tạo bài thi. Vui lòng thử lại.')
                  } finally {
                    setIsStartingTest(false)
                  }
                }}
                disabled={isStartingTest}
                className="flex-1 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
              >
                {isStartingTest ? 'Đang chuẩn bị...' : 'Bắt đầu ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Banner / Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white mb-4 border border-white/20">
            <Sparkles size={14} /> Khóa học & Lớp học
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">
            {classData.name}
          </h1>
          {classData.description && (
            <p className="text-indigo-100 mb-6 text-base md:text-lg leading-relaxed">
              {classData.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-white/15 backdrop-blur-md rounded-xl text-sm font-semibold border border-white/20">
              📚 {classData.units.length} bài học
            </div>
            {publishedClassExams.length > 0 && (
              <div className="px-4 py-2 bg-white/25 backdrop-blur-md rounded-xl text-sm font-bold border border-white/30 text-yellow-200 flex items-center gap-1.5">
                <Trophy size={16} /> {publishedClassExams.length} bài thi tổng hợp
              </div>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-8 -bottom-8 text-9xl opacity-10 select-none pointer-events-none rotate-12">
          🎓
        </div>
      </div>

      {/* KHU VỰC BÀI THI TỔNG HỢP CẤP LỚP (BIG EXAMS) */}
      {publishedClassExams.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                Bài Kiểm Tra Tổng Hợp
              </h2>
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
                      setActiveTest(test)
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
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isInProgress
                            ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                            : test.duration <= 15
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {isCompleted
                        ? 'Đã hoàn thành'
                        : isInProgress
                          ? 'Đang làm dở ⏱️'
                          : test.duration <= 15
                            ? 'Mini Thử Thách ⚡'
                            : 'Đề Tổng Hợp ⭐'}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-100 shadow-2xs">
                      <Clock size={12} className="text-gray-400" />
                      {test.duration} phút
                    </span>
                  </div>

                  {/* Body */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
                      {test.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                      {isCompleted
                        ? 'Bạn đã nộp bài. Bấm vào đây để xem lại chi tiết câu hỏi và đáp án đúng.'
                        : isInProgress
                          ? 'Bạn đang làm dở bài thi này. Hãy tiếp tục để hoàn thành trước khi hết giờ!'
                          : 'Bài thi đánh giá tổng hợp. Bấm để bắt đầu làm bài khi bạn đã sẵn sàng.'}
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
                        <span className="text-indigo-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Xem đáp án <ChevronRight size={14} />
                        </span>
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

        {classData.units.length === 0 ? (
          <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-lg font-medium">Giáo viên chưa mở bài học nào.</p>
            <p className="text-sm text-gray-400 mt-1">Hãy quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classData.units.map((unit, index) => (
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
