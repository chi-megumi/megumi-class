'use client'

import { UnitData, EnrollmentData, ExamData, StudentAnalyticsData } from '../../types'
import { useState, useEffect, useCallback } from 'react'
import UnitProgressToolbar from './UnitProgressToolbar'
import UnitProgressStudentRow from './UnitProgressStudentRow'
import Portal from '@/components/common/Portal'
import { getUnitAnalytics } from '@/actions/analytics/unit-analytics'

type UnitProgressModalProps = {
  unit: UnitData
  activeStudents: EnrollmentData[]
  classExams?: ExamData[]
  onClose: () => void
}

const UnitProgressModal = ({
  unit,
  activeStudents,
  classExams = [],
  onClose,
}: UnitProgressModalProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [analyticsStudents, setAnalyticsStudents] = useState<StudentAnalyticsData[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch real-time fresh analytics from the server when modal is opened
  useEffect(() => {
    let ignore = false

    const loadAnalytics = async () => {
      try {
        const res = await getUnitAnalytics(unit.id)
        if (!ignore && res?.students) {
          setAnalyticsStudents(res.students)
        }
      } catch (err) {
        console.error('Failed to load fresh unit analytics:', err)
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadAnalytics()

    return () => {
      ignore = true
    }
  }, [unit.id])

  // Manual refresh callback for toolbar
  const handleRefresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getUnitAnalytics(unit.id)
      if (res?.students) {
        setAnalyticsStudents(res.students)
      }
    } catch (err) {
      console.error('Failed to load fresh unit analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [unit.id])

  const publishedUnitExams = (unit.exams || []).filter((e) => e.isPublished)
  const publishedClassExams = (classExams || []).filter((e) => e.isPublished)
  const totalExamsCount = publishedUnitExams.length + publishedClassExams.length

  // Fallback initial mapping from classData while loading or in case of offline
  const enrolledStudentIds = new Set(activeStudents.map((e) => e.student.id))
  const nonEnrolledProgresses = (unit.studentProgress || []).filter(
    (p) => !enrolledStudentIds.has(p.userId)
  )
  const extraFallbackStudents = nonEnrolledProgresses.map((p) => ({
    id: `virtual-${p.userId}`,
    classId: unit.classId || '',
    studentId: p.userId,
    joinedAt: new Date(0),
    status: 'active' as const,
    student: {
      id: p.userId,
      name: 'Tài khoản thử nghiệm',
      email: '',
      avatarUrl: null,
    },
  }))
  const allStudentsForFallback = [...activeStudents, ...extraFallbackStudents]

  const fallbackAnalytics: StudentAnalyticsData[] = allStudentsForFallback.map((enrollment) => {
    // Find the real progress record for this student in this unit
    const progress = unit.studentProgress?.find((p) => p.userId === enrollment.student.id)
    const history = (progress?.activityHistory as Record<string, unknown> | null) || {}
    const flashcardHistory = Array.isArray(history.flashcard) ? history.flashcard : []
    const quizHistory = Array.isArray(history.quiz) ? history.quiz : []
    const matchHistory = Array.isArray(history.match) ? history.match : []

    const flashcardPlays = Math.max(progress?.flashcardPlayCount || 0, flashcardHistory.length)
    const quizPlays = Math.max(progress?.quizPlayCount || 0, quizHistory.length)
    const matchPlays = Math.max(progress?.matchPlayCount || 0, matchHistory.length)

    // Find student exams in this unit
    const unitExamList = publishedUnitExams.map((exam) => {
      const res = exam.results?.find((r) => r.studentId === enrollment.student.id)
      const answersPayload = (res?.answers as Record<string, unknown>) || {}
      return {
        id: exam.id,
        title: exam.title,
        type: 'unit' as const,
        unitTitle: unit.title,
        duration: exam.duration,
        isCompleted: !!res?.completedAt,
        isInProgress: !res?.completedAt && !!res?.startedAt,
        score: res?.score ?? (res?.completedAt ? (answersPayload.score as number) ?? 0 : null),
        correctAnswers: (answersPayload.correctAnswers as number) ?? null,
        totalQuestions: (answersPayload.totalQuestions as number) ?? null,
        completedAt: res?.completedAt || null,
        startedAt: res?.startedAt || null,
        answers: (answersPayload.answers as Record<string, unknown>) || {},
        correctAnswersDetail:
          (answersPayload.correctAnswersDetail as Record<string, string | number>) || {},
        content: exam.content,
        isInterrupted: !!answersPayload.isInterrupted,
      }
    })

    // Include class-level exams
    const classExamList = publishedClassExams.map((exam) => {
      const res = exam.results?.find((r) => r.studentId === enrollment.student.id)
      const answersPayload = (res?.answers as Record<string, unknown>) || {}
      return {
        id: exam.id,
        title: exam.title,
        type: 'class' as const,
        unitTitle: 'Đề Tổng Hợp',
        duration: exam.duration,
        isCompleted: !!res?.completedAt,
        isInProgress: !res?.completedAt && !!res?.startedAt,
        score: res?.score ?? (res?.completedAt ? (answersPayload.score as number) ?? 0 : null),
        correctAnswers: (answersPayload.correctAnswers as number) ?? null,
        totalQuestions: (answersPayload.totalQuestions as number) ?? null,
        completedAt: res?.completedAt || null,
        startedAt: res?.startedAt || null,
        answers: (answersPayload.answers as Record<string, unknown>) || {},
        correctAnswersDetail:
          (answersPayload.correctAnswersDetail as Record<string, string | number>) || {},
        content: exam.content,
        isInterrupted: !!answersPayload.isInterrupted,
      }
    })

    const allExams = [...unitExamList, ...classExamList]

    return {
      student: enrollment.student,
      masteryProgress: progress?.masteryProgress || 0, // % vocab mastered
      games: {
        flashcard: {
          played: flashcardPlays > 0 || flashcardHistory.length > 0,
          progress: progress?.masteryProgress || 0,
          timesPlayed: flashcardPlays,
          history: flashcardHistory as import('../../types').PracticeSessionEntry[],
        },
        quiz: {
          played: quizPlays > 0 || quizHistory.length > 0,
          score: progress?.bestQuizScore || 0,
          timesPlayed: quizPlays,
          history: quizHistory as import('../../types').PracticeSessionEntry[],
        },
        match: {
          played: matchPlays > 0 || matchHistory.length > 0,
          bestTime: progress?.bestMatchTime || null,
          timesPlayed: matchPlays,
          history: matchHistory as import('../../types').PracticeSessionEntry[],
        },
      },
      exams: allExams,
    }
  })

  const displayData = analyticsStudents || fallbackAnalytics

  const filteredData = displayData.filter((d) =>
    d.student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-gray-200/50 relative z-10 animate-in zoom-in-95 duration-300">
          {/* Toolbar & Header */}
          <UnitProgressToolbar
            unitTitle={unit.title}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onClose={onClose}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />

          {/* Table Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-bold w-1/4">Học sinh</th>
                  <th className="py-4 px-6 font-bold w-1/4">Tiến độ thuộc từ</th>
                  <th className="py-4 px-6 font-bold w-1/4">Hoạt động luyện tập</th>
                  <th className="py-4 px-6 font-bold w-1/4">
                    Bài kiểm tra ({totalExamsCount})
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      {displayData.length === 0
                        ? 'Chưa có học sinh nào trong lớp học.'
                        : 'Không tìm thấy học sinh nào phù hợp.'}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((data) => (
                    <UnitProgressStudentRow key={data.student.id} data={data} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export default UnitProgressModal
