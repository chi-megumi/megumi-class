'use client'

import React, { useState } from 'react'
import { Button } from '~/components/button/Button'
import '~/common/styles/components/Sidebar.scss'
import { logout } from '~/actions/auth'
import MenuTabs from '~/components/menu/MenuTabs'
import { ArrowRight, KeyRound, Loader2 } from 'lucide-react'
import { useUserStore } from '~/providers/UserProvider'
import { requestJoinClass } from '~/actions/class'

export interface SideBarProps {
  position?: 'left' | 'right'
}

const SideBar: React.FC<SideBarProps> = ({ position = 'left' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isRight = position === 'right'
  const user = useUserStore((s) => s.user)
  const isTeacher = user?.role === 'teacher' || user?.role === 'TEACHER'

  const [inviteCode, setInviteCode] = useState('')
  const [loadingJoin, setLoadingJoin] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  const onLogout = async () => {
    await logout()
    window.location.reload()
  }

  const handleJoinClass = async () => {
    if (!inviteCode.trim()) return
    setLoadingJoin(true)
    setMessage({ text: '', type: '' })
    try {
      const res = await requestJoinClass(inviteCode)
      setMessage({ text: res.message, type: 'success' })
      setInviteCode('')
      setTimeout(() => setMessage({ text: '', type: '' }), 5000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra'
      setMessage({ text: errorMessage, type: 'error' })
      setTimeout(() => setMessage({ text: '', type: '' }), 5000)
    } finally {
      setLoadingJoin(false)
    }
  }

  return (
    <div className={`sidebar-wrapper ${isRight ? 'is-right' : ''}`}>
      <button
        className={`mobile-menu-toggle ${isSidebarOpen ? 'is-active' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'is-visible' : ''}`}
        onClick={closeSidebar}
      />

      <div
        className={`sidebar-container w-62.5 fixed top-1/2 -translate-y-1/2 ${
          isRight ? 'right-4' : 'left-4'
        } z-50 rounded-2xl ${isSidebarOpen ? 'is-open' : ''}`}
      >
        <div
          className={[
            'shadow-[0_4px_15px_rgba(99,102,241,0.2)] h-[calc(100vh-100px)] rounded-2xl p-4 flex flex-col backdrop-blur-md backdrop-saturate-180',
            isSidebarOpen ? 'bg-white' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div>
            <MenuTabs onNavigate={closeSidebar} />
          </div>

          <div className="mt-auto">
            {!isTeacher && (
              <div className="mb-4 p-3 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 rounded-2xl border border-indigo-100/50 shadow-[0_2px_10px_rgba(99,102,241,0.05)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-bl-full -z-0 group-hover:scale-150 transition-transform duration-500"></div>
                <h3 className="text-sm font-semibold text-indigo-900 mb-2.5 flex items-center gap-2 relative z-10">
                  <span className="bg-indigo-500/10 p-1 rounded-md text-indigo-500">
                    <KeyRound size={14} />
                  </span>
                  Tham gia lớp học
                </h3>
                <div className="relative z-10 flex items-center">
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleJoinClass()
                    }}
                    placeholder="Nhập mã tham gia..."
                    className="w-full text-sm bg-white/80 focus:bg-white pl-3 pr-10 py-2.5 rounded-xl border border-indigo-100 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400 font-medium text-gray-700 shadow-sm"
                  />
                  <button
                    onClick={handleJoinClass}
                    disabled={loadingJoin}
                    className="absolute right-1.5 top-1.5 bottom-1.5 w-8 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-sm"
                  >
                    {loadingJoin ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ArrowRight size={14} />
                    )}
                  </button>
                </div>
                {message.text && (
                  <p
                    className={`mt-2 text-xs font-medium relative z-10 ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}
                  >
                    {message.text}
                  </p>
                )}
              </div>
            )}

            <Button variant="primary" size="sm" onClick={onLogout} fullWidth>
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideBar
