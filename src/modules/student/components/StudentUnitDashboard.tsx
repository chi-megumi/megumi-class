'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  PlayCircle,
  Medal,
  Flame,
  Gamepad2,
  ChevronRight,
  RotateCcw,
  Layers,
  HelpCircle,
  Puzzle,
  ClipboardCheck,
  Clock,
  FileText,
  Zap,
} from 'lucide-react'
import { ExamData, UnitData } from '~/modules/teacher/types'
import { useSpeech } from '@/components/flashcards/hooks/useSpeech'
import { useFlashcardStore } from '@/components/flashcards/stores/useFlashcardStore'
import GamePlayerModal from './unit/GamePlayerModal'
import { startTest } from '@/actions/analytics/exam-session'
import type { TestResultPayload } from '@/actions/analytics/types'
import VocabVault from './vocabulary/VocabVault'
import Portal from '@/components/common/Portal'

const StudentUnitDashboard = ({
  unitData,
  classId,
}: {
  unitData: UnitData
  classId: string
}) => {
  const [activeGame, setActiveGame] = useState<'flashcard' | 'quiz' | 'match' | 'test' | null>(null)
  const [activeTest, setActiveTest] = useState<ExamData | undefined>(undefined)
  const [confirmTest, setConfirmTest] = useState<ExamData | null>(null)
  const [isStartingTest, setIsStartingTest] = useState(false)
  const [isRetakeActive, setIsRetakeActive] = useState(false)
  const [retakeSessionKey, setRetakeSessionKey] = useState(0)

  const handleStartDirectTest = async (test: ExamData, forceRetake = false) => {
    if (isStartingTest) return
    setIsStartingTest(true)
    try {
      const res = await startTest({
        classId,
        unitId: unitData.id,
        testId: test.id,
        forceRetake,
      })
      if (res.success && res.startedAt) {
        if (forceRetake) {
          setTestSessionData((prev) => ({
            ...prev,
            [test.id]: {
              startedAt: res.startedAt,
              completedAt: undefined,
              score: undefined,
              answers: {},
              correctAnswersDetail: undefined,
              correctAnswers: undefined,
              totalQuestions: undefined,
            },
          }))
          setIsRetakeActive(true)
          setRetakeSessionKey((prev) => prev + 1)
        } else {
          setTestSessionData((prev) => ({
            ...prev,
            [test.id]: {
              ...(getExamResult(test) || {}),
              startedAt: res.startedAt,
              completedAt: getExamResult(test)?.completedAt,
            },
          }))
          setIsRetakeActive(false)
        }
      }
      setActiveTest(test)
      setActiveGame('test')
    } catch (e) {
      console.error(e)
      alert('Lỗi khởi tạo bài thi. Vui lòng thử lại.')
    } finally {
      setIsStartingTest(false)
    }
  }
  const [testSessionData, setTestSessionData] = useState<Record<string, TestResultPayload>>({})
  const { speak } = useSpeech()

  const masteredSet = useFlashcardStore((s) => s.masteredSet)
  const toggleMasteredById = useFlashcardStore((s) => s.toggleMasteredById)

  // Calculate real mastery based on mastered flashcards for now
  const totalVocab = unitData.vocabItems?.length || 0
  const masteredCount = masteredSet.length
  const masteryPercentage = totalVocab > 0 ? Math.round((masteredCount / totalVocab) * 100) : 0

  const getExamResult = (test: ExamData): TestResultPayload | undefined => {
    if (!test) return undefined
    if (testSessionData[test.id]) return testSessionData[test.id]
    if (test.results && test.results[0]) {
      const r = test.results[0]
      const payload = (r.answers as TestResultPayload | null) || {}
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
    const legacy = ((unitData.studentProgress?.[0] as Record<string, unknown>)?.testResults as Record<string, TestResultPayload>) || {}
    return legacy[test.id]
  }

  return (
    <div className="w-full pb-20 animate-in fade-in duration-500">
      {/* Immersive Game Player Modal */}
      {activeGame && (
        <GamePlayerModal
          key={`${activeTest?.id || 'game'}-${retakeSessionKey}-${isRetakeActive ? 'retake' : 'review'}`}
          mode={activeGame}
          unitId={unitData.id}
          classId={classId}
          vocabItems={unitData.vocabItems || []}
          testData={activeTest}
          initialResult={isRetakeActive ? undefined : (activeTest ? getExamResult(activeTest) : undefined)}
          isRetake={isRetakeActive}
          onClose={() => {
            setActiveGame(null)
            setActiveTest(undefined)
            setIsRetakeActive(false)
          }}
          onTestComplete={(testId, result) => {
            setIsRetakeActive(false)
            setTestSessionData(prev => ({
              ...prev,
              [testId]: {
                ...prev[testId],
                score: result.score,
                completedAt: result.completedAt || new Date().toISOString(),
                correctAnswersDetail: result.correctAnswersDetail,
                answers: result.answers,
                correctAnswers: result.correctAnswers,
                totalQuestions: result.totalQuestions,
              }
            }))
          }}
        />
      )}

      {/* Test Confirmation Modal (Only for non-retakable 1-time tests) */}
      {confirmTest && !confirmTest.isRetakable && (
        <Portal>
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sẵn sàng làm bài?</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Bạn sắp bắt đầu làm bài <strong>{confirmTest.title}</strong>.<br/>
                Thời gian giới hạn: <strong>{confirmTest.duration} phút</strong>.<br/><br/>
                <span className="text-red-600 font-medium">⚠️ Lưu ý quan trọng: Một khi đã bắt đầu, đồng hồ sẽ đếm ngược. Nếu bạn thoát ra hoặc đóng trang giữa chừng, bài sẽ tự động được nộp với số điểm hiện tại và bạn không thể làm lại.</span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmTest(null)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Chưa sẵn sàng
                </button>
                <button
                  onClick={async () => {
                    if (isStartingTest) return;
                    setIsStartingTest(true);
                    try {
                      const res = await startTest({ classId, unitId: unitData.id, testId: confirmTest.id });
                      if (res.success && res.startedAt) {
                        setTestSessionData(prev => ({
                          ...prev,
                          [confirmTest.id]: {
                            ...(getExamResult(confirmTest) || {}),
                            startedAt: res.startedAt
                          }
                        }));
                      }
                      setActiveTest(confirmTest)
                      setActiveGame('test')
                      setConfirmTest(null)
                    } catch {
                      alert('Lỗi khởi tạo bài thi. Vui lòng thử lại.')
                    } finally {
                      setIsStartingTest(false);
                    }
                  }}
                  disabled={isStartingTest}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {isStartingTest ? 'Đang chuẩn bị...' : 'Bắt đầu ngay'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Nav */}
      <div className="mb-6 print:hidden">
        <Link
          href={`/student/classes/${classId}`}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors bg-indigo-50 px-4 py-2 rounded-full"
        >
          <ArrowLeft size={18} /> Quay lại lớp học
        </Link>
      </div>

      {/* HERO SECTION - THE WOW FACTOR */}
      <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden mb-12 print:hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Circular Progress (Fake for now) */}
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

        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* KHU VỰC ARCADE (LEARNING GAMES) */}
      <div className="mb-16 print:hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Gamepad2 className="text-indigo-600" size={28} />
            Khu vui chơi (Arcade)
          </h2>
          <div className="text-sm font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
            {unitData.vocabItems?.length || 0} từ vựng
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Flashcard Card */}
          {unitData.isFlashcardEnabled && (
            <div
              className={`group relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 cursor-pointer`}
              onClick={() => setActiveGame('flashcard')}
            >
              <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-6 group-hover:rotate-12 transition-transform">
                NÊN THỬ
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <Layers size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Lật thẻ 3D</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                Học nghĩa và phát âm chuẩn với thẻ Flashcard 3 chiều tương tác.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-blue-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-2 transition-transform">
                  Chơi ngay <ChevronRight size={16} />
                </span>
              </div>
            </div>
          )}

          {/* Quiz Card */}
          {unitData.isQuizEnabled && (
            <div
              className={`group relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 cursor-pointer`}
              onClick={() => setActiveGame('quiz')}
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <HelpCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Đố Vui (Quiz)</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                Kiểm tra trí nhớ với bộ câu hỏi trắc nghiệm 4 lựa chọn có chấm điểm.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-purple-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-2 transition-transform">
                  Chơi ngay <ChevronRight size={16} />
                </span>
              </div>
              <div className="absolute bottom-6 right-6 text-xs text-gray-400 flex items-center gap-1">
                <Medal size={14} className="text-yellow-500" /> +50 XP
              </div>
            </div>
          )}

          {/* Match Game Card */}
          {unitData.isMatchEnabled && (
            <div
              className={`group relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 cursor-pointer`}
              onClick={() => setActiveGame('match')}
            >
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-3 group-hover:-rotate-12 transition-transform flex items-center gap-1">
                <span>HOT</span>
                <Flame size={12} className="text-amber-200 fill-amber-200" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <Puzzle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Ghép Thẻ Tốc Độ</h3>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                Tìm các cặp từ và nghĩa tương ứng nhanh nhất có thể. Đua TOP cùng lớp!
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-orange-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-2 transition-transform">
                  Chơi ngay <ChevronRight size={16} />
                </span>
              </div>
              <div className="absolute top-6 right-6 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                Kỷ lục: --s
              </div>
            </div>
          )}

        </div>
      </div>

      {/* KHU VỰC BÀI KIỂM TRA (TESTS & CHALLENGES) */}
      {Array.isArray(unitData.exams) && unitData.exams.filter((t: ExamData) => t.isEnabled && t.isPublished).length > 0 && (
        <div className="mb-16 print:hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <ClipboardCheck size={28} className="text-indigo-600 shrink-0" />
              Bài kiểm tra (Tests)
            </h2>
            <div className="text-sm font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              {unitData.exams.filter((t: ExamData) => t.isEnabled && t.isPublished).length} bài thi
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unitData.exams.filter((t: ExamData) => t.isEnabled && t.isPublished).map((test: ExamData) => {
              const testResult = getExamResult(test)
              const isCompleted = !!testResult?.completedAt
              const isInProgress = !!testResult?.startedAt && !isCompleted

              return (
                <div
                  key={test.id}
                  className={`group relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm transition-all duration-300 ${
                    isCompleted
                      ? 'opacity-80'
                      : 'hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-2 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (test.isRetakable) {
                      if (isCompleted) {
                        setIsRetakeActive(false)
                        setActiveTest(test)
                        setActiveGame('test')
                      } else {
                        handleStartDirectTest(test, false)
                      }
                    } else {
                      if (isCompleted) {
                        setActiveTest(test)
                        setActiveGame('test')
                      } else {
                        setConfirmTest(test)
                      }
                    }
                  }}
                >
                  {test.isRetakable ? (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-2 flex items-center gap-1">
                      <RotateCcw size={12} /> LUYỆN TẬP
                    </div>
                  ) : test.duration <= 15 ? (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-3 group-hover:-rotate-12 transition-transform flex items-center gap-1">
                      <span>MINI THỬ THÁCH</span>
                      <Zap size={12} className="text-amber-200 fill-amber-200" />
                    </div>
                  ) : (
                    <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-6">
                      QUAN TRỌNG
                    </div>
                  )}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform ${
                    test.isRetakable
                      ? 'bg-emerald-50 text-emerald-600'
                      : test.duration <= 15
                        ? 'bg-orange-50 text-orange-600'
                        : 'bg-red-50 text-red-600'
                  }`}>
                    {test.isRetakable ? (
                      <RotateCcw size={28} />
                    ) : test.duration <= 15 ? (
                      <Clock size={28} />
                    ) : (
                      <FileText size={28} />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{test.title || 'Bài Kiểm Tra'}</h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                    Thời gian: {test.duration} phút. {isCompleted ? 'Đã hoàn thành.' : test.isRetakable ? 'Có thể làm lại nhiều lần để ôn tập.' : 'Hãy tập trung làm bài thật tốt nhé!'}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    {isCompleted ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                          Điểm: {Math.round(testResult.score || 0)}/100
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
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 shadow-2xs"
                              title="Làm lại bài ngay (đề sẽ được xáo trộn)"
                            >
                              <RotateCcw size={12} />
                              <span>Làm lại</span>
                            </button>
                          )}
                          <span className="text-indigo-600 font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Xem đáp án <ChevronRight size={16} />
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className={`font-bold text-sm flex items-center gap-1 group-hover:translate-x-2 transition-transform ${
                        test.isRetakable
                          ? 'text-emerald-600'
                          : test.duration <= 15
                            ? 'text-orange-600'
                            : 'text-red-600'
                      }`}>
                        {isInProgress ? 'Tiếp tục làm bài' : 'Bắt đầu làm bài'} <ChevronRight size={16} />
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
