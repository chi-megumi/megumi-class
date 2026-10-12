import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import FormItem from '~/components/form/formItem'
import InputControl from '~/components/form/input/InputControler'
import { Button } from '~/components/button/Button'
import useAuthStore from '~/common/stores/authStore'

const schema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
})

type ForgotPasswordFormValues = z.infer<typeof schema>

interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void
}

const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const showLogin = useAuthStore((s) => s.showLogin)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    // TODO: call API to send OTP to email
    await new Promise((res) => setTimeout(res, 800))
    onSuccess?.(data.email)
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-1 text-center">
        <p className="text-sm text-gray-500">
          Nhập email của bạn. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
        </p>
      </div>

      <FormItem label="Email" isRequired>
        <InputControl
          name="email"
          control={control}
          error={errors.email?.message}
          placeholder="Nhập email của bạn"
          type="email"
          autoComplete="email"
        />
      </FormItem>

      <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Đang gửi...' : 'Gửi mã OTP'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Nhớ ra mật khẩu rồi?{' '}
        <button
          type="button"
          onClick={showLogin}
          className="text-primary hover:underline font-medium"
        >
          Đăng nhập
        </button>
      </div>
    </form>
  )
}

export default ForgotPasswordForm
