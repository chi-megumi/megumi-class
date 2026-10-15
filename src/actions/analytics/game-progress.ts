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

  if (!existingProgress) {
    // Create new
    await prisma.userUnitProgress.create({
      data: {
        userId: me.id,
        unitId,
        flashcardPlayCount: gameType === 'flashcard' ? 1 : 0,
        quizPlayCount: gameType === 'quiz' ? 1 : 0,
        bestQuizScore: gameType === 'quiz' ? score : null,
        matchPlayCount: gameType === 'match' ? 1 : 0,
        bestMatchTime: gameType === 'match' ? time : null,
        masteryProgress: masteryProgress || 0,
      },
    })
  } else {
    // Update existing
    const updateData: import('@prisma/client').Prisma.UserUnitProgressUpdateInput = {}

    if (masteryProgress !== undefined) {
      updateData.masteryProgress = masteryProgress
    }

    if (gameType === 'flashcard') {
      updateData.flashcardPlayCount = { increment: 1 }
    } else if (gameType === 'quiz') {
      updateData.quizPlayCount = { increment: 1 }
      if (score !== undefined && (existingProgress.bestQuizScore === null || score > existingProgress.bestQuizScore)) {
        updateData.bestQuizScore = score
      }
    } else if (gameType === 'match') {
      updateData.matchPlayCount = { increment: 1 }
      if (time !== undefined && (existingProgress.bestMatchTime === null || time < existingProgress.bestMatchTime)) {
        updateData.bestMatchTime = time
      }
    }

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
