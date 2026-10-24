'use server'

import { revalidatePath } from 'next/cache'
import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import type { EnrollmentStatus } from './types'

export async function updateEnrollmentStatus(enrollmentId: string, status: EnrollmentStatus) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  // Verify teacher owns this class
  const enrollment = await prisma.classEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { class: true },
  })

  if (!enrollment || enrollment.class.teacherId !== user.id) {
    throw new Error('Không tìm thấy thông tin hoặc bạn không có quyền')
  }

  await prisma.classEnrollment.update({
    where: { id: enrollmentId },
    data: { status },
  })

  revalidatePath(`/teacher/classes/${enrollment.classId}`, 'layout')
  return { success: true }
}

export async function removeStudentFromClass(enrollmentId: string) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  const enrollment = await prisma.classEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { class: true },
  })

  if (!enrollment || enrollment.class.teacherId !== user.id) {
    throw new Error('Không tìm thấy thông tin hoặc bạn không có quyền')
  }

  await prisma.classEnrollment.delete({
    where: { id: enrollmentId },
  })

  revalidatePath(`/teacher/classes/${enrollment.classId}`, 'layout')
  return { success: true }
}

export async function addStudentsToClass(classId: string, studentIds: string[]) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  const targetClass = await prisma.class.findUnique({
    where: { id: classId, teacherId: user.id },
  })

  if (!targetClass) {
    throw new Error('Không tìm thấy lớp học hoặc bạn không có quyền')
  }

  const validIds = studentIds.filter((id) => id.trim() !== '')
  if (validIds.length === 0) return { success: true }

  // Create active enrollments for students not already in the class
  for (const sId of validIds) {
    await prisma.classEnrollment.upsert({
      where: {
        classId_studentId: { classId, studentId: sId },
      },
      update: { status: 'active' },
      create: { classId, studentId: sId, status: 'active' },
    })
  }

  revalidatePath(`/teacher/classes/${classId}`, 'layout')
  return { success: true }
}
