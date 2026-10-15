'use server'

import { revalidatePath } from 'next/cache'
import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import { TestBlock } from '@/modules/teacher/types'
import { gradeExamBlocks } from './grading'
import type { StartTestInput, SubmitTestResultInput } from './types'

type AttemptHistoryEntry = {
  attempt: number
  score: number
  correctAnswers: number
  totalQuestions: number
  startedAt: string
  completedAt: string
}

type StoredAnswersPayload = {
  score?: number | null
  attemptCount?: number
  bestScore?: number
  history?: AttemptHistoryEntry[]
  startedAt?: string
  completedAt?: string | null
  answers?: Record<string, string | number>
  correctAnswersDetail?: Record<string, string | number>
  totalQuestions?: number
  correctAnswers?: number
}

/**
 * Initializes or resumes a test session for a student.
 * Handles retakes when the exam is configured as retakable.
 */
export async function startTest({
  classId,
  unitId,
  testId,
  forceRetake,
}: StartTestInput) {
  const user = await getMe()
  if (!user) throw new Error('Unauthorized')

  const test = await prisma.exam.findUnique({
    where: { id: testId },
  })
  const isRetakable = test?.isRetakable ?? false

  // Check if test attempt exists in ExamResult
  const existingExamResult = await prisma.examResult.findUnique({
    where: {
      examId_studentId: {
        examId: testId,
        studentId: user.id,
      },
    },
  })

  // If student requests to retake a retakable exam, reset active session
  if (isRetakable && forceRetake) {
    const startedAt = new Date()
    await prisma.examResult.upsert({
      where: {
        examId_studentId: {
          examId: testId,
          studentId: user.id,
        },
      },
      create: {
        examId: testId,
        studentId: user.id,
        startedAt,
      },
      update: {
        startedAt,
        completedAt: null,
      },
    })

    if (unitId) {
      const progress = await prisma.userUnitProgress.findUnique({
        where: { userId_unitId: { userId: user.id, unitId } },
      })
      let currentResults: Record<string, unknown> = {}
      if (progress?.testResults && typeof progress.testResults === 'object') {
        currentResults = { ...(progress.testResults as Record<string, unknown>) }
      }
      const existingEntry = (currentResults[testId] as Record<string, unknown>) || {}
      currentResults[testId] = {
        ...existingEntry,
        startedAt: startedAt.toISOString(),
        completedAt: null,
      }
      await prisma.userUnitProgress.upsert({
        where: { userId_unitId: { userId: user.id, unitId } },
        update: { testResults: currentResults as import('@prisma/client').Prisma.InputJsonValue },
        create: {
          userId: user.id,
          unitId,
          testResults: currentResults as import('@prisma/client').Prisma.InputJsonValue,
        },
      })
      revalidatePath(`/student/classes/${classId}/units/${unitId}`)
    }

    return {
      success: true,
      startedAt: startedAt.toISOString(),
      isCompleted: false,
    }
  }

  if (existingExamResult?.completedAt) {
    return {
      success: true,
      startedAt: existingExamResult.startedAt.toISOString(),
      isCompleted: true,
    }
  }

  if (existingExamResult?.startedAt) {
    return {
      success: true,
      startedAt: existingExamResult.startedAt.toISOString(),
      isCompleted: false,
    }
  }

  // Fallback / auto-migration from legacy userUnitProgress if available
  if (unitId) {
    const progress = await prisma.userUnitProgress.findUnique({
      where: { userId_unitId: { userId: user.id, unitId } },
    })
    const testResultsMap = (progress?.testResults as Record<string, StoredAnswersPayload> | null) || {}
    const oldResult = testResultsMap[testId]
    if (oldResult?.completedAt) {
      await prisma.examResult.upsert({
        where: { examId_studentId: { examId: testId, studentId: user.id } },
        create: {
          examId: testId,
          studentId: user.id,
          score: oldResult.score ?? null,
          startedAt: oldResult.startedAt ? new Date(oldResult.startedAt) : new Date(),
          completedAt: new Date(oldResult.completedAt),
          answers: oldResult as unknown as import('@prisma/client').Prisma.InputJsonValue,
        },
        update: {},
      })
      return {
        success: true,
        startedAt: oldResult.startedAt || new Date().toISOString(),
        isCompleted: true,
      }
    }
    if (oldResult?.startedAt) {
      await prisma.examResult.upsert({
        where: { examId_studentId: { examId: testId, studentId: user.id } },
        create: {
          examId: testId,
          studentId: user.id,
          startedAt: new Date(oldResult.startedAt),
        },
        update: {},
      })
      return {
        success: true,
        startedAt: oldResult.startedAt,
        isCompleted: false,
      }
    }
  }

  const startedAt = new Date()

  // Create attempt in ExamResult table
  await prisma.examResult.upsert({
    where: {
      examId_studentId: {
        examId: testId,
        studentId: user.id,
      },
    },
    create: {
      examId: testId,
      studentId: user.id,
      startedAt,
    },
    update: {},
  })

  // Mirror to userUnitProgress for legacy compatibility
  if (unitId) {
    const progress = await prisma.userUnitProgress.findUnique({
      where: { userId_unitId: { userId: user.id, unitId } },
    })
    let currentResults: Record<string, unknown> = {}
    if (progress?.testResults && typeof progress.testResults === 'object') {
      currentResults = progress.testResults as Record<string, unknown>
    }
    const existingEntry = (currentResults[testId] as Record<string, unknown>) || {}
    currentResults[testId] = { ...existingEntry, startedAt: startedAt.toISOString() }
    await prisma.userUnitProgress.upsert({
      where: { userId_unitId: { userId: user.id, unitId } },
      update: { testResults: currentResults as import('@prisma/client').Prisma.InputJsonValue },
      create: {
        userId: user.id,
        unitId,
        testResults: currentResults as import('@prisma/client').Prisma.InputJsonValue,
      },
    })
    revalidatePath(`/student/classes/${classId}/units/${unitId}`)
  }

  revalidatePath(`/student/classes/${classId}`)

  return { success: true, startedAt: startedAt.toISOString(), isCompleted: false }
}

/**
 * Submits test results for a specific test
 */
export async function submitTestResult({
  unitId,
  classId,
  testId,
  answers,
}: SubmitTestResultInput) {
  const me = await getMe()
  if (!me) {
    throw new Error('Unauthorized')
  }

  // Fetch test securely on the server from the Exam model
  const test = await prisma.exam.findUnique({
    where: { id: testId },
    include: {
      class: true,
      unit: true,
    },
  })

  if (!test) {
    throw new Error('Test not found')
  }

  // Verify that the test belongs to this class
  const examClassId = test.classId || test.unit?.classId
  if (examClassId !== classId) {
    throw new Error('Bài thi không thuộc lớp học này')
  }

  // Check if student has already completed this exam in ExamResult
  const existingExamResult = await prisma.examResult.findUnique({
    where: {
      examId_studentId: {
        examId: testId,
        studentId: me.id,
      },
    },
  })

  if (existingExamResult?.completedAt && !test.isRetakable) {
    throw new Error('Bạn đã nộp bài kiểm tra này rồi, không thể nộp lại!')
  }

  // Also check legacy userUnitProgress if unitId is provided
  if (unitId && !test.isRetakable) {
    const existingProgress = await prisma.userUnitProgress.findUnique({
      where: {
        userId_unitId: {
          userId: me.id,
          unitId,
        },
      },
    })
    const legacyMap = (existingProgress?.testResults as Record<string, StoredAnswersPayload> | null) || {}
    if (legacyMap[testId]?.completedAt) {
      throw new Error('Bạn đã nộp bài kiểm tra này rồi, không thể nộp lại!')
    }
  }

  const blocks = (test.content as unknown as TestBlock[]) || []
  const { totalQuestions, correctAnswers, correctAnswersDetail, score } = gradeExamBlocks(blocks, answers)
  const completedAt = new Date()

  // Build attempt history for retakable exams
  const prevPayload = (existingExamResult?.answers as StoredAnswersPayload | null) || {}
  const prevHistory = Array.isArray(prevPayload.history) ? prevPayload.history : []
  const prevAttemptCount = typeof prevPayload.attemptCount === 'number'
    ? prevPayload.attemptCount
    : (existingExamResult?.completedAt ? 1 : 0)
  const attemptCount = prevAttemptCount + 1

  const newHistoryEntry: AttemptHistoryEntry = {
    attempt: attemptCount,
    score,
    correctAnswers,
    totalQuestions,
    startedAt: existingExamResult?.startedAt?.toISOString() || completedAt.toISOString(),
    completedAt: completedAt.toISOString(),
  }

  const bestScore = Math.max(score, prevPayload.bestScore ?? (existingExamResult?.score ?? score))

  const answersPayload = {
    score,
    correctAnswers,
    totalQuestions,
    answers,
    correctAnswersDetail,
    startedAt: existingExamResult?.startedAt?.toISOString() || completedAt.toISOString(),
    completedAt: completedAt.toISOString(),
    attemptCount,
    bestScore,
    history: test.isRetakable ? [...prevHistory, newHistoryEntry] : undefined,
  }

  // 1. Primary storage: Upsert into ExamResult table
  await prisma.examResult.upsert({
    where: {
      examId_studentId: {
        examId: testId,
        studentId: me.id,
      },
    },
    update: {
      score,
      completedAt,
      answers: answersPayload as import('@prisma/client').Prisma.InputJsonValue,
    },
    create: {
      examId: testId,
      studentId: me.id,
      score,
      startedAt: existingExamResult?.startedAt ?? completedAt,
      completedAt,
      answers: answersPayload as import('@prisma/client').Prisma.InputJsonValue,
    },
  })

  // 2. Legacy mirror: Store in userUnitProgress if unitId exists
  if (unitId) {
    const existingProgress = await prisma.userUnitProgress.findUnique({
      where: {
        userId_unitId: {
          userId: me.id,
          unitId,
        },
      },
    })
    let currentResults: Record<string, unknown> = {}
    if (existingProgress?.testResults && typeof existingProgress.testResults === 'object') {
      currentResults = { ...(existingProgress.testResults as Record<string, unknown>) }
    }
    currentResults[testId] = answersPayload

    await prisma.userUnitProgress.upsert({
      where: {
        userId_unitId: {
          userId: me.id,
          unitId,
        },
      },
      update: {
        testResults: currentResults as import('@prisma/client').Prisma.InputJsonValue,
      },
      create: {
        userId: me.id,
        unitId,
        testResults: currentResults as import('@prisma/client').Prisma.InputJsonValue,
      },
    })

    revalidatePath(`/student/classes/${classId}/units/${unitId}`)
  }

  revalidatePath(`/student/classes/${classId}`)
  revalidatePath(`/teacher/classes/${classId}`)

  return { success: true, resultData: answersPayload }
}
