'use client'

import AuthModal from '~/components/modal/auth/AuthModal'
import { Button } from '../../components/button/Button'
import '~/common/styles/components/AppHeader.scss'
import useAuthStore from '~/common/stores/authStore'

import { useUserStore } from '~/providers/UserProvider'
import Link from 'next/link'

const AppHeader = () => {
  const authModalStatus = useAuthStore((s) => s.authModalStatus)
  const showLogin = useAuthStore((s) => s.showLogin)
  const showRegister = useAuthStore((s) => s.showRegister)
  const closeModal = useAuthStore((s) => s.closeModal)

  const user = useUserStore((s) => s.user)
  const loading = useUserStore((s) => s.loading)
  const isLogined = !!user && !loading

  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          {/* Logo / Brand */}
          <div className="app-header__brand">
            <Link href="/">
              <span className="app-header__logo">✨</span>
              <span className="app-header__name">Megumi</span>
              <span className="app-header__dot" />
              <span className="app-header__tagline">Eng</span>
            </Link>
          </div>

          {/* Center Text */}
          {!isLogined ? (
            <p className="app-header__invite">Đăng nhập để học cùng mình 🌸</p>
          ) : (
            <div className="app-header__invite"></div>
          )}

          {/* CTA */}
          <div className="app-header__cta">
            <div className="app-header__actions">
              {isLogined ? (
                <div className="text-sm font-semibold text-slate-600 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 max-w-[120px] md:max-w-none overflow-hidden text-ellipsis whitespace-nowrap">
                  <span>👋</span> <span className="hidden sm:inline">Xin chào,</span>{' '}
                  {user?.name || 'Bạn'}
                </div>
              ) : (
                <>
                  <Button variant="primary" size="sm" onClick={showLogin}>
                    Đăng nhập
                  </Button>
                  <Button variant="secondary" size="sm" onClick={showRegister}>
                    Đăng ký
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        open={authModalStatus.isOpen}
        formType={authModalStatus.type}
        onClose={closeModal}
      />
    </>
  )
}

export default AppHeader
