'use server'

import { revalidatePath } from 'next/cache'
import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import type { GameCompletionInput } from './types'

/**
 * Increments the play count and updates best score/time for a specific game in a unit.
 * Used at the end of a game session by the student.
 */
export async function recordGameCompletion({
  unitId,
  classId,
  gameType,
  score,
  time,
  masteryProgress,
  isInterrupted,
  isQuickExit,
  correctCount,
  totalCount,
  quizAnswers,
}: GameCompletionInput) {
  const me = await getMe()
  if (!me) {
    return { success: false, error: 'Unauthorized' }
  }

  const role = me.role?.toLowerCase()
  const isAdmin = me.systemRole === 'admin'
  // Teachers and admins have full rights of students, so students, teachers, and admins can study and record progress
  if (role !== 'student' && role !== 'teacher' && !isAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  // Ensure the progress record exists
  const existingProgress = await prisma.userUnitProgress.findUnique({
    where: {
      userId_unitId: {
        userId: me.id,
        unitId,
      },
    },
  })

  const now = new Date().toISOString()
  const duration = time || 0
  const hasUserAction =
    (quizAnswers && quizAnswers.length > 0) ||
    (correctCount ?? 0) > 0 ||
    (totalCount ?? 0) > 0 ||
    (masteryProgress ?? 0) > 0 ||
    duration >= 3
  const isAccidentalInstantBounce = duration < 1 && !hasUserAction
  const isQuick = isQuickExit !== undefined ? isQuickExit && !hasUserAction : isAccidentalInstantBounce

  if (!existingProgress) {
    const initialHistory = {
      flashcard:
        gameType === 'flashcard'
          ? [
              {
                attempt: 1,
                durationSeconds: duration,
                masteryProgress,
                isInterrupted: !!isInterrupted,
                isQuickExit: isQuick,
                completedAt: now,
              },
            ]
          : [],
      quiz:
        gameType === 'quiz'
          ? [
              {
                attempt: 1,
                score: score || 0,
                correctCount,
                totalCount,
                durationSeconds: duration,
                isInterrupted: !!isInterrupted,
                isQuickExit: isQuick,
                completedAt: now,
                answers: quizAnswers,
              },
            ]
          : [],
      match:
        gameType === 'match'
          ? [
              {
                attempt: 1,
                durationSeconds: duration,
                isInterrupted: !!isInterrupted,
                isQuickExit: isQuick,
                completedAt: now,
              },
            ]
          : [],
    }

    // Create new
    await prisma.userUnitProgress.create({
      data: {
        userId: me.id,
        unitId,
        flashcardPlayCount: gameType === 'flashcard' ? 1 : 0,
        quizPlayCount: gameType === 'quiz' ? 1 : 0,
        bestQuizScore: gameType === 'quiz' ? score : null,
        matchPlayCount: gameType === 'match' ? 1 : 0,
        bestMatchTime: gameType === 'match' && !isInterrupted && duration > 0 ? duration : null,
        masteryProgress: masteryProgress || 0,
        activityHistory: initialHistory as import('@prisma/client').Prisma.InputJsonValue,
      },
    })
  } else {
    // Update existing
    const updateData: import('@prisma/client').Prisma.UserUnitProgressUpdateInput = {}

    if (masteryProgress !== undefined) {
      updateData.masteryProgress = masteryProgress
    }

    const currentHistory = (existingProgress.activityHistory as Record<string, unknown> | null) || {}
    const flashcardList = Array.isArray(currentHistory.flashcard) ? [...currentHistory.flashcard] : []
    const quizList = Array.isArray(currentHistory.quiz) ? [...currentHistory.quiz] : []
    const matchList = Array.isArray(currentHistory.match) ? [...currentHistory.match] : []

    if (gameType === 'flashcard') {
      const lastItem =
        flashcardList.length > 0
          ? (flashcardList[flashcardList.length - 1] as {
              attempt?: number
              completedAt?: string
              isInterrupted?: boolean
              durationSeconds?: number
              isQuickExit?: boolean
              masteryProgress?: number
            })
          : null

      const isDuplicate =
        lastItem &&
        lastItem.completedAt &&
        Math.abs(Date.now() - new Date(lastItem.completedAt).getTime()) < 15000

      if (isDuplicate && lastItem) {
        lastItem.durationSeconds = Math.max(lastItem.durationSeconds || 0, duration)
        if (!isInterrupted) {
          lastItem.isInterrupted = false
        }
        if (isQuick !== undefined) {
          lastItem.isQuickExit = isQuick
        }
        lastItem.completedAt = now
        if (masteryProgress !== undefined) {
          lastItem.masteryProgress = masteryProgress
        }
      } else {
        updateData.flashcardPlayCount = { increment: 1 }
        const lastAttempt = lastItem?.attempt || existingProgress.flashcardPlayCount || 0
        flashcardList.push({
          attempt: lastAttempt + 1,
          durationSeconds: duration,
          masteryProgress,
          isInterrupted: !!isInterrupted,
          isQuickExit: isQuick,
          completedAt: now,
        })
      }
    } else if (gameType === 'quiz') {
      const lastItem =
        quizList.length > 0
          ? (quizList[quizList.length - 1] as {
              attempt?: number
              completedAt?: string
              isInterrupted?: boolean
              durationSeconds?: number
              isQuickExit?: boolean
              score?: number
              correctCount?: number
              totalCount?: number
              answers?: Array<{ wordId: string; correct: boolean; selectedWordId?: string }>
            })
          : null

      const isDuplicate =
        lastItem &&
        lastItem.completedAt &&
        Math.abs(Date.now() - new Date(lastItem.completedAt).getTime()) < 15000

      if (isDuplicate && lastItem) {
        lastItem.durationSeconds = Math.max(lastItem.durationSeconds || 0, duration)
        if (!isInterrupted) {
          lastItem.isInterrupted = false
        }
        if (isQuick !== undefined) {
          lastItem.isQuickExit = isQuick
        }
        lastItem.completedAt = now
        if (score !== undefined) {
          lastItem.score = score
          if (
            existingProgress.bestQuizScore === null ||
            score > existingProgress.bestQuizScore
          ) {
            updateData.bestQuizScore = score
          }
        }
        if (correctCount !== undefined) lastItem.correctCount = correctCount
        if (totalCount !== undefined) lastItem.totalCount = totalCount
        if (quizAnswers && quizAnswers.length > 0) lastItem.answers = quizAnswers
      } else {
        updateData.quizPlayCount = { increment: 1 }
        if (
          score !== undefined &&
          (existingProgress.bestQuizScore === null || score > existingProgress.bestQuizScore)
        ) {
          updateData.bestQuizScore = score
        }
        const lastAttempt = lastItem?.attempt || existingProgress.quizPlayCount || 0
        quizList.push({
          attempt: lastAttempt + 1,
          score: score || 0,
          correctCount,
          totalCount,
          durationSeconds: duration,
          isInterrupted: !!isInterrupted,
          isQuickExit: isQuick,
          completedAt: now,
          answers: quizAnswers,
        })
      }
    } else if (gameType === 'match') {
      const lastItem =
        matchList.length > 0
          ? (matchList[matchList.length - 1] as {
              attempt?: number
              completedAt?: string
              isInterrupted?: boolean
              durationSeconds?: number
              isQuickExit?: boolean
            })
          : null

      const isDuplicate =
        lastItem &&
        lastItem.completedAt &&
        Math.abs(Date.now() - new Date(lastItem.completedAt).getTime()) < 15000

      if (isDuplicate && lastItem) {
        lastItem.durationSeconds = Math.max(lastItem.durationSeconds || 0, duration)
        if (!isInterrupted) {
          lastItem.isInterrupted = false
          if (
            lastItem.durationSeconds > 0 &&
            (existingProgress.bestMatchTime === null ||
              lastItem.durationSeconds < existingProgress.bestMatchTime)
          ) {
            updateData.bestMatchTime = lastItem.durationSeconds
          }
        }
        if (isQuick !== undefined) {
          lastItem.isQuickExit = isQuick
        }
        lastItem.completedAt = now
      } else {
        updateData.matchPlayCount = { increment: 1 }
        if (
          duration > 0 &&
          !isInterrupted &&
          (existingProgress.bestMatchTime === null || duration < existingProgress.bestMatchTime)
        ) {
          updateData.bestMatchTime = duration
        }
        const lastAttempt = lastItem?.attempt || existingProgress.matchPlayCount || 0
        matchList.push({
          attempt: lastAttempt + 1,
          durationSeconds: duration,
          isInterrupted: !!isInterrupted,
          isQuickExit: isQuick,
          completedAt: now,
        })
      }
    }

    updateData.activityHistory = {
      flashcard: flashcardList,
      quiz: quizList,
      match: matchList,
    } as import('@prisma/client').Prisma.InputJsonValue

    await prisma.userUnitProgress.update({
      where: { id: existingProgress.id },
      data: updateData,
    })
  }

  // Also persist QuizSession and QuizAnswer records for question/word mistake analytics
  if (gameType === 'quiz' && quizAnswers && quizAnswers.length > 0 && !isQuick) {
    try {
      const validVocabs = await prisma.vocabItem.findMany({
        where: { unitId },
        select: { id: true },
      })
      const validIds = new Set(validVocabs.map((v) => v.id))

      const answerRows = quizAnswers
        .filter((ans) => validIds.has(ans.wordId))
        .map((ans, idx) => ({
          vocabItemId: ans.wordId,
          selectedVocabId:
            ans.selectedWordId && validIds.has(ans.selectedWordId)
              ? ans.selectedWordId
              : ans.wordId,
          isCorrect: ans.correct,
          questionOrder: idx + 1,
        }))

      if (answerRows.length > 0) {
        await prisma.quizSession.create({
          data: {
            userId: me.id,
            unitId,
            mode: 'scored',
            score: score ?? null,
            correctCount: correctCount ?? 0,
            totalCount: totalCount ?? quizAnswers.length,
            durationMs: duration * 1000,
            completedAt: new Date(now),
            answers: {
              create: answerRows,
            },
          },
        })
      }
    } catch (err) {
      console.error('Failed to create quiz session records:', err)
    }
  }

  // Revalidate the teacher's dashboard and student unit so they see updated counts immediately
  if (classId) {
    try {
      revalidatePath(`/teacher/classes/${classId}`)
      revalidatePath(`/teacher/classes/${classId}/units`)
      revalidatePath(`/student/classes/${classId}/units/${unitId}`)
    } catch {
      // Safe fallback when executed in an API route / sendBeacon context
    }
  }

  return { success: true }
}

/**
 * Synchronizes student's vocabulary mastery percentage to user_unit_progress
 * Called when marking words as mastered in VocabVault or Flashcards.
 */
export async function syncMasteryProgress({
  unitId,
  classId,
  masteryProgress,
}: {
  unitId: string
  classId?: string
  masteryProgress: number
}) {
  const me = await getMe()
  if (!me) return { success: false, error: 'Unauthorized' }

  const role = me.role?.toLowerCase()
  const isAdmin = me.systemRole === 'admin'
  if (role !== 'student' && role !== 'teacher' && !isAdmin) {
    return { success: false, error: 'Unauthorized' }
  }

  const sanitizedMastery = Math.min(100, Math.max(0, Math.round(masteryProgress)))

  await prisma.userUnitProgress.upsert({
    where: {
      userId_unitId: {
        userId: me.id,
        unitId,
      },
    },
    create: {
      userId: me.id,
      unitId,
      masteryProgress: sanitizedMastery,
    },
    update: {
      masteryProgress: sanitizedMastery,
    },
  })

  if (classId) {
    revalidatePath(`/teacher/classes/${classId}`)
  }

  return { success: true, masteryProgress: sanitizedMastery }
}
