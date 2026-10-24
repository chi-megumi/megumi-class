'use server'

import { revalidatePath } from 'next/cache'
import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import { deleteVocabImages } from '~/common/libs/supabase-storage'
import type { UnitSettingsInput, UnitVocabItemInput } from './types'
import { sanitizeExams } from './exam-utils'

export async function createUnit(classId: string, title: string, description?: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const targetClass = await prisma.class.findUnique({
    where: { id: classId, teacherId: user.id },
  })

  if (!targetClass) throw new Error('Unauthorized')

  const lastUnit = await prisma.unit.findFirst({
    where: { classId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })
  const nextSortOrder = (lastUnit?.sortOrder ?? -1) + 1

  const newUnit = await prisma.unit.create({
    data: {
      classId,
      title: title.trim(),
      description: description?.trim() || '',
      sortOrder: nextSortOrder,
    },
    include: {
      vocabItems: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      },
      studentProgress: true,
      exams: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  revalidatePath(`/teacher/classes/${classId}`, 'layout')
  return { success: true, unit: newUnit }
}

export async function updateUnitInfo(unitId: string, title: string, description?: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  const updatedUnit = await prisma.unit.update({
    where: { id: unitId },
    data: {
      title: title.trim(),
      description: description?.trim() || '',
    },
  })

  revalidatePath(`/teacher/classes/${unit.classId}`, 'layout')
  return { success: true, unit: updatedUnit }
}

export async function deleteUnit(unitId: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  // Lấy các ảnh thuộc unit chuẩn bị xóa để giải phóng dung lượng kho lưu trữ
  const existingVocabs = await prisma.vocabItem.findMany({
    where: { unitId },
    select: { id: true, image: true },
  })
  const imagesToDelete = existingVocabs.map((v) => v.image).filter(Boolean) as string[]
  const vIds = existingVocabs.map((v) => v.id)

  // Dọn dẹp quan hệ khóa ngoại quiz_answers và quiz_sessions trước khi xóa unit
  if (vIds.length > 0) {
    await prisma.quizAnswer.deleteMany({
      where: {
        OR: [{ vocabItemId: { in: vIds } }, { selectedVocabId: { in: vIds } }],
      },
    })
  }
  await prisma.quizSession.deleteMany({
    where: { unitId },
  })

  await prisma.unit.delete({
    where: { id: unitId },
  })

  if (imagesToDelete.length > 0) {
    deleteVocabImages(imagesToDelete).catch((err) =>
      console.warn('Lỗi dọn dẹp ảnh Supabase khi xóa Unit:', err),
    )
  }

  revalidatePath(`/teacher/classes/${unit.classId}`, 'layout')
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

  const updatedUnit = await prisma.unit.update({
    where: { id: unitId },
    data: settings,
  })

  revalidatePath(`/teacher/classes/${unit.classId}`, 'layout')
  revalidatePath(`/student/classes/${unit.classId}`)
  revalidatePath(`/student/classes/${unit.classId}/units/${unitId}`)
  return { success: true, unit: updatedUnit }
}

export async function updateUnitVocab(unitId: string, vocabItems: UnitVocabItemInput[]) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) throw new Error('Unauthorized')

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { class: true },
  })

  if (!unit || unit.class.teacherId !== user.id) throw new Error('Unauthorized')

  // Lấy danh sách ảnh hiện tại để dọn dẹp các ảnh bị xóa/thay thế
  const existingVocabs = await prisma.vocabItem.findMany({
    where: { unitId, image: { not: null } },
    select: { image: true },
  })
  const oldImageSet = new Set(existingVocabs.map((v) => v.image).filter(Boolean) as string[])
  const newImageSet = new Set(vocabItems.map((v) => v.image).filter(Boolean) as string[])
  const imagesToDelete = Array.from(oldImageSet).filter((img) => !newImageSet.has(img))

  // Transaction: Clean up quiz_answers constraints first, then update vocab items
  const unitVocabs = await prisma.vocabItem.findMany({
    where: { unitId },
    select: { id: true },
  })
  const unitVocabIds = unitVocabs.map((v) => v.id)

  await prisma.$transaction(async (tx) => {
    if (unitVocabIds.length > 0) {
      await tx.quizAnswer.deleteMany({
        where: {
          OR: [
            { vocabItemId: { in: unitVocabIds } },
            { selectedVocabId: { in: unitVocabIds } },
          ],
        },
      })
    }

    await tx.vocabItem.deleteMany({
      where: { unitId },
    })

    if (vocabItems.length > 0) {
      await tx.vocabItem.createMany({
        data: vocabItems.map((item, index) => ({
          unitId,
          word: item.word,
          vi: item.vi,
          ipa: item.ipa || null,
          pos: item.pos || null,
          emoji: item.emoji || null,
          image: item.image || null,
          example: item.example || null,
          exampleVi: item.exampleVi || null,
          tip: item.tip || null,
          sortOrder: index,
        })),
      })
    }
  })

  // Dọn dẹp ảnh cũ khỏi storage nếu có
  if (imagesToDelete.length > 0) {
    deleteVocabImages(imagesToDelete).catch((err) =>
      console.warn('Lỗi dọn dẹp ảnh Supabase khi cập nhật từ vựng:', err),
    )
  }

  revalidatePath(`/teacher/classes/${unit.classId}`, 'layout')
  return { success: true }
}

export async function getStudentUnitDetails(unitId: string) {
  const user = await getMe()
  if (!user) throw new Error('Unauthorized')

  if (user.role === 'teacher' || user.role === 'TEACHER' || user.systemRole === 'admin') {
    const unitOwned = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        class: true,
        vocabItems: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
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
    if (unitOwned && (unitOwned.class.teacherId === user.id || user.systemRole === 'admin')) {
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
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
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
