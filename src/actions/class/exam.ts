'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import type { ExamUpsertInput } from './types'

export async function updateUnitExams(unitId: string, examsData: ExamUpsertInput[]) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  // We should not delete all exams because ExamResult would be lost.
  // Instead, we will iterate and upsert them.
  for (const exam of examsData) {
    const rawContent = (exam.content || exam.blocks || []) as Prisma.InputJsonValue

    if (exam.id.startsWith('temp-') || !exam.id) {
      await prisma.exam.create({
        data: {
          title: exam.title,
          duration: exam.duration,
          isEnabled: exam.isEnabled,
          isPublished: exam.isPublished,
          isRetakable: exam.isRetakable ?? false,
          content: rawContent,
          unitId: unit.id,
        },
      })
    } else {
      await prisma.exam.update({
        where: { id: exam.id },
        data: {
          title: exam.title,
          duration: exam.duration,
          isEnabled: exam.isEnabled,
          isPublished: exam.isPublished,
          isRetakable: exam.isRetakable ?? false,
          content: rawContent,
        },
      })
    }
  }

  const updatedUnit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { exams: { orderBy: { createdAt: 'asc' } } },
  })

  revalidatePath(`/teacher/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}/units/${unitId}`)
  return { success: true, exams: updatedUnit?.exams || [] }
}

export async function deleteUnitExam(examId: string, unitId: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  // Check if it's a real ID from DB and delete it.
  // It cascades and deletes ExamResult due to schema relations.
  if (examId && !examId.startsWith('temp-')) {
    await prisma.exam.delete({
      where: { id: examId },
    })
  }

  const updatedUnit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { exams: { orderBy: { createdAt: 'asc' } } },
  })

  revalidatePath(`/teacher/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}/units/${unitId}`)
  return { success: true, exams: updatedUnit?.exams || [] }
}

export async function updateClassExams(classId: string, examsData: ExamUpsertInput[]) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const targetClass = await prisma.class.findUnique({
    where: { id: classId, teacherId: user.id },
  })

  if (!targetClass) throw new Error('Unauthorized')

  for (const exam of examsData) {
    const rawContent = (exam.content || exam.blocks || []) as Prisma.InputJsonValue

    if (exam.id.startsWith('temp-') || !exam.id) {
      await prisma.exam.create({
        data: {
          title: exam.title,
          duration: exam.duration,
          isEnabled: exam.isEnabled,
          isPublished: exam.isPublished,
          isRetakable: exam.isRetakable ?? false,
          content: rawContent,
          classId: targetClass.id,
          unitId: null,
        },
      })
    } else {
      await prisma.exam.update({
        where: { id: exam.id },
        data: {
          title: exam.title,
          duration: exam.duration,
          isEnabled: exam.isEnabled,
          isPublished: exam.isPublished,
          isRetakable: exam.isRetakable ?? false,
          content: rawContent,
        },
      })
    }
  }

  const updatedClass = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      exams: {
        where: { unitId: null },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  revalidatePath(`/teacher/classes/${classId}`)
  revalidatePath(`/student/classes/${classId}`)
  return { success: true, exams: updatedClass?.exams || [] }
}

export async function deleteClassExam(examId: string, classId: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const targetClass = await prisma.class.findUnique({
    where: { id: classId, teacherId: user.id },
  })

  if (!targetClass) throw new Error('Unauthorized')

  if (examId && !examId.startsWith('temp-')) {
    await prisma.exam.delete({
      where: { id: examId },
    })
  }

  const updatedClass = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      exams: {
        where: { unitId: null },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  revalidatePath(`/teacher/classes/${classId}`)
  revalidatePath(`/student/classes/${classId}`)
  return { success: true, exams: updatedClass?.exams || [] }
}
