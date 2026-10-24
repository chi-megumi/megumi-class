'use server'

import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import { sanitizeExams } from '../class/exam-utils'
import type { ExamData } from '@/modules/teacher/types'
import type { TestResultPayload } from './types'

export type ExamRunnerData = {
  exam: ExamData
  classTitle: string
  unitTitle?: string
  initialResult?: TestResultPayload
}

export async function getStudentExamRunnerData(
  classId: string,
  examId: string,
  unitId?: string,
): Promise<ExamRunnerData | null> {
  const user = await getMe()
  if (!user) return null

  const isTeacherOrAdmin =
    user.role === 'teacher' || user.role === 'TEACHER' || user.systemRole === 'admin'

  if (!isTeacherOrAdmin) {
    const enrollment = await prisma.classEnrollment.findUnique({
      where: {
        classId_studentId: {
          classId,
          studentId: user.id,
        },
      },
    })
    if (!enrollment || enrollment.status !== 'active') {
      return null
    }
  }

  const exam = await prisma.exam.findFirst({
    where: {
      id: examId,
      OR: [
        { classId },
        { unit: { classId } },
      ],
      ...(isTeacherOrAdmin ? {} : { isPublished: true, isEnabled: true }),
    },
    include: {
      results: {
        where: { studentId: user.id },
      },
      class: {
        select: { name: true },
      },
      unit: {
        select: {
          title: true,
          class: {
            select: { name: true },
          },
          studentProgress: {
            where: { userId: user.id },
          },
        },
      },
    },
  })

  if (!exam) return null

  const isCompleted = !!(exam.results && exam.results[0] && exam.results[0].completedAt)
  const [sanitizedExam] = sanitizeExams([exam], { isReviewMode: isCompleted })

  let initialResult: TestResultPayload | undefined
  if (exam.results && exam.results[0]) {
    const r = exam.results[0]
    const payload = (r.answers as TestResultPayload | null) || {}
    const hasAnswers = payload.answers && Object.keys(payload.answers).length > 0
    const isBogusAutoSubmit =
      !!payload.isInterrupted && !hasAnswers && (r.score === 0 || r.score === null)

    // Heal bogus interrupted auto-submission in DB
    if (isBogusAutoSubmit && r.completedAt) {
      await prisma.examResult.update({
        where: { id: r.id },
        data: {
          completedAt: null,
          score: null,
          startedAt: new Date(),
        },
      })
      r.completedAt = null
      r.score = null
      r.startedAt = new Date()
    }

    initialResult = {
      score: r.score ?? payload.score,
      startedAt: r.startedAt ? new Date(r.startedAt).toISOString() : undefined,
      completedAt: r.completedAt ? new Date(r.completedAt).toISOString() : undefined,
      answers: payload.answers,
      correctAnswersDetail: payload.correctAnswersDetail,
      correctAnswers: payload.correctAnswers,
      totalQuestions: payload.totalQuestions,
    }
  } else if (unitId && exam.unit?.studentProgress?.[0]?.testResults) {
    const legacy =
      (exam.unit.studentProgress[0].testResults as Record<string, TestResultPayload> | null) || {}
    if (legacy[examId]) {
      initialResult = legacy[examId]
    }
  }

  return {
    exam: sanitizedExam as unknown as ExamData,
    classTitle: exam.class?.name || exam.unit?.class?.name || 'Lớp học',
    unitTitle: exam.unit?.title,
    initialResult,
  }
}
