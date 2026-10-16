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
}: GameCompletionInput) {
  const me = await getMe()
  if (!me) {
    return { success: false, error: 'Unauthorized' }
  }

  const role = me.role?.toLowerCase()
  // Teachers have full rights of students, so both students and teachers can study and record progress
  if (role !== 'student' && role !== 'teacher') {
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
  const isQuick =
    isQuickExit !== undefined
      ? isQuickExit
      : duration < 5 ||
        (gameType === 'quiz' && (correctCount ?? 0) === 0 && (totalCount ?? 0) === 0 && duration < 10)

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
        flashcardPlayCount: gameType === 'flashcard' && !isQuick ? 1 : 0,
        quizPlayCount: gameType === 'quiz' && !isQuick ? 1 : 0,
        bestQuizScore: gameType === 'quiz' && !isQuick ? score : null,
        matchPlayCount: gameType === 'match' && !isQuick ? 1 : 0,
        bestMatchTime: gameType === 'match' && !isQuick && !isInterrupted ? duration : null,
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

      const isDuplicateInterrupted =
        lastItem &&
        (lastItem.isInterrupted || !!isInterrupted) &&
        lastItem.completedAt &&
        Math.abs(Date.now() - new Date(lastItem.completedAt).getTime()) < 15000

      if (isDuplicateInterrupted && lastItem) {
        lastItem.durationSeconds = Math.max(lastItem.durationSeconds || 0, duration)
        lastItem.isQuickExit = lastItem.durationSeconds < 5
        lastItem.completedAt = now
        if (masteryProgress !== undefined) {
          lastItem.masteryProgress = masteryProgress
        }
      } else {
        if (!isQuick) {
          updateData.flashcardPlayCount = { increment: 1 }
        }
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
            })
          : null

      const isDuplicateInterrupted =
        lastItem &&
        (lastItem.isInterrupted || !!isInterrupted) &&
        lastItem.completedAt &&
        Math.abs(Date.now() - new Date(lastItem.completedAt).getTime()) < 15000

      if (isDuplicateInterrupted && lastItem) {
        lastItem.durationSeconds = Math.max(lastItem.durationSeconds || 0, duration)
        lastItem.isQuickExit = lastItem.durationSeconds < 5
        lastItem.completedAt = now
        if (score !== undefined) lastItem.score = score
        if (correctCount !== undefined) lastItem.correctCount = correctCount
        if (totalCount !== undefined) lastItem.totalCount = totalCount
      } else {
        if (!isQuick) {
          updateData.quizPlayCount = { increment: 1 }
        }
        if (
          !isQuick &&
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

      const isDuplicateInterrupted =
        lastItem &&
        (lastItem.isInterrupted || !!isInterrupted) &&
        lastItem.completedAt &&
        Math.abs(Date.now() - new Date(lastItem.completedAt).getTime()) < 15000

      if (isDuplicateInterrupted && lastItem) {
        lastItem.durationSeconds = Math.max(lastItem.durationSeconds || 0, duration)
        lastItem.isQuickExit = lastItem.durationSeconds < 5
        lastItem.completedAt = now
      } else {
        if (!isQuick) {
          updateData.matchPlayCount = { increment: 1 }
        }
        if (
          !isQuick &&
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

  // Revalidate the teacher's dashboard so they see the updated counts immediately
  if (classId) {
    revalidatePath(`/teacher/classes/${classId}`)
  }

  return { success: true }
}
