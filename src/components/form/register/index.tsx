import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { registerSchema, type RegisterFormValues } from '~/common/schemas'
import useAuthStore from '~/common/stores/authStore'
import { Button } from '~/components/button/Button'
import FormItem from '~/components/form/formItem'
import InputControl from '~/components/form/input/InputControler'
import { register } from '~/actions/auth'
import { useState } from 'react'

const RegisterForm = () => {
  const showLogin = useAuthStore((s) => s.showLogin)
  const closeModal = useAuthStore((s) => s.closeModal)
  const [serverError, setServerError] = useState('')

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError('')
    const result = await register(data)
    if (result.error) {
      setServerError(result.error)
    } else {
      closeModal()
      window.location.reload()
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      {serverError && <div className="text-red-500 text-sm text-center">{serverError}</div>}
      <div className="flex flex-col gap-4">
        {/* Email */}
        <FormItem label="Email" isRequired>
          <InputControl
            name="email"
            control={control}
            placeholder="Nhập email"
            error={errors.email?.message}
          />
        </FormItem>

        {/* Password */}
        <FormItem label="Mật khẩu" isRequired>
          <InputControl
            name="password"
            control={control}
            placeholder="Nhập mật khẩu"
            type="password"
            error={errors.password?.message}
          />
        </FormItem>

        {/* Confirm Password */}
        <FormItem label="Xác nhận mật khẩu" isRequired>
          <InputControl
            name="confirmPassword"
            control={control}
            placeholder="Xác nhận mật khẩu"
            type="password"
            error={errors.confirmPassword?.message}
          />
        </FormItem>
      </div>

      <Button type="submit" variant="primary" size="md" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Đang xử lý...' : 'Đăng ký'}
      </Button>

      <div className="text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Button type="button" variant="link" size="md" onClick={showLogin}>
          Đăng nhập ngay
        </Button>
      </div>
    </form>
  )
}
export default RegisterForm
