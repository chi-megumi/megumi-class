import z from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Vui lòng nhập email hợp lệ'),
  password: z.string().min(6, 'Vui lòng nhập mật khẩu'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
