import { z } from 'zod'
import FormItem from '~/components/form/formItem'
import InputControl from '~/components/form/input/InputControler'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/button/Button'
import useAuthStore from '~/common/stores/authStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '~/common/schemas'
import { login } from '~/actions/auth'
import { useState } from 'react'

const LoginForm = () => {
  const showRegister = useAuthStore((s) => s.showRegister)
  const showForgotPassword = useAuthStore((s) => s.showForgotPassword)
  const closeModal = useAuthStore((s) => s.closeModal)
  const [serverError, setServerError] = useState('')

  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setServerError('')
    const result = await login(data)
    if (result.error) {
      setServerError(result.error)
    } else {
      closeModal()
      window.location.reload()
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      {serverError && <div className="text-red-500 text-sm text-center">{serverError}</div>}
      <div className="flex flex-col gap-4">
        <FormItem label="Email" isRequired>
          <InputControl
            name="email"
            control={control}
            error={errors.email?.message}
            placeholder="Nhập email của bạn"
          />
        </FormItem>

        <FormItem label="Mật khẩu" isRequired>
          <InputControl
            name="password"
            control={control}
            error={errors.password?.message}
            placeholder="Nhập mật khẩu của bạn"
          />
        </FormItem>
      </div>

      <div className="flex items-center justify-end">
        <Button type="button" variant="link" size="sm" onClick={showForgotPassword}>
          Quên mật khẩu?
        </Button>
      </div>

      <Button type="submit" variant="primary" size="md" fullWidth>
        Đăng nhập
      </Button>

      <div className="text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <Button type="button" variant="link" size="md" onClick={showRegister}>
          Đăng ký ngay
        </Button>
      </div>
    </form>
  )
}

export default LoginForm
