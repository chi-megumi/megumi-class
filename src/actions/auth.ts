'use server'

import { cookies } from 'next/headers'
import { randomInt } from 'crypto'
import { signToken, verifyToken } from '@/common/libs/jwt'
import { prisma } from '@/common/libs/prisma'
import bcrypt from 'bcryptjs'
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '@/common/schemas'
import { sendResetPasswordOtpEmail } from '@/common/libs/mail'
import { z } from 'zod'
import { cache } from 'react'

const resetWithEmailSchema = resetPasswordSchema.and(
  z.object({
    email: z.string().email('Email không hợp lệ'),
  })
)

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
      email: user.email,
      name: user.name,
      role: user.userType,
      systemRole: user.systemRole,
    })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.userType,
        systemRole: user.systemRole,
      },
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
      email: user.email,
      name: user.name,
      role: user.userType,
      systemRole: user.systemRole,
    })

    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.userType,
        systemRole: user.systemRole,
      },
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

const getCachedUser = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      userType: true,
      systemRole: true,
      isActive: true,
    },
  })
})

export async function getMe() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload || !payload.userId) return null

    const user = await getCachedUser(payload.userId as string).catch((err) => {
      console.error('getCachedUser failed:', err)
      return null
    })

    if (!user || !user.isActive) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.userType,
      systemRole: user.systemRole,
    }
  } catch (err: unknown) {
    if ((err as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE') {
      throw err
    }
    console.error('getMe error:', err)
    return null
  }
}

export async function sendPasswordResetOtp(data: { email: string }) {
  try {
    const validated = forgotPasswordSchema.parse(data)

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (!user) {
      return { error: 'Không tìm thấy tài khoản với email này' }
    }

    // Rate limiting: cooldown 60 seconds
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        email: validated.email,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (recentToken) {
      return { error: 'Vui lòng đợi 60 giây trước khi yêu cầu mã OTP mới' }
    }

    // Remove any previous tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: validated.email },
    })

    // Generate 6-digit OTP
    const otp = randomInt(100000, 1000000).toString()
    const otpHash = await bcrypt.hash(otp, 10)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.passwordResetToken.create({
      data: {
        email: validated.email,
        otpHash,
        expiresAt,
      },
    })

    await sendResetPasswordOtpEmail({ to: validated.email, otp })

    return { success: true, email: validated.email }
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0]?.message || 'Email không hợp lệ' }
    }
    console.error('sendPasswordResetOtp error:', err)
    return { error: 'Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại sau.' }
  }
}

export async function resetPasswordWithOtp(data: {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}) {
  try {
    const validated = resetWithEmailSchema.parse(data)

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (!user) {
      return { error: 'Tài khoản không tồn tại' }
    }

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email: validated.email,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!resetToken) {
      return { error: 'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.' }
    }

    if (resetToken.attempts >= 5) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
      return { error: 'Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã mới.' }
    }

    const isValid = await bcrypt.compare(validated.otp, resetToken.otpHash)
    if (!isValid) {
      const updatedAttempts = resetToken.attempts + 1
      await prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { attempts: updatedAttempts },
      })
      const remaining = 5 - updatedAttempts
      return {
        error:
          remaining > 0
            ? `Mã OTP không chính xác. Bạn còn ${remaining} lần thử.`
            : 'Bạn đã nhập sai mã OTP quá 5 lần. Vui lòng yêu cầu mã mới.',
      }
    }

    const newPasswordHash = await bcrypt.hash(validated.newPassword, 10)
    await prisma.user.update({
      where: { email: validated.email },
      data: { passwordHash: newPasswordHash },
    })

    // Delete token once successfully used
    await prisma.passwordResetToken.deleteMany({
      where: { email: validated.email },
    })

    return { success: true }
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0]?.message || 'Dữ liệu không hợp lệ' }
    }
    console.error('resetPasswordWithOtp error:', err)
    return { error: 'Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại.' }
  }
}
