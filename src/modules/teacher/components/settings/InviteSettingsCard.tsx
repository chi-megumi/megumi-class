'use client'

import { useState } from 'react'
import { Copy, Check, RefreshCw, KeyRound, Share2, Loader2 } from 'lucide-react'
import { regenerateInviteCodeAction } from '~/actions/class'
import { InviteSettingsCardProps } from './types'

export default function InviteSettingsCard({
  classId,
  inviteCode,
  onCodeRegenerated,
}: InviteSettingsCardProps) {
  const [currentCode, setCurrentCode] = useState(inviteCode || '')
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const joinLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join?code=${currentCode}`
      : `/join?code=${currentCode}`

  const handleCopyCode = async () => {
    if (!currentCode) return
    try {
      await navigator.clipboard.writeText(currentCode)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleCopyLink = async () => {
    if (!currentCode) return
    try {
      await navigator.clipboard.writeText(joinLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleRegenerateCode = async () => {
    const confirmed = window.confirm(
      'Bạn có chắc chắn muốn tạo mã mời mới? Mã cũ sẽ mất hiệu lực và học sinh chưa vào lớp sẽ không thể dùng mã cũ nữa.',
    )
    if (!confirmed) return

    setRegenerating(true)
    setErrorMsg(null)

    try {
      const res = await regenerateInviteCodeAction(classId)
      if (res.success && res.data?.inviteCode) {
        setCurrentCode(res.data.inviteCode)
        onCodeRegenerated?.(res.data.inviteCode)
      } else {
        setErrorMsg(res.error || 'Không thể tạo mã mời mới')
      }
    } catch {
      setErrorMsg('Lỗi kết nối khi tạo mã mời mới')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <KeyRound size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Mã mời & Tham gia lớp</h2>
            <p className="text-sm text-gray-500">
              Chia sẻ mã hoặc liên kết để học sinh tự gửi yêu cầu tham gia lớp
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Invite Code Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-purple-50/70 border border-indigo-100/70 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Mã tham gia lớp
            </span>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-3xl font-black text-indigo-900 tracking-widest font-mono">
                {currentCode || 'CHƯA CÓ'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-indigo-600 font-semibold text-xs rounded-xl border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all active:scale-95"
              >
                {copiedCode ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-600">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Sao chép mã</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-indigo-700/80">
            Học sinh nhập mã này tại trang chủ để xin tham gia lớp học.
          </p>
        </div>

        {/* Shareable Link Box */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Liên kết tham gia trực tiếp
            </span>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={joinLink}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 truncate font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-white text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 hover:bg-gray-100 shadow-sm transition-all active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-600">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span>Sao chép link</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Gửi đường link này vào nhóm chat (Zalo/Facebook) để học sinh vào nhanh.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Regenerate Action */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-400">
          * Đổi mã mới nếu mã hiện tại bị lộ cho người ngoài lớp học.
        </p>
        <button
          type="button"
          onClick={handleRegenerateCode}
          disabled={regenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all active:scale-95 disabled:opacity-50"
        >
          {regenerating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Đang tạo mã mới...
            </>
          ) : (
            <>
              <RefreshCw size={14} />
              Tạo mã mới
            </>
          )}
        </button>
      </div>
    </div>
  )
}
