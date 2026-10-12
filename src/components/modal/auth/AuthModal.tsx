'use client'

import { Modal } from '~/components/modal/Modal'
import LoginForm from '~/components/form/login'
import ForgotPasswordForm from '~/components/form/forgot-password'
import ResetPasswordForm from '~/components/form/reset-password'
import useAuthStore, { type AuthModalType } from '~/common/stores/authStore'
import RegisterForm from '~/components/form/register'

export interface AuthModalProps {
  open: boolean
  onClose: () => void
  formType: AuthModalType
}

const getModalTitle = (formType: AuthModalType) => {
  switch (formType) {
    case 'login':
      return 'Đăng nhập'
    case 'register':
      return 'Đăng ký'
    case 'forgot-password':
      return 'Quên mật khẩu'
    case 'reset-password':
      return 'Đặt lại mật khẩu'
  }
}

const AuthModal = ({ open, onClose, formType }: AuthModalProps) => {
  const showResetPassword = useAuthStore((s) => s.showResetPassword)
  const showLogin = useAuthStore((s) => s.showLogin)
  const forgotPasswordEmail = useAuthStore((s) => s.forgotPasswordEmail)

  const renderForm = () => {
    switch (formType) {
      case 'register':
        return <RegisterForm />
      case 'forgot-password':
        return <ForgotPasswordForm onSuccess={(email) => showResetPassword(email)} />
      case 'reset-password':
        return <ResetPasswordForm email={forgotPasswordEmail} onSuccess={showLogin} />
      default:
        return <LoginForm />
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={getModalTitle(formType)}
      hideHeader={false}
    >
      {renderForm()}
    </Modal>
  )
}

export default AuthModal
