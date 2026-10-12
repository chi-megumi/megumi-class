import z from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Vui lòng nhập email hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
