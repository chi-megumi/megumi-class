'use server'

import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import type {
  ClassLeaderboardResult,
  StudentExamHistoryItem,
  StudentExamHistoryResult,
} from './types'

/**
 * Returns class-wide leaderboard aggregating exam performances and vocab progress
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getClassLeaderboard(
  classId: string
): Promise<ClassLeaderboardResult> {
  const me = await getMe()
  if (!me || (me.role !== 'teacher' && me.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  if (!classId || !UUID_REGEX.test(classId)) {
    throw new Error('Mã lớp học không hợp lệ')
  }

  const cls = await prisma.class.findUnique({
    where: { id: classId, teacherId: me.id },
    include: {
      students: {
        where: { status: 'active' },
        include: {
          student: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      exams: {
        where: { isPublished: true },
        include: {
          results: {
            where: { completedAt: { not: null } },
          },
        },
      },
      units: {
        include: {
          exams: {
            where: { isPublished: true },
            include: {
              results: {
                where: { completedAt: { not: null } },
              },
            },
          },
          studentProgress: true,
        },
      },
    },
  })

  if (!cls) {
    throw new Error('Không tìm thấy lớp học')
  }

  const allPublishedExams = [
    ...cls.exams,
    ...cls.units.flatMap((u) => u.exams),
  ]
  const totalPublishedExams = allPublishedExams.length

  const studentStats = cls.students.map((enrollment) => {
    const student = enrollment.student
    const studentResults: Array<{ examId: string; score: number; completedAt: Date }> = []

    allPublishedExams.forEach((exam) => {
      const res = exam.results.find((r) => r.studentId === student.id)
      if (res && res.score !== null) {
        studentResults.push({
          examId: exam.id,
          score: res.score,
          completedAt: res.completedAt || new Date(),
        })
      }
    })

    const completedCount = studentResults.length
    const scores = studentResults.map((r) => r.score)
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

    const unitProgressList = cls.units.map((u) => {
      const prog = u.studentProgress.find((p) => p.userId === student.id)
      return prog?.masteryProgress || 0
    })
    const avgVocabMastery = unitProgressList.length > 0
      ? Math.round(unitProgressList.reduce((a, b) => a + b, 0) / unitProgressList.length)
      : 0

    const xp = (completedCount * 100) + (avgScore * 15) + (avgVocabMastery * 10)

    return {
      student,
      totalPublishedExams,
      completedExams: completedCount,
      completionRate: totalPublishedExams > 0 ? Math.round((completedCount / totalPublishedExams) * 100) : 0,
      avgScore,
      highestScore,
      lowestScore,
      avgVocabMastery,
      xp,
    }
  })

  studentStats.sort((a, b) => {
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore
    if (b.completedExams !== a.completedExams) return b.completedExams - a.completedExams
    return b.xp - a.xp
  })

  const rankedStudents = studentStats.map((item, index) => ({
    ...item,
    rank: index + 1,
  }))

  const totalCompletedResults = studentStats.reduce((acc, s) => acc + s.completedExams, 0)
  const classAvgScore = studentStats.length > 0 && studentStats.some((s) => s.completedExams > 0)
    ? Math.round(
        studentStats.filter((s) => s.completedExams > 0).reduce((acc, s) => acc + s.avgScore, 0) /
        studentStats.filter((s) => s.completedExams > 0).length,
      )
    : 0

  return {
    classId: cls.id,
    className: cls.name,
    totalStudents: cls.students.length,
    totalPublishedExams,
    totalCompletedResults,
    classAvgScore,
    leaderboard: rankedStudents,
  }
}

/**
 * Returns complete exam history and attempt details for a specific student in a class
 */
export async function getStudentExamHistory(
  classId: string,
  studentId: string
): Promise<StudentExamHistoryResult> {
  const me = await getMe()
  if (!me || (me.role !== 'teacher' && me.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  if (!classId || !UUID_REGEX.test(classId) || !studentId || !UUID_REGEX.test(studentId)) {
    throw new Error('Thông tin học sinh hoặc lớp học không hợp lệ')
  }

  const cls = await prisma.class.findUnique({
    where: { id: classId, teacherId: me.id },
    include: {
      exams: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      },
      units: {
        orderBy: { createdAt: 'asc' },
        include: {
          exams: {
            where: { isPublished: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  })

  if (!cls) throw new Error('Không tìm thấy lớp học')

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, email: true, avatarUrl: true },
  })

  if (!student) throw new Error('Không tìm thấy học sinh')

  type ExamItem = (typeof cls.exams)[number]
  type ExamAnswersPayload = {
    score?: number
    correctAnswers?: number
    totalQuestions?: number
    answers?: Record<string, unknown>
    correctAnswersDetail?: Record<string, string | number>
  }

  const examsList: Array<{
    exam: ExamItem
    type: 'class' | 'unit'
    unitTitle?: string
  }> = []

  cls.exams.forEach((e) => examsList.push({ exam: e, type: 'class' }))
  cls.units.forEach((u) => {
    u.exams.forEach((e) => examsList.push({ exam: e, type: 'unit', unitTitle: u.title }))
  })

  const examIds = examsList.map((item) => item.exam.id)

  const results = await prisma.examResult.findMany({
    where: {
      examId: { in: examIds },
      studentId: student.id,
    },
  })

  const resultMap = new Map(results.map((r) => [r.examId, r]))

  const history: StudentExamHistoryItem[] = examsList.map(({ exam, type, unitTitle }) => {
    const res = resultMap.get(exam.id)
    const answersData = (res?.answers as ExamAnswersPayload | null) || {}

    let status: 'completed' | 'in_progress' | 'not_started' = 'not_started'
    if (res?.completedAt) {
      status = 'completed'
    } else if (res?.startedAt) {
      status = 'in_progress'
    }

    return {
      examId: exam.id,
      title: exam.title,
      type,
      unitTitle: unitTitle || null,
      duration: exam.duration,
      status,
      score: res?.score ?? (status === 'completed' ? answersData.score ?? 0 : null),
      correctAnswers: answersData.correctAnswers ?? null,
      totalQuestions: answersData.totalQuestions ?? null,
      startedAt: res?.startedAt || null,
      completedAt: res?.completedAt || null,
      answers: answersData.answers || {},
      correctAnswersDetail: answersData.correctAnswersDetail || {},
      content: exam.content,
    }
  })

  const completed = history.filter((h) => h.status === 'completed')
  const scores = completed.map((c) => c.score ?? 0)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0

  return {
    student,
    summary: {
      totalExams: history.length,
      completedCount: completed.length,
      inProgressCount: history.filter((h) => h.status === 'in_progress').length,
      notStartedCount: history.filter((h) => h.status === 'not_started').length,
      avgScore,
      highestScore,
    },
    history,
  }
}
