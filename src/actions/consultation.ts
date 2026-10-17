'use server'

import { z } from 'zod'
import { prisma } from '@/common/libs/prisma'
import { sendConsultationNotificationEmail } from '@/common/libs/mail'

const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/

export const consultationSchema = z.object({
  fullName: z.string().trim().min(1, 'Vui lòng nhập họ và tên của bạn'),
  phone: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập số điện thoại')
    .refine((val) => phoneRegex.test(val.replace(/\s+/g, '')), {
      message: 'Số điện thoại không đúng định dạng (VD: 0988123456)',
    }),
  email: z
    .string()
    .trim()
    .email('Email không hợp lệ')
    .optional()
    .or(z.literal('')),
  course: z.string().trim().min(1, 'Vui lòng chọn khóa học quan tâm'),
  learningGoal: z.string().trim().optional().or(z.literal('')),
})

export type ConsultationInput = z.infer<typeof consultationSchema>

export async function submitConsultation(data: ConsultationInput) {
  try {
    const validated = consultationSchema.parse(data)

    // Save lead to database
    const registration = await prisma.consultationRegistration.create({
      data: {
        fullName: validated.fullName,
        phone: validated.phone,
        email: validated.email || null,
        course: validated.course,
        learningGoal: validated.learningGoal || null,
      },
    })

    // Send email notification to chidoan995.work@gmail.com
    await sendConsultationNotificationEmail({
      fullName: validated.fullName,
      phone: validated.phone,
      email: validated.email || undefined,
      course: validated.course,
      learningGoal: validated.learningGoal || undefined,
    })

    return { success: true, id: registration.id }
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0]?.message || 'Thông tin không hợp lệ' }
    }
    console.error('submitConsultation error:', err)
    return { error: 'Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại sau.' }
  }
}
