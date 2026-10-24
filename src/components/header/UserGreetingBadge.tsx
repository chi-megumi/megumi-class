'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X, Loader2 } from 'lucide-react'
import { useUserStore } from '~/providers/UserProvider'
import { updateUserName } from '~/actions/auth'

export const UserGreetingBadge: React.FC = () => {
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const updateName = useUserStore((s) => s.updateName)

  const [isEditing, setIsEditing] = useState(false)
  const [nameInput, setNameInput] = useState(user?.name || '')
  const [prevUserName, setPrevUserName] = useState(user?.name)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSavedToast, setShowSavedToast] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep input in sync when user changes and not editing
  if (user?.name !== prevUserName) {
    setPrevUserName(user?.name)
    if (!isEditing && user?.name) {
      setNameInput(user.name)
    }
  }

  // Focus and select input on entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  // Click outside to cancel edit mode
  useEffect(() => {
    if (!isEditing) return

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (!isSaving) {
          setIsEditing(false)
          setError('')
          setNameInput(user?.name || '')
        }
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [isEditing, isSaving, user?.name])

  const handleStartEdit = () => {
    setNameInput(user?.name || '')
    setError('')
    setIsEditing(true)
  }

  const handleCancel = () => {
    setNameInput(user?.name || '')
    setIsEditing(false)
    setError('')
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const trimmed = nameInput.trim()
    if (!trimmed) {
      setError('Tên không được để trống')
      inputRef.current?.focus()
      return
    }

    if (trimmed.length > 50) {
      setError('Tên không được vượt quá 50 ký tự')
      return
    }

    // If unchanged, just close
    if (trimmed === user?.name) {
      setIsEditing(false)
      setError('')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const res = await updateUserName(trimmed)
      if (res.error) {
        setError(res.error)
        setIsSaving(false)
        return
      }

      if (res.success && res.user) {
        updateName(res.user.name)
        setIsEditing(false)
        setIsSaving(false)
        setShowSavedToast(true)
        setTimeout(() => setShowSavedToast(false), 2500)
        router.refresh()
      }
    } catch {
      setError('Có lỗi xảy ra khi lưu tên. Vui lòng thử lại.')
      setIsSaving(false)
    }
  }

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        className="relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-indigo-400 ring-3 ring-indigo-100 shadow-sm text-sm font-semibold text-slate-700 transition-all"
      >
        <span className="shrink-0 select-none">👋</span>
        <span className="hidden sm:inline text-slate-500 font-medium">Xin chào,</span>
        <form onSubmit={handleSave} className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value)
              if (error) setError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSave()
              } else if (e.key === 'Escape') {
                e.preventDefault()
                handleCancel()
              }
            }}
            disabled={isSaving}
            maxLength={50}
            placeholder="Nhập tên..."
            className="w-28 sm:w-36 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none rounded-md px-2 py-0.5 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={isSaving}
            title="Lưu (Enter)"
            className="p-1 rounded-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 size={13} className="animate-spin text-indigo-600" />
            ) : (
              <Check size={13} strokeWidth={2.5} />
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            title="Hủy (Esc)"
            className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            <X size={13} strokeWidth={2.5} />
          </button>
        </form>
        {error && (
          <div className="absolute top-full right-0 mt-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold shadow-md z-50 whitespace-nowrap animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-100/90 rounded-full border border-slate-200 shadow-xs text-sm font-semibold text-slate-700 transition-all"
    >
      <span className="shrink-0 select-none">👋</span>
      <span className="hidden sm:inline text-slate-500 font-medium">Xin chào,</span>
      <button
        type="button"
        onClick={handleStartEdit}
        className="group/name flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors text-left font-bold"
        title="Nhấn để đổi tên"
      >
        <span className="max-w-[120px] sm:max-w-[180px] md:max-w-xs truncate">
          {user?.name || 'Bạn'}
        </span>
        <Pencil
          size={12}
          className="text-slate-400 group-hover/name:text-indigo-600 group-hover/name:scale-110 transition-all shrink-0"
          aria-hidden="true"
        />
      </button>
      {showSavedToast && (
        <span className="text-xs text-emerald-600 font-medium ml-0.5 flex items-center gap-0.5 animate-in fade-in">
          <Check size={12} strokeWidth={2.5} /> Đã lưu
        </span>
      )}
    </div>
  )
}

export default UserGreetingBadge
