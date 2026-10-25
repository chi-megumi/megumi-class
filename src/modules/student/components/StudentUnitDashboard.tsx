'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  PlayCircle,
  Medal,
  Flame,
  Gamepad2,
  ChevronRight,
  Layers,
  HelpCircle,
  Puzzle,
} from 'lucide-react'
import type { ExamData, UnitData } from '~/modules/teacher/types'
import { useSpeech } from '@/components/flashcards/hooks/useSpeech'
import { useFlashcardStore } from '@/components/flashcards/stores/useFlashcardStore'
import GamePlayerModal from './unit/GamePlayerModal'
import { startTest } from '@/actions/analytics/exam-session'
import { syncMasteryProgress } from '@/actions/analytics/game-progress'
import type { TestResultPayload } from '@/actions/analytics/types'
import { normalizeExamHistory, calculateExamDuration } from '@/actions/analytics/history-utils'
import VocabVault from './vocabulary/VocabVault'
import TestConfirmModal from './exam/TestConfirmModal'
import StudentUnitExamsSection from './unit/StudentUnitExamsSection'
import { clearStoredExamSession } from './unit/test-view/examSessionStorage'

const StudentUnitDashboard = ({
  unitData,
  classId,
}: {
  unitData: UnitData
  classId: string
}) => {
  const router = useRouter()
  const [activeGame, setActiveGame] = useState<'flashcard' | 'quiz' | 'match' | null>(null)
  const [confirmTest, setConfirmTest] = useState<ExamData | null>(null)
  const [isStartingTest, setIsStartingTest] = useState(false)
  const [testSessionData] = useState<Record<string, TestResultPayload>>({})
  const { speak } = useSpeech()

  const masteredSet = useFlashcardStore((s) => s.masteredSet)
  const toggleMasteredById = useFlashcardStore((s) => s.toggleMasteredById)

  const userProgress = unitData.studentProgress?.[0]
  const history = (userProgress?.activityHistory as Record<string, unknown> | null) || {}
  const flashcardHistory = Array.isArray(history.flashcard) ? history.flashcard : []
  const quizHistory = Array.isArray(history.quiz) ? history.quiz : []
  const matchHistory = Array.isArray(history.match) ? history.match : []

  const flashcardPlays = Math.max(userProgress?.flashcardPlayCount || 0, flashcardHistory.length)
  const quizPlays = Math.max(userProgress?.quizPlayCount || 0, quizHistory.length)
  const matchPlays = Math.max(userProgress?.matchPlayCount || 0, matchHistory.length)
  const totalStudentPractices = flashcardPlays + quizPlays + matchPlays

  const totalVocab = unitData.vocabItems?.length || 0
  const masteredCount = masteredSet.length
  const masteryPercentage = totalVocab > 0 ? Math.round((masteredCount / totalVocab) * 100) : 0

  // Automatically sync mastery percentage up to database when vocabulary status changes
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null)
  const prevSyncedMasteryRef = useRef<number | null>(null)

  useEffect(() => {
    if (!unitData?.id || totalVocab === 0) return
    if (prevSyncedMasteryRef.current === masteryPercentage) return

    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      prevSyncedMasteryRef.current = masteryPercentage
      syncMasteryProgress({
        unitId: unitData.id,
        classId,
        masteryProgress: masteryPercentage,
      }).catch((e) => console.error('Failed to sync mastery progress:', e))
    }, 1500)

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current)
        syncMasteryProgress({
          unitId: unitData.id,
          classId,
          masteryProgress: masteryPercentage,
        }).catch(() => {})
      }
    }
  }, [masteryPercentage, unitData.id, classId, totalVocab])

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
      const history = normalizeExamHistory(payload, r)
      const durationSeconds = history[history.length - 1]?.durationSeconds || (
        r.startedAt && r.completedAt ? calculateExamDuration(r.startedAt, r.completedAt) : null
      )
      return {
        score: r.score ?? payload.score,
        startedAt: r.startedAt ? new Date(r.startedAt).toISOString() : undefined,
        completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : undefined,
        answers: payload.answers,
        correctAnswersDetail: payload.correctAnswersDetail,
        correctAnswers: payload.correctAnswers,
        totalQuestions: payload.totalQuestions,
        durationSeconds,
        attemptCount: Math.max(payload.attemptCount || 0, history.length),
        bestScore: (payload.bestScore ?? r.score) ?? undefined,
        history,
      }
    }
    const legacy =
      ((unitData.studentProgress?.[0] as Record<string, unknown>)?.testResults as Record<
        string,
        TestResultPayload
      >) || {}
    const leg = legacy[test.id]
    if (leg) {
      const legHistory = normalizeExamHistory(leg, null)
      return {
        ...leg,
        attemptCount: Math.max(leg.attemptCount || 0, legHistory.length),
        history: legHistory,
      }
    }
    return undefined
  }

  const handleStartDirectTest = async (test: ExamData, forceRetake = false) => {
    if (isStartingTest) return
    setIsStartingTest(true)
    try {
      await startTest({
        classId,
        unitId: unitData.id,
        testId: test.id,
        forceRetake,
      })
      if (forceRetake) {
        clearStoredExamSession(classId, test.id)
      }
      router.push(
        `/student/classes/${classId}/exams/${test.id}?unitId=${unitData.id}${forceRetake ? '&retake=1' : ''}`,
      )
    } catch (e) {
      console.error(e)
      alert('Lỗi khởi tạo bài thi. Vui lòng thử lại.')
    } finally {
      setIsStartingTest(false)
    }
  }

  const handleSelectTest = (test: ExamData) => {
    const testResult = getExamResult(test)
    const isCompleted = !!testResult?.completedAt
    if (isCompleted) {
      router.push(`/student/classes/${classId}/exams/${test.id}?unitId=${unitData.id}`)
    } else if (test.isRetakable) {
      handleStartDirectTest(test, false)
    } else {
      setConfirmTest(test)
    }
  }

  const handleRetakeTest = (test: ExamData) => {
    handleStartDirectTest(test, true)
  }

  const handleConfirmStart = async () => {
    if (!confirmTest || isStartingTest) return
    setIsStartingTest(true)
    try {
      await startTest({
        classId,
        unitId: unitData.id,
        testId: confirmTest.id,
      })
      const testId = confirmTest.id
      setConfirmTest(null)
      router.push(`/student/classes/${classId}/exams/${testId}?unitId=${unitData.id}`)
    } catch {
      alert('Lỗi khởi tạo bài thi. Vui lòng thử lại.')
    } finally {
      setIsStartingTest(false)
    }
  }

  return (
    <div className="w-full pb-20 animate-in fade-in duration-500">
      {/* Immersive Game Player Modal (for Flashcards, Quiz, Match) */}
      {activeGame && (
        <GamePlayerModal
          mode={activeGame}
          unitId={unitData.id}
          classId={classId}
          vocabItems={unitData.vocabItems || []}
          onClose={() => setActiveGame(null)}
        />
      )}

      {/* Test Confirmation Modal */}
      <TestConfirmModal
        test={confirmTest}
        isLoading={isStartingTest}
        onCancel={() => setConfirmTest(null)}
        onConfirm={handleConfirmStart}
      />

      {/* Nav */}
      <div className="mb-6 print:hidden">
        <Link
          href={`/student/classes/${classId}`}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors bg-indigo-50 px-4 py-2 rounded-full"
        >
          <ArrowLeft size={18} /> Quay lại lớp học
        </Link>
      </div>

      {/* HERO SECTION */}
      <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-12 print:hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="shrink-0 relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${masteryPercentage * 2.82} 300`}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
                {masteryPercentage}%
              </span>
              <span className="text-xs text-indigo-200 uppercase tracking-wider font-semibold">
                Đã thuộc
              </span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-4">
              <Flame size={14} className="text-orange-400" /> Đang vào đà
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              {unitData.title}
            </h1>
            <p className="text-indigo-200 text-lg mb-8 max-w-2xl mx-auto md:mx-0">
              {unitData.description ||
                'Hãy hoàn thành các trò chơi dưới đây để đạt 100% độ thông thạo nhé!'}
            </p>

            <button
              onClick={() => setActiveGame('flashcard')}
              className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-3 mx-auto md:mx-0"
            >
              <PlayCircle size={24} className="text-indigo-600" />
              Tiếp tục ôn tập
            </button>
          </div>
        </div>

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* KHU VỰC ARCADE (LEARNING GAMES) */}
      <div className="mb-16 print:hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Gamepad2 size={28} className="text-indigo-600 shrink-0" />
            Đấu trường Ôn tập (Arcade)
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Medal size={18} className="text-amber-500 shrink-0" />
            {totalStudentPractices > 0 ? (
              <span className="font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                {totalStudentPractices} lượt đã luyện tập
              </span>
            ) : (
              <span>3 Chế độ thử thách</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {unitData.isFlashcardEnabled && (
            <div
              onClick={() => setActiveGame('flashcard')}
              className="group relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers size={32} />
                  </div>
                  {flashcardPlays > 0 ? (
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                      {flashcardPlays} lượt ôn
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                      Chưa ôn tập
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thẻ ghi nhớ (Flashcards)</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Lật thẻ kinh điển để nạp từ mới vào não bộ cực nhanh với phát âm chuẩn.
                </p>
              </div>
              <div className="flex items-center text-indigo-600 font-bold text-sm group-hover:gap-2 transition-all pt-3 border-t border-gray-100">
                Chơi ngay <ChevronRight size={18} />
              </div>
            </div>
          )}

          {unitData.isQuizEnabled && (
            <div
              onClick={() => setActiveGame('quiz')}
              className="group relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HelpCircle size={32} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {userProgress?.bestQuizScore != null && userProgress.bestQuizScore > 0 && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {userProgress.bestQuizScore}đ
                      </span>
                    )}
                    {quizPlays > 0 ? (
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                        {quizPlays} lượt ôn
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                        Chưa làm trắc nghiệm
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trắc nghiệm Siêu tốc</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Chọn nghĩa đúng dưới áp lực thời gian. Thử thách phản xạ từ vựng của bạn.
                </p>
              </div>
              <div className="flex items-center text-purple-600 font-bold text-sm group-hover:gap-2 transition-all pt-3 border-t border-gray-100">
                Chơi ngay <ChevronRight size={18} />
              </div>
            </div>
          )}

          {unitData.isMatchEnabled && (
            <div
              onClick={() => setActiveGame('match')}
              className="group relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-pink-500/10 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Puzzle size={32} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {userProgress?.bestMatchTime ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        ⚡ {userProgress.bestMatchTime}s
                      </span>
                    ) : null}
                    {matchPlays > 0 ? (
                      <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                        {matchPlays} lượt ôn
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                        Chưa ghép thẻ
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ghép từ Nhanh mắt</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Nối cặp từ và nghĩa tương ứng thật nhanh trước khi đồng hồ điểm 0!
                </p>
              </div>
              <div className="flex items-center text-pink-600 font-bold text-sm group-hover:gap-2 transition-all pt-3 border-t border-gray-100">
                Chơi ngay <ChevronRight size={18} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KHU VỰC BÀI KIỂM TRA (TESTS & CHALLENGES) */}
      <StudentUnitExamsSection
        exams={unitData.exams || []}
        getExamResult={getExamResult}
        isStartingTest={isStartingTest}
        onSelectTest={handleSelectTest}
        onRetakeTest={handleRetakeTest}
      />

      {/* KHU VỰC TỪ VỰNG (THE VAULT) */}
      <VocabVault
        vocabItems={unitData.vocabItems || []}
        masteredSet={masteredSet}
        toggleMasteredById={toggleMasteredById}
        speak={speak}
        unitTitle={unitData.title}
      />
    </div>
  )
}

export default StudentUnitDashboard
