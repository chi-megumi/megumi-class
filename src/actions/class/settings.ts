'use server'

import { revalidatePath } from 'next/cache'
import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'

type ActionResult<T = unknown> = {
  success: boolean
  message?: string
  error?: string
  data?: T
}

async function verifyClassAdminOrTeacher(classId: string) {
  const user = await getMe()
  if (!user) {
    throw new Error('Vui lòng đăng nhập để tiếp tục')
  }

  const targetClass = await prisma.class.findUnique({
    where: { id: classId },
    select: { id: true, name: true, teacherId: true, inviteCode: true },
  })

  if (!targetClass) {
    throw new Error('Lớp học không tồn tại')
  }

  const isAdmin = user.systemRole === 'admin'
  const isOwnerTeacher = targetClass.teacherId === user.id

  if (!isAdmin && !isOwnerTeacher) {
    throw new Error('Bạn không có quyền thực hiện thao tác trên lớp học này')
  }

  return { user, targetClass, isAdmin, isOwnerTeacher }
}

export async function updateClassInfoAction(
  classId: string,
  data: { name: string; description?: string },
): Promise<ActionResult<{ name: string; description?: string | null }>> {
  try {
    await verifyClassAdminOrTeacher(classId)

    const trimmedName = data.name?.trim()
    if (!trimmedName) {
      return { success: false, error: 'Tên lớp học không được để trống' }
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: {
        name: trimmedName,
        description: data.description?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    })

    revalidatePath(`/teacher/classes/${classId}`)
    revalidatePath('/teacher')

    return {
      success: true,
      message: 'Cập nhật thông tin lớp học thành công',
      data: {
        name: updated.name,
        description: updated.description,
      },
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật'
    return { success: false, error: errorMsg }
  }
}

export async function regenerateInviteCodeAction(
  classId: string,
): Promise<ActionResult<{ inviteCode: string }>> {
  try {
    await verifyClassAdminOrTeacher(classId)

    // Generate unique 6-character code
    let newCode = ''
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      const existing = await prisma.class.findUnique({
        where: { inviteCode: newCode },
        select: { id: true },
      })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return { success: false, error: 'Không thể tạo mã mời mới, vui lòng thử lại sau' }
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: { inviteCode: newCode },
      select: { inviteCode: true },
    })

    revalidatePath(`/teacher/classes/${classId}`)
    return {
      success: true,
      message: 'Đã tạo mã mời mới thành công',
      data: { inviteCode: updated.inviteCode || newCode },
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo mã mời mới'
    return { success: false, error: errorMsg }
  }
}

export async function deleteClassAction(
  classId: string,
  confirmName: string,
): Promise<ActionResult> {
  try {
    const { targetClass } = await verifyClassAdminOrTeacher(classId)

    if (confirmName.trim().toLowerCase() !== targetClass.name.trim().toLowerCase()) {
      return { success: false, error: 'Tên xác nhận không khớp với tên lớp học' }
    }

    await prisma.class.delete({
      where: { id: classId },
    })

    revalidatePath('/teacher')
    return { success: true, message: 'Đã xóa lớp học thành công' }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa lớp học'
    return { success: false, error: errorMsg }
  }
}

export async function transferClassOwnershipAction(
  classId: string,
  newTeacherId: string,
): Promise<ActionResult> {
  try {
    await verifyClassAdminOrTeacher(classId)

    const targetUser = await prisma.user.findUnique({
      where: { id: newTeacherId },
      select: { id: true, name: true, userType: true },
    })

    if (!targetUser) {
      return { success: false, error: 'Giáo viên mới không tồn tại trong hệ thống' }
    }

    // Update teacherId and ensure new teacher userType is 'teacher'
    await prisma.$transaction([
      prisma.user.update({
        where: { id: newTeacherId },
        data: { userType: 'teacher' },
      }),
      prisma.class.update({
        where: { id: classId },
        data: { teacherId: newTeacherId },
      }),
    ])

    revalidatePath(`/teacher/classes/${classId}`)
    revalidatePath('/teacher')

    return {
      success: true,
      message: `Đã chuyển giao quyền sở hữu lớp cho giáo viên ${targetUser.name}`,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi chuyển giao lớp học'
    return { success: false, error: errorMsg }
  }
}
