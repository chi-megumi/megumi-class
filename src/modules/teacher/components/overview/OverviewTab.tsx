'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Users,
  BookOpen,
  TrendingUp,
  Award,
  CalendarClock,
  ChevronRight,
  BrainCircuit,
  Activity,
  Sparkles,
  Edit2,
  Eye,
  Globe,
  Trash2,
  ToggleLeft,
  ToggleRight,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'
import { UnitData, ClassData, EnrollmentData, ExamData } from '../../types'
import UnitProgressModal from './UnitProgressModal'
import ExamGeneratorModal from '../unit/ExamGeneratorModal'
import TestBuilderModal from '../unit/TestBuilderModal'
import TestResultsModal from '../unit/TestResultsModal'
import ClassLeaderboardModal from './ClassLeaderboardModal'
import StudentExamProgressModal from '../students/StudentExamProgressModal'
import { GeneratedExamResult } from '../../utils/examGenerator'
import { updateClassExams, deleteClassExam } from '~/actions/class'

type OverviewTabProps = {
  classData: ClassData
  activeStudents: EnrollmentData[]
}

const OverviewTab = ({ classData, activeStudents }: OverviewTabProps) => {
  const router = useRouter()
  const [selectedUnitProgress, setSelectedUnitProgress] = useState<UnitData | null>(null)
  const [classExams, setClassExams] = useState<ExamData[]>(classData.exams || [])
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [editingClassTestId, setEditingClassTestId] = useState<string | null>(null)
  const [generatedExam, setGeneratedExam] = useState<GeneratedExamResult | null>(null)
  const [examTab, setExamTab] = useState<'class' | 'units'>('class')
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
  const [viewingResultsTest, setViewingResultsTest] = useState<ExamData | null>(null)
  const [selectedStudentForExams, setSelectedStudentForExams] = useState<{ id: string; name: string } | null>(null)
  
  const totalVocab = classData.units.reduce((acc, unit) => acc + (unit.vocabItems?.length || 0), 0)
  
  // Extract published tests from all units
  const publishedTests = classData.units.flatMap(unit => {
    const tests = Array.isArray(unit.exams) ? unit.exams : []
    return tests
      .filter((t: ExamData) => t.isPublished)
      .map((t: ExamData) => ({ ...t, unitTitle: unit.title, unitId: unit.id }))
  })

  // Extract all published exams (class + units)
  const allPublishedExams = [
    ...classExams.filter((t) => t.isPublished),
    ...publishedTests,
  ]

  // Calculate real student rankings based on completed exams and vocab mastery
  const realStudentRankings = activeStudents.map((enrollment) => {
    const student = enrollment.student
    const completedExams = allPublishedExams.filter((exam) =>
      exam.results?.some((r) => r.studentId === student.id && r.completedAt)
    )
    const scores = completedExams
      .map((exam) => exam.results?.find((r) => r.studentId === student.id)?.score)
      .filter((s): s is number => s !== null && s !== undefined)
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

    const unitProgressList = classData.units.map((u) => {
      const prog = u.studentProgress?.find((p) => p.userId === student.id)
      return prog?.masteryProgress || 0
    })
    const avgVocab = unitProgressList.length > 0
      ? Math.round(unitProgressList.reduce((a, b) => a + b, 0) / unitProgressList.length)
      : 0

    const xp = completedExams.length * 100 + avgScore * 15 + avgVocab * 10

    return {
      id: student.id,
      name: student.name,
      avatarUrl: student.avatarUrl,
      testsTaken: completedExams.length,
      avgScore,
      progress: avgVocab,
      xp,
    }
  }).sort((a, b) => {
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore
    if (b.testsTaken !== a.testsTaken) return b.testsTaken - a.testsTaken
    return b.xp - a.xp
  })

  // Overall class completion rate
  const completionRate = (() => {
    if (activeStudents.length === 0) return 0
    let totalRateSum = 0
    let metricCount = 0

    // Metric 1: Exam completion rate
    if (allPublishedExams.length > 0) {
      const activeStudentIds = new Set(activeStudents.map((s) => s.student.id))
      const totalPossible = activeStudents.length * allPublishedExams.length
      const totalCompleted = allPublishedExams.reduce((acc, exam) => {
        const completedResults = (exam.results || []).filter(
          (r) => activeStudentIds.has(r.studentId) && r.completedAt
        )
        return acc + completedResults.length
      }, 0)
      totalRateSum += Math.round((totalCompleted / totalPossible) * 100)
      metricCount++
    }

    // Metric 2: Unit Vocab mastery
    if (classData.units.length > 0) {
      const activeStudentIds = new Set(activeStudents.map((s) => s.student.id))
      let totalMastery = 0
      const totalUnitSlots = activeStudents.length * classData.units.length
      classData.units.forEach((unit) => {
        (unit.studentProgress || []).forEach((p) => {
          if (activeStudentIds.has(p.userId)) {
            totalMastery += p.masteryProgress || 0
          }
        })
      })
      totalRateSum += Math.round(totalMastery / totalUnitSlots)
      metricCount++
    }

    return metricCount > 0 ? Math.round(totalRateSum / metricCount) : 0
  })()

  const topStudents = realStudentRankings.slice(0, 3)

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4 hover:scale-105 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-blue-600/80 text-sm font-bold uppercase tracking-wider">Học sinh</p>
            <h3 className="text-3xl font-black text-blue-900">{activeStudents.length}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 rounded-3xl border border-purple-100 flex items-center gap-4 hover:scale-105 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-purple-600/80 text-sm font-bold uppercase tracking-wider">Bài học</p>
            <h3 className="text-3xl font-black text-purple-900">{classData.units.length}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-4 hover:scale-105 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
            <BrainCircuit size={28} />
          </div>
          <div>
            <p className="text-emerald-600/80 text-sm font-bold uppercase tracking-wider">Từ vựng</p>
            <h3 className="text-3xl font-black text-emerald-900">{totalVocab}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-3xl border border-orange-100 flex items-center gap-4 hover:scale-105 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-orange-600/80 text-sm font-bold uppercase tracking-wider">Tỉ lệ hoàn thành</p>
            <h3 className="text-3xl font-black text-orange-900">{completionRate}%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Top Students (Leaderboard) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -z-10"></div>
          
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Award className="text-yellow-500" /> Bảng vàng học tập
              </h3>
              {activeStudents.length > 0 && (
                <button
                  onClick={() => setIsLeaderboardOpen(true)}
                  className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Xem tất cả <ChevronRight size={16} />
                </button>
              )}
            </div>

            {topStudents.length === 0 ? (
              <div className="py-12 px-4 text-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
                <Award className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-600">Chưa có dữ liệu bảng vàng</p>
                <p className="text-xs text-gray-400 mt-1">
                  {activeStudents.length === 0
                    ? 'Lớp học hiện chưa có học sinh nào tham gia.'
                    : 'Chưa có học sinh nào hoàn thành bài thi hoặc ghi nhận điểm số.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentForExams({ id: student.id, name: student.name })}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all cursor-pointer group"
                    title="Bấm để xem chi tiết lịch sử bài thi"
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                        index === 0
                          ? 'bg-gradient-to-br from-amber-300 to-yellow-500 text-white'
                          : index === 1
                          ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800'
                          : index === 2
                          ? 'bg-gradient-to-br from-amber-600 to-orange-500 text-white'
                          : 'bg-indigo-50 text-indigo-400'
                      }`}
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0 overflow-hidden">
                      {student.avatarUrl ? (
                        <Image src={student.avatarUrl} alt={student.name} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">{student.name}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span>Hoàn thành <b>{student.testsTaken}</b> bài thi</span>
                        {student.avgScore > 0 && (
                          <span className="text-emerald-600 font-bold">• ĐTB: {student.avgScore}đ</span>
                        )}
                      </p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <div className="font-black text-indigo-600">{student.xp} XP</div>
                      <div className="text-xs font-semibold text-emerald-500">{student.progress}% từ vựng</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Upcoming Tests / Activities */}
        <div className="bg-gradient-to-b from-indigo-900 to-blue-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col max-h-[580px]">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-4 shrink-0 relative z-10">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CalendarClock className="text-indigo-300" /> Bài kiểm tra lớp học
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">Quản lý các bài thi định kỳ & theo bài</p>
            </div>
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 font-black rounded-xl shadow-md transition-all flex items-center gap-1.5 text-xs hover:-translate-y-0.5 shrink-0"
            >
              <Sparkles size={15} /> Tạo Đề Lớn
            </button>
          </div>

          {/* Sub tabs: Class Big Exams vs Unit Tests */}
          <div className="flex gap-2 p-1 bg-white/10 rounded-xl mb-4 shrink-0 relative z-10 text-xs font-bold">
            <button
              onClick={() => setExamTab('class')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${examTab === 'class' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:text-white'}`}
            >
              Đề Tổng Hợp ({classExams.length})
            </button>
            <button
              onClick={() => setExamTab('units')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${examTab === 'units' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:text-white'}`}
            >
              Đề Theo Unit ({publishedTests.length})
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 relative z-10">
            {examTab === 'class' ? (
              classExams.length > 0 ? (
                classExams.map((test) => (
                  <div key={test.id} className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="inline-block px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-black rounded uppercase tracking-wider border border-amber-400/30">
                            Đề Tổng Hợp
                          </span>
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-black rounded uppercase tracking-wider border ${
                            test.isRetakable
                              ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                              : 'bg-purple-400/20 text-purple-300 border-purple-400/30'
                          }`}>
                            {test.isRetakable ? '🔄 Luyện tập' : '🔒 Làm 1 lần'}
                          </span>
                        </div>
                        <h4 className="font-bold text-base leading-snug">{test.title}</h4>
                      </div>
                      <span className="text-xs text-indigo-200 font-semibold shrink-0">{test.duration} phút</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const newExams = classExams.map(t => t.id === test.id ? { ...t, isEnabled: !t.isEnabled } : t)
                            setClassExams(newExams)
                            const res = await updateClassExams(classData.id, newExams)
                            if (res.success && res.exams) setClassExams(res.exams as unknown as ExamData[])
                          }}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                            test.isEnabled ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-white/10 text-white/50'
                          }`}
                        >
                          {test.isEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {test.isEnabled ? 'Hiện' : 'Ẩn'}
                        </button>

                        {!test.isPublished ? (
                          <button
                            onClick={async () => {
                              if (window.confirm('Sau khi Public bài kiểm tra này, bạn sẽ không thể chỉnh sửa nữa. Bạn có chắc chắn?')) {
                                const newExams = classExams.map(t => t.id === test.id ? { ...t, isPublished: true } : t)
                                setClassExams(newExams)
                                const res = await updateClassExams(classData.id, newExams)
                                if (res.success && res.exams) setClassExams(res.exams as unknown as ExamData[])
                              }
                            }}
                            className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded text-[11px] border border-emerald-500/30 transition-colors"
                          >
                            Public
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-0.5">
                            <Globe size={12} /> Đã Public
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingResultsTest(test)}
                          className="p-1.5 px-2 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold"
                          title="Xem kết quả & Bảng xếp hạng"
                        >
                          <BarChart3 size={13} /> BXH
                        </button>
                        <button
                          onClick={() => router.push(`/teacher/classes/${classData.id}/test-builder?testId=${test.id}`)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            test.isPublished ? 'text-amber-300 hover:text-white hover:bg-white/10' : 'text-indigo-200 hover:text-white hover:bg-white/10'
                          }`}
                          title={test.isPublished ? 'Xem đề (Chỉ đọc)' : 'Sửa đề'}
                        >
                          {test.isPublished ? <Eye size={14} /> : <Edit2 size={14} />}
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa bài kiểm tra tổng hợp này?')) {
                              const res = await deleteClassExam(test.id, classData.id)
                              if (res.success && res.exams) setClassExams(res.exams as unknown as ExamData[])
                            }
                          }}
                          className="p-1.5 text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 rounded-lg transition-colors"
                          title="Xóa đề"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-indigo-200 bg-white/5 rounded-2xl border border-white/10 p-6">
                  <div className="text-3xl mb-2">✨</div>
                  <p className="text-sm font-bold text-white mb-1">Chưa có bài kiểm tra tổng hợp nào</p>
                  <p className="text-xs text-indigo-200 mb-4">Gom từ vựng của các Unit để tự động tạo đề thi định kỳ.</p>
                  <button
                    onClick={() => setIsGeneratorOpen(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-black rounded-xl text-xs hover:opacity-95 shadow-md"
                  >
                    Tạo Đề Lớn Ngay
                  </button>
                </div>
              )
            ) : (
              publishedTests.length > 0 ? (
                publishedTests.map(test => (
                  <div key={test.id} className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-green-500/20 text-green-200 text-[10px] font-bold rounded border border-green-500/30 mb-1">
                          {test.unitTitle}
                        </span>
                        <h4 className="font-bold text-base leading-snug">{test.title}</h4>
                      </div>
                      <span className="text-xs text-indigo-200 font-semibold shrink-0">{test.duration} phút</span>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-white/10">
                      <button
                        onClick={() => setViewingResultsTest(test)}
                        className="px-3 py-1 bg-white/15 hover:bg-white/25 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <BarChart3 size={13} /> Xem kết quả & BXH
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-indigo-200 bg-white/5 rounded-2xl border border-white/10 p-6">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-xs text-indigo-200">Chưa có bài kiểm tra Unit nào được Public.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* 4. Per Unit Progress */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <Activity className="text-blue-500" /> Tiến độ theo bài học
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-sm">
                <th className="pb-3 font-semibold">Tên bài học</th>
                <th className="pb-3 font-semibold">Số từ vựng</th>
                <th className="pb-3 font-semibold">Tỉ lệ tham gia</th>
                <th className="pb-3 font-semibold">Điểm trung bình</th>
                <th className="pb-3 font-semibold">Bài kiểm tra</th>
              </tr>
            </thead>
            <tbody>
              {classData.units.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Chưa có bài học nào.</td>
                </tr>
              ) : (
                classData.units.map((unit) => {
                  const activeStudentIds = new Set(classData.students.map((s) => s.student.id))
                  if (classData.teacherId) activeStudentIds.add(classData.teacherId)
                  const unitStudentProgress = (unit.studentProgress || []).filter((p) => activeStudentIds.has(p.userId))
                  const progressCount = unitStudentProgress.length
                  const totalStudentsBase = Math.max(1, classData.students.length + (unit.studentProgress?.some((p) => p.userId === classData.teacherId) ? 1 : 0))
                  const participationRate = Math.min(100, Math.round((progressCount / totalStudentsBase) * 100))

                  const quizScores = unitStudentProgress
                    .filter((p) => p.bestQuizScore !== null && p.bestQuizScore !== undefined)
                    .map((p) => p.bestQuizScore as number)
                  
                  const avgScore = quizScores.length > 0
                    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
                    : 0
                  
                  return (
                    <tr 
                      key={unit.id} 
                      className="border-b border-gray-50 last:border-0 hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedUnitProgress(unit)}
                    >
                      <td className="py-4 font-bold text-gray-800 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                        {unit.title}
                      </td>
                      <td className="py-4 text-gray-600">{unit.vocabItems?.length || 0} từ</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${participationRate}%` }}></div>
                          </div>
                          <span className="text-sm font-bold text-gray-600">{participationRate}%</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-2 py-1 rounded font-bold text-xs ${
                          avgScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                          avgScore >= 60 ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {avgScore}/100
                        </span>
                      </td>
                      <td className="py-4">
                        {(() => {
                           const published = (Array.isArray(unit.exams) ? unit.exams : []).filter((t: ExamData) => t.isPublished)
                           if (published.length === 0) return <span className="text-gray-400 text-xs italic">Chưa có</span>
                           return (
                             <span className="px-2 py-1 bg-indigo-50 text-indigo-600 font-bold rounded-lg border border-indigo-100 text-xs">
                               {published.length} bài thi
                             </span>
                           )
                        })()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUnitProgress && (
        <UnitProgressModal
          unit={selectedUnitProgress}
          activeStudents={activeStudents}
          classExams={classExams}
          onClose={() => setSelectedUnitProgress(null)}
        />
      )}

      {/* Modal Generator for Class Big Exam */}
      {isGeneratorOpen && (
        <ExamGeneratorModal
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
          availableUnits={classData.units}
          onGenerated={(result) => {
            setGeneratedExam(result)
            setEditingClassTestId('new')
          }}
        />
      )}

      {/* Modal Test Builder for Class Big Exam */}
      {editingClassTestId && (
        <TestBuilderModal
          classId={classData.id}
          isClassExam={true}
          editingTestId={editingClassTestId}
          existingTests={classExams}
          initialExam={generatedExam ?? undefined}
          onClose={() => {
            setEditingClassTestId(null)
            setGeneratedExam(null)
          }}
          onSaveSuccess={(newExams) => {
            setClassExams(newExams)
            setEditingClassTestId(null)
            setGeneratedExam(null)
          }}
        />
      )}

      {/* Modal Leaderboard for Whole Class */}
      {isLeaderboardOpen && (
        <ClassLeaderboardModal
          classId={classData.id}
          className={classData.name}
          onClose={() => setIsLeaderboardOpen(false)}
          onSelectStudent={(studentId, studentName) => {
            setIsLeaderboardOpen(false)
            setSelectedStudentForExams({ id: studentId, name: studentName })
          }}
        />
      )}

      {/* Modal View Results & Question Analytics for Exam */}
      {viewingResultsTest && (
        <TestResultsModal
          unitId={viewingResultsTest.unitId || undefined}
          testId={viewingResultsTest.id}
          testTitle={viewingResultsTest.title}
          testData={viewingResultsTest}
          onClose={() => setViewingResultsTest(null)}
        />
      )}

      {/* Modal Student Exam Progress */}
      {selectedStudentForExams && (
        <StudentExamProgressModal
          classId={classData.id}
          studentId={selectedStudentForExams.id}
          studentName={selectedStudentForExams.name}
          onClose={() => setSelectedStudentForExams(null)}
        />
      )}
    </div>
  )
}

export default OverviewTab
