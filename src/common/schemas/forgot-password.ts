import z from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Vui lòng nhập email hợp lệ'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
