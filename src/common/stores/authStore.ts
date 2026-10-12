import { create } from 'zustand'

export type AuthModalType = 'login' | 'register' | 'forgot-password' | 'reset-password'

interface AuthStore {
  authModalStatus: {
    isOpen: boolean
    type: AuthModalType
  }
  forgotPasswordEmail: string

  setAuthModalStatus: (status: { isOpen: boolean; type: AuthModalType }) => void

  showLogin: () => void
  showRegister: () => void
  showForgotPassword: () => void
  showResetPassword: (email: string) => void
  closeModal: () => void
}

const useAuthStore = create<AuthStore>((set) => ({
  authModalStatus: {
    isOpen: false,
    type: 'login',
  },
  forgotPasswordEmail: '',

  setAuthModalStatus: (status) => set({ authModalStatus: status }),

  showLogin: () => set({ authModalStatus: { isOpen: true, type: 'login' } }),
  showRegister: () => set({ authModalStatus: { isOpen: true, type: 'register' } }),
  showForgotPassword: () => set({ authModalStatus: { isOpen: true, type: 'forgot-password' } }),
  showResetPassword: (email) =>
    set({ authModalStatus: { isOpen: true, type: 'reset-password' }, forgotPasswordEmail: email }),
  closeModal: () => set({ authModalStatus: { isOpen: false, type: 'login' } }),
}))

export default useAuthStore
