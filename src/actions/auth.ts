'use server'

import { cookies } from 'next/headers'
import { signToken, verifyToken } from '@/common/libs/jwt'
import { prisma } from '@/common/libs/prisma'
import bcrypt from 'bcryptjs'
import { loginSchema, registerSchema } from '@/common/schemas'
import { z } from 'zod'

export async function login(data: z.infer<typeof loginSchema>) {
  try {
    const validated = loginSchema.parse(data)
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (!user) {
      return { error: 'Email không tồn tại' }
    }

    const isValid = await bcrypt.compare(validated.password, user.passwordHash)
    if (!isValid) {
      return { error: 'Mật khẩu không đúng' }
    }

    const token = await signToken({
      userId: user.id,
      role: user.userType,
    })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return {
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.userType },
    }
  } catch {
    return { error: 'Dữ liệu không hợp lệ hoặc có lỗi xảy ra' }
  }
}

export async function register(data: z.infer<typeof registerSchema>) {
  try {
    const validated = registerSchema.parse(data)

    if (validated.password !== validated.confirmPassword) {
      return { error: 'Mật khẩu không khớp' }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return { error: 'Email đã được sử dụng' }
    }

    const passwordHash = await bcrypt.hash(validated.password, 10)

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        passwordHash,
        name: validated.email.split('@')[0], // Default name
        userType: 'student', // Default role
      },
    })

    const token = await signToken({
      userId: user.id,
      role: user.userType,
    })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return {
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.userType },
    }
  } catch {
    return { error: 'Dữ liệu không hợp lệ hoặc có lỗi xảy ra' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
  return { success: true }
}

export async function getMe() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload || !payload.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    })
    if (!user) return null

    return { id: user.id, email: user.email, name: user.name, role: user.userType }
  } catch {
    return null
  }
}
