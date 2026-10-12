import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormItem from '~/components/form/formItem'
import InputControl from '~/components/form/input/InputControler'
import { Button } from '~/components/button/Button'
import useAuthStore from '~/common/stores/authStore'
import { resetPasswordSchema } from '~/common/schemas'
import OTPController from '~/components/form/input/OTPController'

interface ResetPasswordFormProps {
  email?: string
  onSuccess?: () => void
}

const ResetPasswordForm = ({ email, onSuccess }: ResetPasswordFormProps) => {
  const showLogin = useAuthStore((s) => s.showLogin)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async () => {
    // TODO: call API to reset password
    await new Promise((res) => setTimeout(res, 800))
    onSuccess?.()
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {email && (
        <p className="text-center text-sm text-gray-500">
          Mã OTP đã được gửi đến email <span className="font-semibold text-gray-700">{email}</span>
        </p>
      )}

      {/* OTP */}
      <FormItem label="Mã OTP" error={errors.otp?.message} isRequired>
        <OTPController name="otp" control={control} error={errors.otp?.message} />
      </FormItem>

      {/* New password */}
      <FormItem label="Mật khẩu mới" isRequired>
        <InputControl
          name="newPassword"
          control={control}
          error={errors.newPassword?.message}
          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
          type="password"
          autoComplete="new-password"
        />
      </FormItem>

      {/* Confirm password */}
      <FormItem label="Xác nhận mật khẩu mới" isRequired>
        <InputControl
          name="confirmPassword"
          control={control}
          error={errors.confirmPassword?.message}
          placeholder="Nhập lại mật khẩu mới"
          type="password"
          autoComplete="new-password"
        />
      </FormItem>

      <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        <button
          type="button"
          onClick={showLogin}
          className="text-primary hover:underline font-medium"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </form>
  )
}

export default ResetPasswordForm
