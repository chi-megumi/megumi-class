import { useMemo } from 'react'
import type { UserUnitProgress } from '@prisma/client'
import type {
  UnitData,
  EnrollmentData,
  ExamData,
  StudentAnalyticsData,
  PracticeSessionEntry,
  ExamResultData,
} from '@/modules/teacher/types'

export function useFallbackStudents(
  unit: UnitData,
  activeStudents: EnrollmentData[] = [],
  classExams: ExamData[] = [],
): StudentAnalyticsData[] {
  return useMemo(() => {
    const publishedUnitExams = (unit.exams || []).filter((e: ExamData) => e.isPublished)
    const publishedClassExams = (classExams || []).filter((e: ExamData) => e.isPublished)

    const enrolledStudentIds = new Set(activeStudents.map((e) => e.student.id))
    const nonEnrolledProgresses = (unit.studentProgress || []).filter(
      (p: UserUnitProgress) => !enrolledStudentIds.has(p.userId)
    )
    const extraFallbackStudents = nonEnrolledProgresses.map((p: UserUnitProgress) => ({
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
    const allStudents = [...activeStudents, ...extraFallbackStudents]

    return allStudents.map((enrollment) => {
      const progress = unit.studentProgress?.find(
        (p: UserUnitProgress) => p.userId === enrollment.student.id,
      )
      const history = (progress?.activityHistory as Record<string, unknown> | null) || {}
      const flashcardHistory = Array.isArray(history.flashcard) ? history.flashcard : []
      const quizHistory = Array.isArray(history.quiz) ? history.quiz : []
      const matchHistory = Array.isArray(history.match) ? history.match : []

      const flashcardPlays = Math.max(progress?.flashcardPlayCount || 0, flashcardHistory.length)
      const quizPlays = Math.max(progress?.quizPlayCount || 0, quizHistory.length)
      const matchPlays = Math.max(progress?.matchPlayCount || 0, matchHistory.length)

      const allExams = [
        ...publishedUnitExams.map((exam: ExamData) => {
          const res = exam.results?.find(
            (r: ExamResultData) => r.studentId === enrollment.student.id,
          )
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
        ...publishedClassExams.map((exam: ExamData) => {
          const res = exam.results?.find(
            (r: ExamResultData) => r.studentId === enrollment.student.id,
          )
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
            played: flashcardPlays > 0 || flashcardHistory.length > 0,
            progress: progress?.masteryProgress || 0,
            timesPlayed: flashcardPlays,
            history: flashcardHistory as PracticeSessionEntry[],
          },
          quiz: {
            played: quizPlays > 0 || quizHistory.length > 0,
            score: progress?.bestQuizScore || 0,
            timesPlayed: quizPlays,
            history: quizHistory as PracticeSessionEntry[],
          },
          match: {
            played: matchPlays > 0 || matchHistory.length > 0,
            bestTime: progress?.bestMatchTime || null,
            timesPlayed: matchPlays,
            history: matchHistory as PracticeSessionEntry[],
          },
        },
        exams: allExams,
      }
    })
  }, [unit, activeStudents, classExams])
}
