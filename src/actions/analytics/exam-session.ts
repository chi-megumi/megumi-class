'use server'

import { revalidatePath } from 'next/cache'
import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import { TestBlock } from '@/modules/teacher/types'
import { gradeExamBlocks } from './grading'
import type { StartTestInput, SubmitTestResultInput, ExamAttemptHistoryEntry } from './types'

type StoredAnswersPayload = {
  score?: number | null
  attemptCount?: number
  bestScore?: number
  history?: ExamAttemptHistoryEntry[]
  startedAt?: string
  completedAt?: string | null
  durationSeconds?: number | null
  answers?: Record<string, string | number>
  correctAnswersDetail?: Record<string, string | number>
  totalQuestions?: number
  correctAnswers?: number
  isInterrupted?: boolean
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
    // Check if this was a bogus empty auto-submit caused by previous bugs
    const payload = (existingExamResult.answers as StoredAnswersPayload | null) || {}
    const hasAnyAnswers = payload.answers && Object.keys(payload.answers).length > 0
    const wasEmptyAutoSubmit =
      !hasAnyAnswers && (payload.isInterrupted || existingExamResult.score === 0 || existingExamResult.score === null)

    if (wasEmptyAutoSubmit) {
      // Heal the session so student can take the exam
      const startedAt = new Date()
      await prisma.examResult.update({
        where: { id: existingExamResult.id },
        data: {
          startedAt,
          completedAt: null,
          score: null,
          answers: {},
        },
      })
      if (unitId) {
        const progress = await prisma.userUnitProgress.findUnique({
          where: { userId_unitId: { userId: user.id, unitId } },
        })
        if (progress?.testResults && typeof progress.testResults === 'object') {
          const currentResults = { ...(progress.testResults as Record<string, unknown>) }
          delete currentResults[testId]
          await prisma.userUnitProgress.update({
            where: { userId_unitId: { userId: user.id, unitId } },
            data: { testResults: currentResults as import('@prisma/client').Prisma.InputJsonValue },
          })
        }
      }
      return {
        success: true,
        startedAt: startedAt.toISOString(),
        isCompleted: false,
      }
    }

    return {
      success: true,
      startedAt: existingExamResult.startedAt.toISOString(),
      isCompleted: true,
    }
  }

  if (existingExamResult?.startedAt) {
    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(existingExamResult.startedAt).getTime()) / 1000,
    )
    const durationSeconds = (test?.duration && test.duration > 0 ? test.duration : 15) * 60
    const payload = (existingExamResult.answers as StoredAnswersPayload | null) || {}
    const hasAnyAnswers = payload.answers && Object.keys(payload.answers).length > 0

    // If time expired and student either has no answers or it's a retakable practice test, reset timer
    if (elapsedSeconds >= durationSeconds && (isRetakable || !hasAnyAnswers)) {
      const freshStartedAt = new Date()
      await prisma.examResult.update({
        where: { id: existingExamResult.id },
        data: {
          startedAt: freshStartedAt,
          completedAt: null,
        },
      })
      return {
        success: true,
        startedAt: freshStartedAt.toISOString(),
        isCompleted: false,
      }
    }

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
  isInterrupted,
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

  // If interrupted without any answers, do not submit or mark completed
  if (isInterrupted && (!answers || Object.keys(answers).length === 0)) {
    return { success: true, resultData: undefined }
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

  // Sanitize answers input into a plain object of primitive string/number values
  const safeAnswers: Record<string, string | number> = {}
  if (answers && typeof answers === 'object') {
    try {
      for (const [k, v] of Object.entries(answers)) {
        if (typeof v === 'string' || typeof v === 'number') {
          safeAnswers[k] = v
        }
      }
    } catch {
      // In case of uniterable object
    }
  }

  const blocks = (test.content as unknown as TestBlock[]) || []
  const { totalQuestions, correctAnswers, correctAnswersDetail, score } = gradeExamBlocks(blocks, safeAnswers)
  const isFinalSubmission = !isInterrupted
  const completedAt = isFinalSubmission ? new Date() : null

  const startedAtDate = existingExamResult?.startedAt ? new Date(existingExamResult.startedAt) : new Date()
  const completedAtDate = completedAt ? new Date(completedAt) : new Date()
  const currentDurationSeconds = Math.max(1, Math.round((completedAtDate.getTime() - startedAtDate.getTime()) / 1000))

  // Build attempt history
  const prevPayload = (existingExamResult?.answers as StoredAnswersPayload | null) || {}
  const rawPrevHistory = Array.isArray(prevPayload.history) ? prevPayload.history : []

  const prevHistory: ExamAttemptHistoryEntry[] = [...rawPrevHistory]
  // If prevHistory was empty but existingExamResult was completed in the past, seed attempt 1 from existingExamResult
  if (prevHistory.length === 0 && existingExamResult?.completedAt) {
    const prevStarted = existingExamResult.startedAt ? new Date(existingExamResult.startedAt) : new Date()
    const prevCompleted = new Date(existingExamResult.completedAt)
    const prevDuration = Math.max(1, Math.round((prevCompleted.getTime() - prevStarted.getTime()) / 1000))
    prevHistory.push({
      attempt: 1,
      score: existingExamResult.score ?? prevPayload.score ?? 0,
      correctAnswers: prevPayload.correctAnswers ?? null,
      totalQuestions: prevPayload.totalQuestions ?? null,
      durationSeconds: prevDuration,
      startedAt: prevStarted.toISOString(),
      completedAt: prevCompleted.toISOString(),
      isInterrupted: !!prevPayload.isInterrupted,
      answers: prevPayload.answers || {},
      correctAnswersDetail: prevPayload.correctAnswersDetail || {},
    })
  }

  const prevAttemptCount = typeof prevPayload.attemptCount === 'number'
    ? prevPayload.attemptCount
    : prevHistory.length
  const attemptCount = isFinalSubmission ? prevAttemptCount + 1 : prevAttemptCount

  const newHistoryEntry: ExamAttemptHistoryEntry = {
    attempt: attemptCount,
    score,
    correctAnswers,
    totalQuestions,
    durationSeconds: currentDurationSeconds,
    startedAt: startedAtDate.toISOString(),
    completedAt: completedAtDate.toISOString(),
    isInterrupted: !!isInterrupted,
    answers: safeAnswers,
    correctAnswersDetail,
  }

  const bestScore = Math.max(score, prevPayload.bestScore ?? (existingExamResult?.score ?? score))

  const answersPayload = {
    score,
    correctAnswers,
    totalQuestions,
    answers: safeAnswers,
    correctAnswersDetail,
    startedAt: startedAtDate.toISOString(),
    completedAt: completedAt ? completedAt.toISOString() : null,
    attemptCount,
    bestScore,
    durationSeconds: currentDurationSeconds,
    isInterrupted: !!isInterrupted,
    history: isFinalSubmission ? [...prevHistory, newHistoryEntry] : prevHistory,
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
      score: isFinalSubmission ? score : (existingExamResult?.score ?? score),
      ...(completedAt ? { completedAt } : {}),
      answers: answersPayload as import('@prisma/client').Prisma.InputJsonValue,
    },
    create: {
      examId: testId,
      studentId: me.id,
      score,
      startedAt: existingExamResult?.startedAt ?? new Date(),
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
