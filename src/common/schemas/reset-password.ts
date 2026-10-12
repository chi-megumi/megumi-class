import z from 'zod'

export const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, 'Vui lòng nhập mã OTP hợp lệ'),
    newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
