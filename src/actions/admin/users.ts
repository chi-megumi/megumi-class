'use server'

import { revalidatePath } from 'next/cache'
import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'

export type AdminUserItem = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  userType: string | null
  systemRole: string
  createdAt: Date
}

type ActionResult<T = unknown> = {
  success: boolean
  message?: string
  error?: string
  data?: T
}

async function verifyAdmin() {
  const user = await getMe()
  if (!user || user.systemRole !== 'admin') {
    throw new Error('Chỉ Quản trị viên (Admin) mới có quyền thực hiện thao tác này')
  }
  return user
}

export async function adminSetUserTypeAction({
  targetUserId,
  newUserType,
}: {
  targetUserId: string
  newUserType: 'student' | 'teacher'
}): Promise<ActionResult<{ userId: string; userType: string }>> {
  try {
    await verifyAdmin()

    if (!targetUserId) {
      return { success: false, error: 'Thiếu ID người dùng cần cập nhật' }
    }

    if (newUserType !== 'student' && newUserType !== 'teacher') {
      return { success: false, error: 'Loại người dùng không hợp lệ' }
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, userType: true },
    })

    if (!target) {
      return { success: false, error: 'Không tìm thấy người dùng' }
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { userType: newUserType },
      select: { id: true, name: true, userType: true },
    })

    revalidatePath('/admin')
    revalidatePath('/teacher')
    revalidatePath('/')

    return {
      success: true,
      message: `Đã cập nhật vai trò của ${updated.name} thành "${newUserType === 'teacher' ? 'Giáo viên' : 'Học sinh'}"`,
      data: {
        userId: updated.id,
        userType: updated.userType || newUserType,
      },
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật vai trò'
    return { success: false, error: errorMsg }
  }
}

export async function adminSearchUsersAction({
  query,
  limit = 10,
}: {
  query: string
  limit?: number
}): Promise<ActionResult<AdminUserItem[]>> {
  try {
    await verifyAdmin()

    const trimmed = query.trim()
    const whereClause = trimmed
      ? {
          OR: [
            { name: { contains: trimmed, mode: 'insensitive' as const } },
            { email: { contains: trimmed, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const users = await prisma.user.findMany({
      where: whereClause,
      take: Math.min(limit, 50),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        userType: true,
        systemRole: true,
        createdAt: true,
      },
    })

    return {
      success: true,
      data: users,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tìm kiếm người dùng'
    return { success: false, error: errorMsg, data: [] }
  }
}

export async function adminGetTeachersListAction(): Promise<ActionResult<AdminUserItem[]>> {
  try {
    await verifyAdmin()

    const teachers = await prisma.user.findMany({
      where: {
        OR: [{ userType: 'teacher' }, { systemRole: 'admin' }],
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        userType: true,
        systemRole: true,
        createdAt: true,
      },
    })

    return {
      success: true,
      data: teachers,
    }
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách giáo viên'
    return { success: false, error: errorMsg, data: [] }
  }
}

export type AdminUserRoleFilter = 'all' | 'teacher' | 'student' | 'admin'

export type AdminUserStats = {
  total: number
  teachers: number
  students: number
  admins: number
}

export type AdminGetUsersResult = {
  users: AdminUserItem[]
  stats: AdminUserStats
}

export async function adminGetUsersAction({
  query = '',
  role = 'all',
  limit = 50,
}: {
  query?: string
  role?: AdminUserRoleFilter
  limit?: number
} = {}): Promise<ActionResult<AdminGetUsersResult>> {
  try {
    await verifyAdmin()

    const trimmed = query.trim()
    const whereClause: Record<string, unknown> = {}

    if (trimmed) {
      whereClause.OR = [
        { name: { contains: trimmed, mode: 'insensitive' as const } },
        { email: { contains: trimmed, mode: 'insensitive' as const } },
      ]
    }

    if (role === 'teacher') {
      whereClause.userType = 'teacher'
    } else if (role === 'student') {
      whereClause.userType = 'student'
    } else if (role === 'admin') {
      whereClause.systemRole = 'admin'
    }

    const [users, total, teachers, students, admins] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        take: Math.min(limit, 100),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          userType: true,
          systemRole: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { userType: 'teacher' } }),
      prisma.user.count({ where: { userType: 'student' } }),
      prisma.user.count({ where: { systemRole: 'admin' } }),
    ])

    return {
      success: true,
      data: {
        users,
        stats: {
          total,
          teachers,
          students,
          admins,
        },
      },
    }
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách người dùng'
    return {
      success: false,
      error: errorMsg,
      data: {
        users: [],
        stats: { total: 0, teachers: 0, students: 0, admins: 0 },
      },
    }
  }
}

