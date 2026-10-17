'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  X,
  User,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  BarChart3,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react'
import { getTestSubmissions, getExamQuestionAnalytics } from '@/actions/analytics/exam-analytics'
import { ExamData, StudentData, TestBlock, TestContent, TestQuestion } from '../../types'
import { formatDateTime } from '../../utils/date'
import Portal from '@/components/common/Portal'

type Submission = {
  user: StudentData
  result: {
    score: number
    correctAnswers: number
    totalQuestions: number
    completedAt: string | Date
    startedAt?: string | Date
    answers: Record<string, string | number>
    correctAnswersDetail?: Record<string, string | number>
  }
}

type QuestionAnalytics = {
  examId: string
  title: string
  duration: number
  totalSubmissions: number
  averageScore: number
  highestScore: number
  lowestScore: number
  hardQuestionsCount: number
  questionStats: Array<{
    id: string
    blockId: string
    blockTitle: string
    type: string
    questionText: string
    correctAnswerText: string
    totalAttempts: number
    correctCount: number
    incorrectCount: number
    accuracyRate: number
    isHardQuestion: boolean
    difficultyLevel: 'hard' | 'medium' | 'easy'
    mistakes: Array<{ answer: string; count: number; percentage: number }>
  }>
}

type TestResultsModalProps = {
  unitId?: string
  testId: string
  testTitle: string
  testData: ExamData | TestContent
  onClose: () => void
}

export default function TestResultsModal({
  testId,
  testTitle,
  testData,
  onClose,
}: TestResultsModalProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'analytics'>('leaderboard')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [analytics, setAnalytics] = useState<QuestionAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'hard' | 'medium' | 'easy'>(
    'all',
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const subs = await getTestSubmissions(testId)
        // Sort submissions by score descending, then completedAt ascending
        const sorted = (subs || []).sort((a: Submission, b: Submission) => {
          if (b.result.score !== a.result.score) return b.result.score - a.result.score
          return new Date(a.result.completedAt).getTime() - new Date(b.result.completedAt).getTime()
        })
        setSubmissions(sorted)
        if (sorted.length > 0) {
          setSelectedSubmission(sorted[0])
        }

        // Fetch question analytics in parallel
        setIsLoadingAnalytics(true)
        const analyticsData = await getExamQuestionAnalytics(testId)
        setAnalytics(analyticsData as unknown as QuestionAnalytics)
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError('Lỗi khi tải kết quả bài thi')
        }
      } finally {
        setIsLoading(false)
        setIsLoadingAnalytics(false)
      }
    }
    fetchData()
  }, [testId])

  const filteredQuestions =
    analytics?.questionStats.filter((q) => {
      if (filterDifficulty === 'all') return true
      return q.difficultyLevel === filterDifficulty
    }) || []

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-gray-200/50">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:px-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-indigo-50/40 to-purple-50/30 gap-4">
            <div className="w-full">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 text-[11px] font-black uppercase tracking-wider">
                  Báo Cáo Bài Thi
                </span>
                <h2 className="text-xl md:text-2xl font-black text-gray-900">{testTitle}</h2>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Thời gian làm bài: {testData.duration || 45} phút | Tổng số lượt nộp:{' '}
                <b>{submissions.length}</b> học sinh
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Tabs */}
              <div className="flex p-1 bg-white/80 backdrop-blur rounded-2xl border border-indigo-100 shadow-xs text-xs font-bold">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                    activeTab === 'leaderboard'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <Award size={15} /> Bảng Xếp Hạng ({submissions.length})
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <BarChart3 size={15} /> Phân Tích Câu Hỏi
                  {(analytics?.hardQuestionsCount || 0) > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                      {analytics?.hardQuestionsCount}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white text-gray-400 hover:text-gray-700 rounded-full transition-colors shrink-0 shadow-xs"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          {activeTab === 'leaderboard' ? (
            <div className="flex-1 overflow-auto p-6 flex flex-col md:flex-row gap-6">
              {/* Danh sách học sinh nộp bài & Bảng xếp hạng */}
              <div className="w-full md:w-1/3 flex flex-col gap-3 md:border-r border-gray-100 md:pr-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <Award size={16} className="text-amber-500" /> Bảng xếp hạng nộp bài
                  </h3>
                  <span className="text-xs font-semibold text-gray-400">
                    {submissions.length} em
                  </span>
                </div>

                {isLoading ? (
                  <div className="text-center py-10 text-gray-400">Đang tải bảng xếp hạng...</div>
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

                      return (
                        <button
                          key={sub.user.id}
                          onClick={() => setSelectedSubmission(sub)}
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
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {sub.user.name}
                            </p>
                            {(() => {
                              const dt = formatDateTime(sub.result.completedAt)
                              if (!dt) {
                                return (
                                  <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                                    <Clock size={11} /> Chưa có giờ nộp
                                  </p>
                                )
                              }
                              return (
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
                              )
                            })()}
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

              {/* Chi tiết bài làm */}
              <div className="flex-1">
                {selectedSubmission ? (
                  <div>
                    {(() => {
                      const dt = formatDateTime(selectedSubmission.result.completedAt)
                      return (
                        <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 flex-wrap gap-3">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-xl font-bold text-indigo-600 border border-indigo-100">
                              {selectedSubmission.result.score}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-base">{selectedSubmission.user.name}</p>
                              <p className="text-sm text-gray-500">
                                Đúng {selectedSubmission.result.correctAnswers}/
                                {selectedSubmission.result.totalQuestions} câu
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
                      )
                    })()}

                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-700">Chi tiết đáp án:</h4>
                      {(
                        ((testData as { content?: TestBlock[]; blocks?: TestBlock[] }).content ||
                          (testData as { content?: TestBlock[]; blocks?: TestBlock[] }).blocks ||
                          []) as TestBlock[]
                      ).map((block: TestBlock, index: number) => (
                        <div
                          key={block.id}
                          className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm mb-4"
                        >
                          <div className="font-bold text-indigo-700 mb-4 pb-2 border-b">
                            Phần {index + 1}: {block.title}
                          </div>

                          {block.type === 'multiple_choice' && (
                            <div className="space-y-6">
                              {block.content?.questions?.map((q: TestQuestion, qIndex: number) => {
                                const studentAns = selectedSubmission.result.answers[q.id] as number
                                const correctAns =
                                  (selectedSubmission.result.correctAnswersDetail?.[
                                    q.id
                                  ] as number) ?? q.correctIndex

                                return (
                                  <div key={q.id} className="space-y-2">
                                    <p className="font-medium text-gray-800">
                                      {qIndex + 1}. {q.text}
                                    </p>
                                    <div className="grid grid-cols-1 gap-2 pl-4">
                                      {(q.options || []).map((opt, oIdx) => {
                                        const isStudentChoice = studentAns === oIdx
                                        const isCorrectChoice = correctAns === oIdx

                                        return (
                                          <div
                                            key={oIdx}
                                            className={`p-3 rounded-lg border flex items-center gap-2 ${
                                              isCorrectChoice
                                                ? 'bg-green-50 border-green-200 text-green-800'
                                                : isStudentChoice && !isCorrectChoice
                                                  ? 'bg-red-50 border-red-200 text-red-800'
                                                  : 'bg-gray-50 border-gray-100 text-gray-600'
                                            }`}
                                          >
                                            <div
                                              className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                                                isCorrectChoice
                                                  ? 'bg-green-500 border-green-500 text-white'
                                                  : isStudentChoice && !isCorrectChoice
                                                    ? 'bg-red-500 border-red-500 text-white'
                                                    : 'border-gray-300'
                                              }`}
                                            >
                                              {isCorrectChoice ? '✓' : isStudentChoice ? '✗' : ''}
                                            </div>
                                            <span>{opt}</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {block.type === 'fill_blank' &&
                            (() => {
                              const questions =
                                block.content?.questions && block.content.questions.length > 0
                                  ? block.content.questions
                                  : [
                                      {
                                        id: block.id,
                                        text: block.content?.text || '',
                                        answer: block.content?.answer || '',
                                      },
                                    ]

                              return (
                                <div className="space-y-4">
                                  {questions.map((q: TestQuestion, qIdx: number) => {
                                    const studentAns = String(
                                      selectedSubmission.result.answers[q.id] || '',
                                    ).trim()
                                    const correctAns = String(
                                      selectedSubmission.result.correctAnswersDetail?.[q.id] ||
                                        q.answer ||
                                        '',
                                    ).trim()
                                    const isCorrect =
                                      studentAns.toLowerCase() === correctAns.toLowerCase()

                                    return (
                                      <div
                                        key={q.id}
                                        className="p-4 rounded-xl border bg-gray-50/50 space-y-2"
                                      >
                                        <p className="font-medium text-gray-800">
                                          {qIdx + 1}. {q.text}
                                        </p>
                                        <div className="flex items-center gap-2 pt-1">
                                          {isCorrect ? (
                                            <CheckCircle2
                                              size={16}
                                              className="text-green-500 shrink-0"
                                            />
                                          ) : (
                                            <X size={16} className="text-red-500 shrink-0" />
                                          )}
                                          <span className="text-sm font-semibold text-gray-600">
                                            Học sinh điền:
                                          </span>
                                          <span
                                            className={`text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                                          >
                                            {studentAns || '(Bỏ trống)'}
                                          </span>
                                          {!isCorrect && (
                                            <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 ml-2 font-medium">
                                              Đáp án đúng: <b>{correctAns}</b>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })()}

                          {block.type === 'matching' &&
                            (() => {
                              const pairs = block.content?.pairs || []
                              return (
                                <div className="space-y-3">
                                  {pairs.map((p, pIdx) => {
                                    const answerKey = `${block.id}_${p.id}`
                                    const studentChoice =
                                      selectedSubmission.result.answers[answerKey]
                                    const matchedPair = pairs.find(
                                      (other) => other.id === studentChoice,
                                    )
                                    const studentText = matchedPair
                                      ? matchedPair.right
                                      : studentChoice || '(Chưa ghép)'
                                    const isCorrect =
                                      studentChoice === p.id ||
                                      (p.right &&
                                        String(studentChoice).trim().toLowerCase() ===
                                          String(p.right).trim().toLowerCase())

                                    return (
                                      <div
                                        key={p.id}
                                        className="p-3.5 rounded-xl border bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                                      >
                                        <div className="flex items-center gap-2 font-medium text-gray-800">
                                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                                            {pIdx + 1}
                                          </span>
                                          <span>{p.left}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {isCorrect ? (
                                            <CheckCircle2
                                              size={16}
                                              className="text-green-500 shrink-0"
                                            />
                                          ) : (
                                            <X size={16} className="text-red-500 shrink-0" />
                                          )}
                                          <span
                                            className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
                                          >
                                            {studentText}
                                          </span>
                                          {!isCorrect && (
                                            <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 font-medium">
                                              Đúng: <b>{p.right}</b>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })()}

                          {block.type === 'reorder' &&
                            (() => {
                              const questions = block.content?.questions || []
                              const normalize = (s: string) =>
                                s
                                  .toLowerCase()
                                  .replace(/[.,!?;:]/g, '')
                                  .replace(/\s+/g, ' ')
                                  .trim()

                              return (
                                <div className="space-y-4">
                                  {questions.map((q, qIdx) => {
                                    const studentSentence = String(
                                      selectedSubmission.result.answers[q.id] || '',
                                    ).trim()
                                    const correctSentence = String(
                                      selectedSubmission.result.correctAnswersDetail?.[q.id] ||
                                        q.sentence ||
                                        '',
                                    ).trim()
                                    const isCorrect =
                                      normalize(studentSentence) === normalize(correctSentence)

                                    return (
                                      <div
                                        key={q.id}
                                        className="p-4 rounded-xl border bg-gray-50/50 space-y-2"
                                      >
                                        <p className="font-medium text-gray-800 text-sm">
                                          {qIdx + 1}. {q.text || 'Sắp xếp câu:'}
                                        </p>
                                        <div className="space-y-1 pt-1">
                                          <div className="flex items-center gap-2">
                                            {isCorrect ? (
                                              <CheckCircle2
                                                size={16}
                                                className="text-green-500 shrink-0"
                                              />
                                            ) : (
                                              <X size={16} className="text-red-500 shrink-0" />
                                            )}
                                            <span className="text-xs font-semibold text-gray-500">
                                              Học sinh ghép:
                                            </span>
                                            <span
                                              className={`text-sm font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
                                            >
                                              {studentSentence || '(Chưa làm)'}
                                            </span>
                                          </div>
                                          {!isCorrect && (
                                            <div className="text-xs text-green-700 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">
                                              Đáp án chuẩn: <b>{correctSentence}</b>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )
                            })()}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <CheckCircle2 size={48} className="mb-4 opacity-20" />
                    <p>Chọn một học sinh bên trái để xem chi tiết bài làm.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: Phân tích câu hỏi khó & Lỗ hổng kiến thức */
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {isLoadingAnalytics ? (
                <div className="text-center py-20 text-gray-400">
                  Đang phân tích dữ liệu câu hỏi...
                </div>
              ) : !analytics || analytics.totalSubmissions === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 p-8">
                  <BarChart3 className="mx-auto text-gray-300 mb-3" size={40} />
                  <h4 className="text-base font-bold text-gray-700">Chưa có dữ liệu phân tích</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Cần có ít nhất 1 học sinh nộp bài để thống kê và phân tích các câu hỏi khó.
                  </p>
                </div>
              ) : (
                <>
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-indigo-50/60 border border-indigo-100 p-4.5 rounded-2xl flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
                        <User size={22} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                          Lượt nộp bài
                        </p>
                        <p className="text-2xl font-black text-indigo-950">
                          {analytics.totalSubmissions}
                        </p>
                      </div>
                    </div>

                    <div className="bg-purple-50/60 border border-purple-100 p-4.5 rounded-2xl flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs shrink-0">
                        <BarChart3 size={22} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                          Điểm trung bình
                        </p>
                        <p className="text-2xl font-black text-purple-950">
                          {analytics.averageScore}đ
                        </p>
                      </div>
                    </div>

                    <div className="bg-emerald-50/60 border border-emerald-100 p-4.5 rounded-2xl flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                        <Award size={22} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                          Cao nhất / Thấp nhất
                        </p>
                        <p className="text-2xl font-black text-emerald-950">
                          {analytics.highestScore}đ{' '}
                          <span className="text-sm font-semibold text-gray-400">
                            / {analytics.lowestScore}đ
                          </span>
                        </p>
                      </div>
                    </div>

                    <div
                      className={`p-4.5 rounded-2xl flex items-center gap-3.5 border transition-all ${
                        analytics.hardQuestionsCount > 0
                          ? 'bg-rose-50 border-rose-200'
                          : 'bg-emerald-50 border-emerald-100'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl text-white flex items-center justify-center shadow-xs shrink-0 ${
                          analytics.hardQuestionsCount > 0 ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                      >
                        {analytics.hardQuestionsCount > 0 ? (
                          <AlertTriangle size={22} />
                        ) : (
                          <CheckCircle2 size={22} />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-[11px] font-bold uppercase tracking-wider ${
                            analytics.hardQuestionsCount > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          Câu hỏi khó (&lt;50%)
                        </p>
                        <p
                          className={`text-2xl font-black ${
                            analytics.hardQuestionsCount > 0 ? 'text-rose-950' : 'text-emerald-950'
                          }`}
                        >
                          {analytics.hardQuestionsCount} câu
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning Banner on Hard Questions */}
                  {analytics.hardQuestionsCount > 0 && (
                    <div className="p-4 bg-gradient-to-r from-rose-50 via-red-50/60 to-orange-50 border border-rose-200 rounded-2xl flex items-start gap-3.5">
                      <div className="p-2 bg-rose-500 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
                        <AlertTriangle size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-rose-900 text-sm">
                          Lỗ hổng kiến thức: Phát hiện {analytics.hardQuestionsCount} câu hỏi có tỷ
                          lệ sai trên 50%!
                        </h4>
                        <p className="text-xs text-rose-700/90 mt-1 leading-relaxed">
                          Phần lớn học sinh trong lớp đang làm sai hoặc bị bẫy ở những câu này.
                          Thầy/cô nên lọc mục <b>&quot;Câu hỏi khó&quot;</b> bên dưới để xem chi
                          tiết các đáp án sai phổ biến và củng cố lại kiến thức cho các em trong
                          buổi học tiếp theo.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Filter Tabs */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500">Lọc theo độ khó:</span>
                      <div className="flex gap-1.5 p-1 bg-gray-100/80 rounded-xl text-xs font-bold">
                        <button
                          onClick={() => setFilterDifficulty('all')}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            filterDifficulty === 'all'
                              ? 'bg-white text-gray-900 shadow-xs'
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          Tất cả ({analytics.questionStats.length})
                        </button>
                        <button
                          onClick={() => setFilterDifficulty('hard')}
                          className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                            filterDifficulty === 'hard'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          🔴 Khó (
                          {
                            analytics.questionStats.filter((q) => q.difficultyLevel === 'hard')
                              .length
                          }
                          )
                        </button>
                        <button
                          onClick={() => setFilterDifficulty('medium')}
                          className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                            filterDifficulty === 'medium'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          🟡 Trung bình (
                          {
                            analytics.questionStats.filter((q) => q.difficultyLevel === 'medium')
                              .length
                          }
                          )
                        </button>
                        <button
                          onClick={() => setFilterDifficulty('easy')}
                          className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                            filterDifficulty === 'easy'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          🟢 Nắm vững (
                          {
                            analytics.questionStats.filter((q) => q.difficultyLevel === 'easy')
                              .length
                          }
                          )
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 font-medium">
                      Hiển thị {filteredQuestions.length} câu hỏi
                    </div>
                  </div>

                  {/* Question list */}
                  <div className="space-y-4">
                    {filteredQuestions.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-gray-100">
                        Không có câu hỏi nào thuộc phân loại này.
                      </div>
                    ) : (
                      filteredQuestions.map((q, idx) => {
                        const isHard = q.difficultyLevel === 'hard'
                        const isMedium = q.difficultyLevel === 'medium'

                        return (
                          <div
                            key={`${q.blockId}_${q.id}_${idx}`}
                            className={`p-5 rounded-2xl border transition-all ${
                              isHard
                                ? 'bg-rose-50/30 border-rose-200 shadow-xs'
                                : isMedium
                                  ? 'bg-amber-50/20 border-amber-200'
                                  : 'bg-white border-gray-100 shadow-xs'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                                  {q.blockTitle}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-semibold">
                                  {q.type === 'multiple_choice'
                                    ? 'Trắc nghiệm'
                                    : q.type === 'fill_blank'
                                      ? 'Điền khuyết'
                                      : q.type === 'matching'
                                        ? 'Ghép nối'
                                        : 'Sắp xếp câu'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
                                    isHard
                                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                      : isMedium
                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {isHard ? '⚠️ Khó' : isMedium ? '🟡 Trung bình' : '✓ Nắm vững'}:{' '}
                                  {q.accuracyRate}% đúng
                                </span>
                              </div>
                            </div>

                            {/* Question text */}
                            <p className="font-bold text-gray-900 text-sm mb-3">{q.questionText}</p>

                            {/* Correct answer display */}
                            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs mb-4">
                              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                              <span className="text-emerald-800 font-medium">Đáp án chuẩn:</span>
                              <span className="font-bold text-emerald-950">
                                {q.correctAnswerText}
                              </span>
                            </div>

                            {/* Accuracy progress bar */}
                            <div className="space-y-1 mb-4">
                              <div className="flex justify-between text-xs font-bold text-gray-600">
                                <span>
                                  Tỉ lệ làm đúng: {q.correctCount}/{q.totalAttempts} em
                                </span>
                                <span
                                  className={
                                    isHard
                                      ? 'text-rose-600'
                                      : isMedium
                                        ? 'text-amber-600'
                                        : 'text-emerald-600'
                                  }
                                >
                                  {q.accuracyRate}%
                                </span>
                              </div>
                              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                                <div
                                  className={`h-full transition-all rounded-l-full ${
                                    isHard
                                      ? 'bg-rose-500'
                                      : isMedium
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${q.accuracyRate}%` }}
                                ></div>
                                <div
                                  className="h-full bg-rose-200/60 transition-all rounded-r-full"
                                  style={{ width: `${100 - q.accuracyRate}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Common mistakes */}
                            {q.mistakes.length > 0 && (
                              <div className="pt-3 border-t border-gray-100">
                                <p className="text-xs font-bold text-gray-600 mb-2 flex items-center gap-1">
                                  <TrendingDown size={14} className="text-rose-500" />
                                  Các phương án học sinh hay trả lời sai nhất:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {q.mistakes.map((m, mIdx) => (
                                    <div
                                      key={mIdx}
                                      className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5"
                                    >
                                      <span className="font-semibold line-through text-rose-600">
                                        {m.answer}
                                      </span>
                                      <span className="px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 text-[10px] font-black">
                                        {m.count} em ({m.percentage}%)
                                      </span>
                                    </div>
                                  ))}
                                </div>
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
          )}
        </div>
      </div>
    </Portal>
  )
}
