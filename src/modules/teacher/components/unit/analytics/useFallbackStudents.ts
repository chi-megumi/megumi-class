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

    return activeStudents.map((enrollment) => {
      const progress = unit.studentProgress?.find(
        (p: UserUnitProgress) => p.userId === enrollment.student.id,
      )
      const history = (progress?.activityHistory as Record<string, unknown> | null) || {}
      const flashcardHistory = Array.isArray(history.flashcard) ? history.flashcard : []
      const quizHistory = Array.isArray(history.quiz) ? history.quiz : []
      const matchHistory = Array.isArray(history.match) ? history.match : []

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
            played: (progress?.flashcardPlayCount || 0) > 0,
            progress: progress?.masteryProgress || 0,
            timesPlayed: progress?.flashcardPlayCount || 0,
            history: flashcardHistory as PracticeSessionEntry[],
          },
          quiz: {
            played: (progress?.quizPlayCount || 0) > 0,
            score: progress?.bestQuizScore || 0,
            timesPlayed: progress?.quizPlayCount || 0,
            history: quizHistory as PracticeSessionEntry[],
          },
          match: {
            played: (progress?.matchPlayCount || 0) > 0,
            bestTime: progress?.bestMatchTime || null,
            timesPlayed: progress?.matchPlayCount || 0,
            history: matchHistory as PracticeSessionEntry[],
          },
        },
        exams: allExams,
      }
    })
  }, [unit, activeStudents, classExams])
}
