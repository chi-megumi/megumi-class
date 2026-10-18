'use client'

import { UnitData, EnrollmentData, ExamData, StudentAnalyticsData } from '../../types'
import { useState } from 'react'
import UnitProgressToolbar from './UnitProgressToolbar'
import UnitProgressStudentRow from './UnitProgressStudentRow'
import Portal from '@/components/common/Portal'

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

  const publishedUnitExams = (unit.exams || []).filter((e) => e.isPublished)
  const publishedClassExams = (classExams || []).filter((e) => e.isPublished)
  const totalExamsCount = publishedUnitExams.length + publishedClassExams.length

  // Map real analytics data from the database
  const studentAnalytics: StudentAnalyticsData[] = activeStudents.map((enrollment) => {
    // Find the real progress record for this student in this unit
    const progress = unit.studentProgress?.find((p) => p.userId === enrollment.student.id)
    const history = (progress?.activityHistory as Record<string, unknown> | null) || {}
    const flashcardHistory = Array.isArray(history.flashcard) ? history.flashcard : []
    const quizHistory = Array.isArray(history.quiz) ? history.quiz : []
    const matchHistory = Array.isArray(history.match) ? history.match : []

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
          played: (progress?.flashcardPlayCount || 0) > 0 || flashcardHistory.length > 0,
          progress: progress?.masteryProgress || 0,
          timesPlayed: progress?.flashcardPlayCount || 0,
          history: flashcardHistory as import('../../types').PracticeSessionEntry[],
        },
        quiz: {
          played: (progress?.quizPlayCount || 0) > 0 || quizHistory.length > 0,
          score: progress?.bestQuizScore || 0,
          timesPlayed: progress?.quizPlayCount || 0,
          history: quizHistory as import('../../types').PracticeSessionEntry[],
        },
        match: {
          played: (progress?.matchPlayCount || 0) > 0 || matchHistory.length > 0,
          bestTime: progress?.bestMatchTime || null,
          timesPlayed: progress?.matchPlayCount || 0,
          history: matchHistory as import('../../types').PracticeSessionEntry[],
        },
      },
      exams: allExams,
    }
  })

  const displayData = studentAnalytics

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
                      {studentAnalytics.length === 0
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
