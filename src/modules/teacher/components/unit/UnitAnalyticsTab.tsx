'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  Search,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Eye,
  ChevronRight,
  Loader2,
  Clock,
} from 'lucide-react'
import { UnitData, EnrollmentData, ExamData, StudentAnalyticsData } from '../../types'
import { getUnitAnalytics } from '@/actions/analytics'
import type { UnitAnalyticsResult } from '@/actions/analytics/types'
import { useSpeech } from '@/components/flashcards/hooks/useSpeech'
import UnitProgressStudentRow from '../overview/UnitProgressStudentRow'

type UnitAnalyticsTabProps = {
  unit: UnitData
  activeStudents?: EnrollmentData[]
  classExams?: ExamData[]
  onViewExamResults?: (exam: ExamData) => void
}

const EMPTY_VOCAB_STATS: NonNullable<UnitAnalyticsResult['vocabStats']> = []

export default function UnitAnalyticsTab({
  unit,
  activeStudents = [],
  classExams = [],
  onViewExamResults,
}: UnitAnalyticsTabProps) {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<UnitAnalyticsResult | null>(null)
  const [subTab, setSubTab] = useState<'vocab' | 'students' | 'exams'>('vocab')
  const { speak, isSpeaking } = useSpeech()

  // Filter & Search states for Vocab Mistake view
  const [vocabSearch, setVocabSearch] = useState('')
  const [vocabFilter, setVocabFilter] = useState<'all' | 'hard' | 'medium' | 'easy'>('all')
  const [vocabSort, setVocabSort] = useState<'error' | 'attempts' | 'alpha'>('error')

  // Filter & Search states for Student Progress view
  const [studentSearch, setStudentSearch] = useState('')
  const [studentStatusFilter, setStudentStatusFilter] = useState<
    'all' | 'completed' | 'in_progress' | 'not_started'
  >('all')
  const [studentSort, setStudentSort] = useState<'mastery_desc' | 'mastery_asc' | 'name'>(
    'mastery_desc',
  )

  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      try {
        const res = await getUnitAnalytics(unit.id)
        if (!ignore) {
          setAnalyticsData(res)
        }
      } catch (err) {
        console.error('Failed to load unit analytics:', err)
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [unit.id])

  // Fallback student list if server action has not returned yet
  const fallbackStudents: StudentAnalyticsData[] = useMemo(() => {
    const publishedUnitExams = (unit.exams || []).filter((e) => e.isPublished)
    const publishedClassExams = (classExams || []).filter((e) => e.isPublished)

    return activeStudents.map((enrollment) => {
      const progress = unit.studentProgress?.find((p) => p.userId === enrollment.student.id)
      const history = (progress?.activityHistory as Record<string, unknown> | null) || {}
      const flashcardHistory = Array.isArray(history.flashcard) ? history.flashcard : []
      const quizHistory = Array.isArray(history.quiz) ? history.quiz : []
      const matchHistory = Array.isArray(history.match) ? history.match : []

      const allExams = [
        ...publishedUnitExams.map((exam) => {
          const res = exam.results?.find((r) => r.studentId === enrollment.student.id)
          return {
            id: exam.id,
            title: exam.title,
            type: 'unit' as const,
            unitTitle: unit.title,
            duration: exam.duration,
            isCompleted: !!res?.completedAt,
            isInProgress: !res?.completedAt && !!res?.startedAt,
            score: res?.score ?? null,
            completedAt: res?.completedAt || null,
            startedAt: res?.startedAt || null,
            answers: {},
            content: exam.content,
          }
        }),
        ...publishedClassExams.map((exam) => {
          const res = exam.results?.find((r) => r.studentId === enrollment.student.id)
          return {
            id: exam.id,
            title: exam.title,
            type: 'class' as const,
            unitTitle: 'Đề Tổng Hợp',
            duration: exam.duration,
            isCompleted: !!res?.completedAt,
            isInProgress: !res?.completedAt && !!res?.startedAt,
            score: res?.score ?? null,
            completedAt: res?.completedAt || null,
            startedAt: res?.startedAt || null,
            answers: {},
            content: exam.content,
          }
        }),
      ]

      return {
        student: enrollment.student,
        masteryProgress: progress?.masteryProgress || 0,
        games: {
          flashcard: {
            played: (progress?.flashcardPlayCount || 0) > 0,
            progress: progress?.masteryProgress || 0,
            timesPlayed: progress?.flashcardPlayCount || 0,
            history: flashcardHistory as import('../../types').PracticeSessionEntry[],
          },
          quiz: {
            played: (progress?.quizPlayCount || 0) > 0,
            score: progress?.bestQuizScore || 0,
            timesPlayed: progress?.quizPlayCount || 0,
            history: quizHistory as import('../../types').PracticeSessionEntry[],
          },
          match: {
            played: (progress?.matchPlayCount || 0) > 0,
            bestTime: progress?.bestMatchTime || null,
            timesPlayed: progress?.matchPlayCount || 0,
            history: matchHistory as import('../../types').PracticeSessionEntry[],
          },
        },
        exams: allExams,
      }
    })
  }, [unit, activeStudents, classExams])

  const students = analyticsData?.students || fallbackStudents
  const vocabStats = analyticsData?.vocabStats ?? EMPTY_VOCAB_STATS

  // Compute summary stats with fallbacks
  const totalStudents = students.length
  const participatedStudents = students.filter(
    (s) =>
      s.masteryProgress > 0 ||
      s.games.flashcard.played ||
      s.games.quiz.played ||
      s.games.match.played ||
      s.exams?.some((e) => e.isCompleted || e.isInProgress),
  ).length

  const participationRate =
    totalStudents > 0 ? Math.round((participatedStudents / totalStudents) * 100) : 0

  const sumMastery = students.reduce((acc, s) => acc + (s.masteryProgress || 0), 0)
  const avgMastery =
    participatedStudents > 0
      ? Math.round(sumMastery / participatedStudents)
      : totalStudents > 0
        ? Math.round(sumMastery / totalStudents)
        : 0

  const quizScores = students
    .filter((s) => s.games.quiz.played && s.games.quiz.score > 0)
    .map((s) => s.games.quiz.score)
  const avgQuizScore =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : 0

  const examScores = students.flatMap((s) =>
    (s.exams || []).filter((e) => e.isCompleted && e.score !== null).map((e) => e.score as number),
  )
  const avgExamScore =
    examScores.length > 0
      ? Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length)
      : 0

  const hardVocabs = vocabStats.filter((v) => v.difficultyLevel === 'hard')
  const mediumVocabs = vocabStats.filter((v) => v.difficultyLevel === 'medium')
  const easyVocabs = vocabStats.filter((v) => v.difficultyLevel === 'easy')

  // Top 3 difficult words for the highlight insight card
  const topMistakenVocabs = useMemo(() => {
    return [...vocabStats].filter((v) => v.incorrectCount > 0 || v.errorRate > 20).slice(0, 3)
  }, [vocabStats])

  // Filtered & sorted Vocab stats
  const filteredVocabs = useMemo(() => {
    return vocabStats
      .filter((v) => {
        const matchesSearch =
          v.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
          v.vi.toLowerCase().includes(vocabSearch.toLowerCase())
        if (!matchesSearch) return false

        if (vocabFilter === 'hard') return v.difficultyLevel === 'hard'
        if (vocabFilter === 'medium') return v.difficultyLevel === 'medium'
        if (vocabFilter === 'easy') return v.difficultyLevel === 'easy'
        return true
      })
      .sort((a, b) => {
        if (vocabSort === 'error') {
          if (b.errorRate !== a.errorRate) return b.errorRate - a.errorRate
          return b.incorrectCount - a.incorrectCount
        }
        if (vocabSort === 'attempts') return b.totalAttempts - a.totalAttempts
        return a.word.localeCompare(b.word)
      })
  }, [vocabStats, vocabSearch, vocabFilter, vocabSort])

  // Filtered & sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          (s.student.email && s.student.email.toLowerCase().includes(studentSearch.toLowerCase()))
        if (!matchesSearch) return false

        const isCompleted = s.masteryProgress === 100
        const isNotStarted =
          s.masteryProgress === 0 &&
          !s.games.flashcard.played &&
          !s.games.quiz.played &&
          !s.games.match.played &&
          !(s.exams || []).some((e) => e.isCompleted)
        const isInProgress = !isCompleted && !isNotStarted

        if (studentStatusFilter === 'completed') return isCompleted
        if (studentStatusFilter === 'in_progress') return isInProgress
        if (studentStatusFilter === 'not_started') return isNotStarted
        return true
      })
      .sort((a, b) => {
        if (studentSort === 'mastery_desc') return b.masteryProgress - a.masteryProgress
        if (studentSort === 'mastery_asc') return a.masteryProgress - b.masteryProgress
        return a.student.name.localeCompare(b.student.name)
      })
  }, [students, studentSearch, studentStatusFilter, studentSort])

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
      {/* Top Banner Toolbar */}
      <div className="px-6 py-2.5 bg-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
              Phân tích học tập
            </span>
            <h3 className="text-base font-bold text-gray-800">
              Báo cáo tiến độ: <span className="text-[#6A5EEB]">{unit.title}</span>
            </h3>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Theo dõi chuyên cần và phát hiện các từ vựng học sinh hay làm sai.
          </p>
        </div>
      </div>

      {/* KPI Cards Banner */}
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
              <span className="text-[11px] text-gray-400 font-medium">
                ({unit.vocabItems?.length || 0} từ)
              </span>
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
              <span className="text-lg font-black text-purple-600">
                {avgExamScore > 0 ? avgExamScore : avgQuizScore > 0 ? avgQuizScore : 0}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">/ 100đ</span>
            </div>
            <div className="mt-1.5">
              <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${avgExamScore > 0 ? avgExamScore : avgQuizScore > 0 ? avgQuizScore : 0}%`,
                  }}
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
                  hardVocabs.length > 0
                    ? 'bg-rose-50 text-rose-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {hardVocabs.length > 0 ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />}
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`text-lg font-black ${
                  hardVocabs.length > 0 ? 'text-rose-600' : 'text-gray-700'
                }`}
              >
                {hardVocabs.length}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">từ hay sai</span>
            </div>
            <div className="mt-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    hardVocabs.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
                <p className="text-[10px] text-gray-500 truncate">
                  {hardVocabs.length > 0
                    ? `${hardVocabs.length} từ có tỷ lệ sai > 50%`
                    : 'Không có từ sai nghiêm trọng'}
                </p>
              </div>
              <p className="text-[9px] text-gray-400 mt-0.5 truncate">
                {mediumVocabs.length} từ TB • {easyVocabs.length} từ đã vững
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Pills */}
      <div className="px-6 py-1.5 shrink-0 flex items-center justify-between border-b border-gray-200/60 bg-white">
        <div className="flex gap-1.5">
          <button
            onClick={() => setSubTab('vocab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'vocab'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <BookOpen size={14} />
            <span>Phân tích từ vựng & Lỗi sai</span>
            {hardVocabs.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  subTab === 'vocab' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {hardVocabs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSubTab('students')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'students'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <GraduationCap size={14} />
            <span>Tiến độ từng học sinh</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                subTab === 'students' ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('exams')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              subTab === 'exams'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <ClipboardList size={14} />
            <span>Bài kiểm tra Unit</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                subTab === 'exams' ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {(unit.exams || []).filter((e) => e.isPublished).length}
            </span>
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
            <Loader2 size={13} className="animate-spin" />
            <span>Đang tải...</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
        {/* VIEW 1: VOCABULARY MISTAKE ANALYTICS */}
        {subTab === 'vocab' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {/* Top Insight Alert Card */}
            {topMistakenVocabs.length > 0 ? (
              <div className="bg-gradient-to-r from-amber-50 via-rose-50/60 to-indigo-50/40 border border-amber-200/80 rounded-xl p-3.5 shadow-2xs relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                      Gợi ý giảng dạy cho giáo viên
                    </h4>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                      Phát hiện học sinh trong lớp hay làm sai hoặc nhầm lẫn ở các từ sau:{' '}
                      {topMistakenVocabs.map((v, i) => (
                        <span key={v.id}>
                          <span className="font-bold text-rose-700 bg-white/80 px-1.5 py-0.5 rounded border border-rose-200 text-[11px]">
                            {v.word} ({v.vi})
                          </span>
                          {i < topMistakenVocabs.length - 1 ? ', ' : '.'}
                        </span>
                      ))}
                    </p>
                    <p className="text-[11px] text-indigo-700 font-semibold mt-1 flex items-center gap-1">
                      💡 Mẹo: Dành 5-10 phút đầu buổi học để ôn tập lại cách phát âm và các cặp từ
                      dễ nhầm này!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">
                    Lớp học nắm từ vựng rất tốt!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Chưa ghi nhận từ vựng nào có tỷ lệ sai vượt mức quy định.
                  </p>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-2 rounded-xl border border-gray-200/80 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-56">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Tìm từ vựng hoặc nghĩa..."
                    value={vocabSearch}
                    onChange={(e) => setVocabSearch(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setVocabFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      vocabFilter === 'all'
                        ? 'bg-white text-gray-800 shadow-2xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Tất cả ({vocabStats.length})
                  </button>
                  <button
                    onClick={() => setVocabFilter('hard')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      vocabFilter === 'hard'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    <span>Khó</span>
                    <span className="text-[10px] font-bold">({hardVocabs.length})</span>
                  </button>
                  <button
                    onClick={() => setVocabFilter('medium')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      vocabFilter === 'medium'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    <span>Trung bình</span>
                    <span className="text-[10px] font-bold">({mediumVocabs.length})</span>
                  </button>
                  <button
                    onClick={() => setVocabFilter('easy')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      vocabFilter === 'easy'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    <span>Nắm vững</span>
                    <span className="text-[10px] font-bold">({easyVocabs.length})</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Sắp xếp:</span>
                <select
                  value={vocabSort}
                  onChange={(e) => setVocabSort(e.target.value as typeof vocabSort)}
                  className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="error">Tỷ lệ sai cao nhất</option>
                  <option value="attempts">Số lượt kiểm tra nhiều nhất</option>
                  <option value="alpha">Theo bảng chữ cái (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Vocab Stats List */}
            {filteredVocabs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center">
                <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-600">
                  Không tìm thấy từ vựng nào khớp với bộ lọc
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc &quot;Tất cả&quot;.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredVocabs.map((vocab) => {
                  const isHard = vocab.difficultyLevel === 'hard'
                  const isMedium = vocab.difficultyLevel === 'medium'

                  return (
                    <div
                      key={vocab.id}
                      className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                        isHard
                          ? 'border-rose-200/90 hover:border-rose-300 bg-rose-50/10'
                          : isMedium
                            ? 'border-amber-200/80 hover:border-amber-300'
                            : 'border-gray-200/80 hover:border-indigo-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: Word details */}
                        <div className="flex items-start gap-3.5 min-w-[280px]">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 text-indigo-700 flex items-center justify-center text-xl shrink-0 border border-indigo-100">
                            {vocab.emoji || '📖'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-gray-900">
                                {vocab.word}
                              </span>
                              <button
                                onClick={() => speak(vocab.word)}
                                disabled={isSpeaking}
                                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Nghe phát âm"
                              >
                                <Volume2 size={16} />
                              </button>
                              {vocab.pos && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                                  {vocab.pos}
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isHard
                                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                    : isMedium
                                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {isHard ? 'Khó — Cần lưu ý' : isMedium ? 'Trung bình' : 'Nắm vững'}
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                              {vocab.ipa || '/—/'}
                            </p>
                            <p className="text-sm font-semibold text-gray-700 mt-1">{vocab.vi}</p>

                            {vocab.example && (
                              <p className="text-xs text-gray-500 italic mt-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                &ldquo;{vocab.example}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Middle: Accuracy / Error Rate Bar */}
                        <div className="flex-1 max-w-xs px-2">
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="font-bold text-emerald-600">
                              Đúng: {vocab.accuracyRate}%
                            </span>
                            <span
                              className={`font-bold ${
                                vocab.errorRate > 0 ? 'text-rose-600' : 'text-gray-400'
                              }`}
                            >
                              Sai: {vocab.errorRate}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                            <div
                              className="bg-emerald-500 h-full transition-all"
                              style={{ width: `${vocab.accuracyRate}%` }}
                              title={`Làm đúng: ${vocab.correctCount} lượt`}
                            />
                            <div
                              className="bg-rose-500 h-full transition-all"
                              style={{ width: `${vocab.errorRate}%` }}
                              title={`Làm sai: ${vocab.incorrectCount} lượt`}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
                            <span>
                              {vocab.totalAttempts > 0
                                ? `${vocab.totalAttempts} lượt làm bài`
                                : 'Chưa có lượt kiểm tra'}
                            </span>
                            <span>{vocab.masteryRate}% học sinh thuộc</span>
                          </div>
                        </div>

                        {/* Right: Common Mistakes Pill List */}
                        <div className="min-w-[240px] max-w-sm">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            Lỗi sai thường gặp:
                          </p>
                          {vocab.commonMistakes.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {vocab.commonMistakes.slice(0, 3).map((m, idx) => (
                                <div
                                  key={idx}
                                  className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-1.5"
                                  title={`Học sinh nhầm với ${m.wrongWord} ${m.count} lần`}
                                >
                                  <XCircle size={12} className="text-rose-500 shrink-0" />
                                  <span className="font-bold truncate max-w-[120px]">
                                    {m.wrongWord}
                                  </span>
                                  <span className="text-[10px] text-rose-500">
                                    ({m.count} lần • {m.percentage}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic flex items-center gap-1">
                              <CheckCircle2 size={13} className="text-emerald-500" />
                              Không ghi nhận lỗi sai phổ biến
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: STUDENT PROGRESS TABLE */}
        {subTab === 'students' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Tìm tên hoặc email học sinh..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setStudentStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      studentStatusFilter === 'all'
                        ? 'bg-white text-gray-800 shadow-2xs'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Tất cả ({students.length})
                  </button>
                  <button
                    onClick={() => setStudentStatusFilter('completed')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      studentStatusFilter === 'completed'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    Đã thuộc 100%
                  </button>
                  <button
                    onClick={() => setStudentStatusFilter('in_progress')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      studentStatusFilter === 'in_progress'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    Đang học
                  </button>
                  <button
                    onClick={() => setStudentStatusFilter('not_started')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      studentStatusFilter === 'not_started'
                        ? 'bg-gray-700 text-white shadow-2xs'
                        : 'text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Chưa bắt đầu
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">Sắp xếp:</span>
                <select
                  value={studentSort}
                  onChange={(e) => setStudentSort(e.target.value as typeof studentSort)}
                  className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="mastery_desc">Tiến độ thuộc từ (Cao → Thấp)</option>
                  <option value="mastery_asc">Tiến độ thuộc từ (Thấp → Cao)</option>
                  <option value="name">Tên học sinh (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="py-4 px-6 font-bold w-1/4">Học sinh</th>
                      <th className="py-4 px-6 font-bold w-1/4">Tiến độ thuộc từ</th>
                      <th className="py-4 px-6 font-bold w-1/4">Hoạt động luyện tập</th>
                      <th className="py-4 px-6 font-bold w-1/4">
                        Bài kiểm tra ({unit.exams?.length || 0})
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                          Không tìm thấy học sinh nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((data) => (
                        <UnitProgressStudentRow key={data.student.id} data={data} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: UNIT EXAMS PERFORMANCE */}
        {subTab === 'exams' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header info */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Danh sách bài kiểm tra trong Unit
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Theo dõi kết quả điểm số, số lượt nộp bài và phân tích thống kê từng bài thi.
                </p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-100">
                {(unit.exams || []).filter((e) => e.isPublished).length} bài thi đang mở
              </span>
            </div>

            {/* Exams Grid */}
            {!(unit.exams && unit.exams.length > 0) ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center">
                <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-bold text-gray-600">
                  Chưa có bài kiểm tra nào trong Unit này
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Chuyển sang tab &quot;Hoạt động &amp; Trò chơi&quot; để tạo bài kiểm tra hoặc đề
                  thi AI.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(unit.exams || []).map((exam) => {
                  const completedResults = (exam.results || []).filter((r) => r.completedAt)
                  const submissionsCount = completedResults.length
                  const scores = completedResults.map((r) => r.score ?? 0)
                  const avg =
                    scores.length > 0
                      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                      : 0
                  const max = scores.length > 0 ? Math.max(...scores) : 0
                  const min = scores.length > 0 ? Math.min(...scores) : 0

                  return (
                    <div
                      key={exam.id}
                      className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                exam.isPublished ? 'bg-emerald-500' : 'bg-gray-300'
                              }`}
                            />
                            <h5 className="font-bold text-gray-900 text-sm">{exam.title}</h5>
                          </div>
                          <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1 shrink-0">
                            <Clock size={12} />
                            {exam.duration} phút
                          </span>
                        </div>

                        {/* Metric summary */}
                        <div className="grid grid-cols-3 gap-2 mt-4 bg-gray-50/80 p-3 rounded-xl border border-gray-100 text-center">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Đã nộp bài
                            </p>
                            <p className="text-base font-black text-gray-800 mt-0.5">
                              {submissionsCount}
                              <span className="text-xs font-normal text-gray-400">
                                /{totalStudents}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Điểm TB
                            </p>
                            <p className="text-base font-black text-indigo-600 mt-0.5">
                              {submissionsCount > 0 ? `${avg}đ` : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                              Cao / Thấp
                            </p>
                            <p className="text-base font-black text-emerald-600 mt-0.5">
                              {submissionsCount > 0 ? `${max} / ${min}` : '—'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {submissionsCount === totalStudents
                            ? '100% học sinh đã hoàn thành'
                            : `${totalStudents - submissionsCount} học sinh chưa nộp`}
                        </span>

                        {onViewExamResults && (
                          <button
                            onClick={() => onViewExamResults(exam)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
                          >
                            <Eye size={14} />
                            <span>Xem chi tiết</span>
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
