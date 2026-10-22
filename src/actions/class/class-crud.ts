'use server'

import { revalidatePath } from 'next/cache'
import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import type { CreateClassInput } from './types'
import { sanitizeExams } from './exam-utils'

export async function createClassAction(data: CreateClassInput) {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  // Generate invite code if not provided
  let inviteCode = data.inviteCode?.trim() || ''
  if (!inviteCode) {
    inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const validStudentIds = Array.from(new Set((data.studentIds || []).filter((id) => id !== '')))

  const newClass = await prisma.class.create({
    data: {
      name: data.name,
      description: data.description,
      inviteCode: inviteCode,
      teacherId: user.id,
      units: {
        create: data.units
          .filter((u) => u.name.trim() !== '')
          .map((unit, index) => ({
            title: unit.name,
            sortOrder: index,
            isPublished: true,
            createdAt: new Date(Date.now() + index * 1000),
          })),
      },
      students: {
        create: validStudentIds.map((studentId) => ({
          studentId,
        })),
      },
    },
  })

  revalidatePath('/')
  return { success: true, classId: newClass.id }
}

export async function getTeacherClasses() {
  const user = await getMe()
  if (!user || (user.role !== 'teacher' && user.role !== 'TEACHER')) {
    return []
  }

  const classes = await prisma.class.findMany({
    where: { teacherId: user.id },
    include: {
      units: {
        orderBy: [{ createdAt: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          title: true,
          classId: true,
          isPublished: true,
          createdAt: true,
          sortOrder: true,
          exams: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return classes
}

export async function getStudentClasses() {
  const user = await getMe()
  if (!user || (user.role === 'teacher' || user.role === 'TEACHER')) {
    return []
  }

  const enrollments = await prisma.classEnrollment.findMany({
    where: { studentId: user.id, status: 'active' },
    include: {
      class: {
        include: {
          units: {
            where: { isPublished: true },
            orderBy: [{ createdAt: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
            select: {
              id: true,
              title: true,
              classId: true,
              isPublished: true,
              createdAt: true,
              sortOrder: true,
              exams: {
                where: { isPublished: true, isEnabled: true },
              },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  })

  return enrollments.map((e) => {
    return {
      ...e.class,
      units: e.class.units.map((unit) => ({
        ...unit,
        exams: sanitizeExams(unit.exams || []),
      })),
    }
  })
}

export async function requestJoinClass(inviteCode: string) {
  const user = await getMe()
  if (!user) {
    throw new Error('Vui lòng đăng nhập để tham gia lớp học')
  }

  const code = inviteCode.trim().toUpperCase()
  if (!code) {
    throw new Error('Mã tham gia không hợp lệ')
  }

  const targetClass = await prisma.class.findUnique({
    where: { inviteCode: code },
  })

  if (!targetClass) {
    throw new Error('Lớp học không tồn tại hoặc mã tham gia không đúng')
  }

  if (targetClass.teacherId === user.id) {
    throw new Error('Bạn là giáo viên của lớp học này rồi')
  }

  // Check if already enrolled or pending
  const existingEnrollment = await prisma.classEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId: targetClass.id,
        studentId: user.id,
      },
    },
  })

  if (existingEnrollment) {
    if (existingEnrollment.status === 'pending') {
      throw new Error('Bạn đã gửi yêu cầu tham gia lớp này rồi, vui lòng chờ giáo viên duyệt.')
    }
    if (existingEnrollment.status === 'active') {
      throw new Error('Bạn đã ở trong lớp học này rồi.')
    }
    // if rejected, maybe allow re-request? For now just say already requested
    throw new Error('Không thể tham gia lớp học này.')
  }

  // Create pending enrollment
  await prisma.classEnrollment.create({
    data: {
      classId: targetClass.id,
      studentId: user.id,
      status: 'pending',
    },
  })

  revalidatePath('/')
  return { success: true, message: 'Đã gửi yêu cầu tham gia lớp học thành công' }
}

export async function getTeacherClassDetails(classId: string) {
  const user = await getMe()
  const isTeacher = user?.role === 'teacher' || user?.role === 'TEACHER'
  const isAdmin = user?.systemRole === 'admin'

  if (!user || (!isTeacher && !isAdmin)) {
    return null
  }

  const whereClause = isAdmin ? { id: classId } : { id: classId, teacherId: user.id }

  const classData = await prisma.class.findFirst({
    where: whereClause,
    include: {
      teacher: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      exams: {
        where: { unitId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          results: {
            where: { completedAt: { not: null } },
            include: {
              student: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
        },
      },
      units: {
        orderBy: [{ createdAt: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
        include: {
          vocabItems: {
            orderBy: { sortOrder: 'asc' },
          },
          studentProgress: true,
          exams: {
            orderBy: { createdAt: 'asc' },
            include: {
              results: {
                where: { completedAt: { not: null } },
                include: {
                  student: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                  },
                },
              },
            },
          },
        },
      },
      students: {
        include: {
          student: {
            select: { id: true, name: true, email: true, avatarUrl: true, userType: true },
          },
        },
        orderBy: { joinedAt: 'desc' },
      },
    },
  })

  return classData
}

export async function getStudentClassDetails(classId: string) {
  const user = await getMe()
  if (!user) throw new Error('Unauthorized')

  if (user.role === 'teacher' || user.role === 'TEACHER' || user.systemRole === 'admin') {
    const classWhere = user.systemRole === 'admin' ? { id: classId } : { id: classId, teacherId: user.id }
    const classOwned = await prisma.class.findUnique({
      where: classWhere,
      include: {
        units: {
          where: { isPublished: true },
          orderBy: [{ createdAt: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
          include: { exams: { where: { isPublished: true, isEnabled: true } } },
        },
        exams: {
          where: { isPublished: true, isEnabled: true, unitId: null },
          orderBy: { createdAt: 'desc' },
          include: {
            results: {
              where: { studentId: user.id },
            },
          },
        },
      },
    })
    if (classOwned) {
      return {
        ...classOwned,
        exams: sanitizeExams(classOwned.exams || []),
      }
    }
  }

  const enrollment = await prisma.classEnrollment.findUnique({
    where: { classId_studentId: { classId, studentId: user.id } },
  })
  if (!enrollment || enrollment.status !== 'active') throw new Error('Unauthorized')

  const targetClass = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      units: {
        where: { isPublished: true },
        orderBy: [{ createdAt: 'asc' }, { sortOrder: 'asc' }, { id: 'asc' }],
      },
      exams: {
        where: { isPublished: true, isEnabled: true, unitId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          results: {
            where: { studentId: user.id },
          },
        },
      },
    },
  })

  if (!targetClass) return null

  return {
    ...targetClass,
    exams: sanitizeExams(targetClass.exams || []),
  }
}
