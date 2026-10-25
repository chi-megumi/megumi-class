'use client'

import React, { useEffect } from 'react'
import { LogOut, Loader2, X } from 'lucide-react'
import Portal from '~/components/common/Portal'

export interface LogoutConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onClose])

  if (!isOpen) return null

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={() => {
          if (!isLoading) onClose()
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-modal-title"
      >
        <div
          className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/80 shadow-xs">
              <LogOut size={22} className="stroke-[2.2]" />
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
              title="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          <h3 id="logout-modal-title" className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Xác nhận đăng xuất
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang đăng xuất...</span>
                </>
              ) : (
                <>
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
