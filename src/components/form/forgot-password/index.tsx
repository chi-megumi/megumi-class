import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormItem from '~/components/form/formItem'
import InputControl from '~/components/form/input/InputControler'
import { Button } from '~/components/button/Button'
import useAuthStore from '~/common/stores/authStore'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '~/common/schemas'
import { sendPasswordResetOtp } from '~/actions/auth'

interface ForgotPasswordFormProps {
  onSuccess?: (email: string) => void
}

const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const showLogin = useAuthStore((s) => s.showLogin)
  const [serverError, setServerError] = useState('')

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError('')
    const res = await sendPasswordResetOtp(data)
    if (res.error) {
      setServerError(res.error)
      return
    }
    onSuccess?.(data.email)
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col gap-1 text-center">
        <p className="text-sm text-gray-500">
          Nhập email của bạn. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center text-sm text-red-600">
          {serverError}
        </div>
      )}

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
          className="text-primary hover:underline font-medium cursor-pointer"
        >
          Đăng nhập
        </button>
      </div>
    </form>
  )
}

export default ForgotPasswordForm
