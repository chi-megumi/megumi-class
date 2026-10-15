'use server'

import { revalidatePath } from 'next/cache'
import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import type { UnitSettingsInput, UnitVocabItemInput } from './types'
import { sanitizeExams } from './exam-utils'

export async function createUnit(classId: string, title: string, description?: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const targetClass = await prisma.class.findUnique({
    where: { id: classId, teacherId: user.id },
  })

  if (!targetClass) throw new Error('Unauthorized')

  await prisma.unit.create({
    data: {
      classId,
      title: title.trim(),
      description: description?.trim() || '',
    },
  })

  revalidatePath(`/teacher/classes/${classId}`)
  return { success: true }
}

export async function updateUnitInfo(unitId: string, title: string, description?: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  await prisma.unit.update({
    where: { id: unitId },
    data: {
      title: title.trim(),
      description: description?.trim() || '',
    },
  })

  revalidatePath(`/teacher/classes/${unit.classId}`)
  return { success: true }
}

export async function deleteUnit(unitId: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  await prisma.unit.delete({
    where: { id: unitId },
  })

  revalidatePath(`/teacher/classes/${unit.classId}`)
  return { success: true }
}

export async function updateUnitSettings(unitId: string, settings: UnitSettingsInput) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  await prisma.unit.update({
    where: { id: unitId },
    data: settings,
  })

  revalidatePath(`/teacher/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}/units/${unitId}`)
  return { success: true }
}

export async function updateUnitVocab(unitId: string, vocabItems: UnitVocabItemInput[]) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  // Transaction: Delete existing vocabs in unit, then create new ones
  await prisma.$transaction([
    prisma.vocabItem.deleteMany({
      where: { unitId },
    }),
    prisma.vocabItem.createMany({
      data: vocabItems.map((item, index) => ({
        unitId,
        word: item.word,
        vi: item.vi,
        ipa: item.ipa || null,
        pos: item.pos || null,
        emoji: item.emoji || null,
        example: item.example || null,
        exampleVi: item.exampleVi || null,
        sortOrder: index,
      })),
    }),
  ])

  revalidatePath(`/teacher/classes/${unit.classId}`)
  return { success: true }
}

export async function getStudentUnitDetails(unitId: string) {
  const user = await getMe()
  if (!user) throw new Error('Unauthorized')

  if (user.role === 'teacher' || user.role === 'TEACHER') {
    const unitOwned = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        class: true,
        vocabItems: {
          orderBy: { sortOrder: 'asc' },
        },
        studentProgress: {
          where: { userId: user.id },
        },
        exams: {
          orderBy: { createdAt: 'asc' },
          include: {
            results: {
              where: { studentId: user.id },
            },
          },
        },
      },
    })
    if (unitOwned && unitOwned.class.teacherId === user.id) {
      // Sanitize for student view
      const exams = unitOwned.exams || []
      return { ...unitOwned, exams: sanitizeExams(exams) }
    }
  }

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      class: {
        include: {
          students: {
            where: { studentId: user.id, status: 'active' },
          },
        },
      },
      vocabItems: {
        orderBy: { sortOrder: 'asc' },
      },
      studentProgress: {
        where: { userId: user.id },
      },
      exams: {
        where: { isPublished: true, isEnabled: true },
        orderBy: { createdAt: 'asc' },
        include: {
          results: {
            where: { studentId: user.id },
          },
        },
      },
    },
  })

  if (!unit || unit.class.students.length === 0 || !unit.isPublished) {
    throw new Error('Unauthorized or Unit not published')
  }

  // Sanitize test content to prevent students from cheating
  const exams = unit.exams || []
  return { ...unit, exams: sanitizeExams(exams) }
}
