import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import FormItem from '~/components/form/formItem'
import InputControl from '~/components/form/input/InputControler'
import { Button } from '~/components/button/Button'
import useAuthStore from '~/common/stores/authStore'
import { resetPasswordSchema, type ResetPasswordFormValues } from '~/common/schemas'
import OTPController from '~/components/form/input/OTPController'
import { resetPasswordWithOtp, sendPasswordResetOtp } from '~/actions/auth'

interface ResetPasswordFormProps {
  email?: string
  onSuccess?: () => void
}

const ResetPasswordForm = ({ email, onSuccess }: ResetPasswordFormProps) => {
  const showLogin = useAuthStore((s) => s.showLogin)
  const showForgotPassword = useAuthStore((s) => s.showForgotPassword)

  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const [resendNotice, setResendNotice] = useState('')

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!email) {
      setServerError('Không tìm thấy thông tin email. Vui lòng quay lại bước nhập email.')
      return
    }

    setServerError('')
    setSuccessMessage('')
    setResendNotice('')

    const res = await resetPasswordWithOtp({
      email,
      otp: data.otp,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    })

    if (res.error) {
      setServerError(res.error)
      return
    }

    setSuccessMessage('Đặt lại mật khẩu thành công! Đang chuyển hướng đến đăng nhập...')
    setTimeout(() => {
      onSuccess?.()
    }, 1500)
  }

  const handleResendOtp = async () => {
    if (!email || countdown > 0 || isResending) return

    setIsResending(true)
    setServerError('')
    setResendNotice('')

    const res = await sendPasswordResetOtp({ email })
    setIsResending(false)

    if (res.error) {
      setServerError(res.error)
    } else {
      setCountdown(60)
      setResendNotice('Mã OTP mới đã được gửi đến email của bạn!')
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      {email ? (
        <div className="text-center text-sm text-gray-500">
          Mã OTP đã được gửi đến <span className="font-semibold text-gray-800">{email}</span>.{' '}
          <button
            type="button"
            onClick={showForgotPassword}
            className="text-primary hover:underline font-medium cursor-pointer"
          >
            Đổi email
          </button>
        </div>
      ) : (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-center text-sm text-yellow-700">
          Chưa có email. Vui lòng{' '}
          <button
            type="button"
            onClick={showForgotPassword}
            className="text-primary font-semibold underline cursor-pointer"
          >
            nhập email tại đây
          </button>
        </div>
      )}

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center text-sm text-red-600">
          {serverError}
        </div>
      )}

      {resendNotice && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center text-sm text-blue-600">
          {resendNotice}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center text-sm text-green-700 font-medium">
          {successMessage}
        </div>
      )}

      {/* OTP */}
      <FormItem label="Mã OTP" error={errors.otp?.message} isRequired>
        <OTPController name="otp" control={control} error={errors.otp?.message} />
      </FormItem>

      <div className="flex justify-end text-xs">
        {countdown > 0 ? (
          <span className="text-gray-400">Gửi lại mã sau {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-primary hover:underline font-medium cursor-pointer"
          >
            {isResending ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
          </button>
        )}
      </div>

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

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        disabled={isSubmitting || !!successMessage}
      >
        {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        <button
          type="button"
          onClick={showLogin}
          className="text-primary hover:underline font-medium cursor-pointer"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </form>
  )
}

export default ResetPasswordForm
