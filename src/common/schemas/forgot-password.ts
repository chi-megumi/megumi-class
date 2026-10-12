import z from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().email('Vui lòng nhập email hợp lệ'),
})
