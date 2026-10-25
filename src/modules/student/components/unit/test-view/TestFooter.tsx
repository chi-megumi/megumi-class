import React from 'react'
import { Send, RotateCcw, Check, Trophy } from 'lucide-react'

type TestFooterProps = {
  isReviewMode: boolean
  isMiniChallenge: boolean
  isSubmitting: boolean
  isRetakable?: boolean
  isRetaking: boolean
  onSubmit: () => void
  onRetake: () => void
  onClose: () => void
  onViewSummary?: () => void
  lastSavedAt?: string | null
}

function formatSavedTime(isoStr?: string | null): string {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    const s = d.getSeconds().toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  } catch {
    return ''
  }
}

export default function TestFooter({
  isReviewMode,
  isMiniChallenge,
  isSubmitting,
  isRetakable,
  isRetaking,
  onSubmit,
  onRetake,
  onClose,
  onViewSummary,
  lastSavedAt,
}: TestFooterProps) {
  const formattedSavedTime = formatSavedTime(lastSavedAt)

  return (
    <div className="p-3 sm:p-3.5 bg-white border-t border-gray-100 flex items-center justify-between shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
      {isReviewMode ? (
        <div className="w-full flex justify-between items-center gap-2">
          <p className="text-gray-500 font-medium text-xs">Bạn đang xem chi tiết bài làm.</p>
          <div className="flex items-center gap-2">
            {onViewSummary && (
              <button
                type="button"
                onClick={onViewSummary}
                className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 shadow-2xs transition-all hover:-translate-y-0.5 text-xs flex items-center gap-1.5"
                title="Quay lại bảng điểm tổng kết"
              >
                <Trophy size={13} className="text-indigo-600" />
                <span>Bảng điểm</span>
              </button>
            )}
            {isRetakable && (
              <button
                type="button"
                onClick={onRetake}
                disabled={isRetaking}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg shadow-xs transition-all hover:-translate-y-0.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw size={13} className={isRetaking ? 'animate-spin' : ''} />
                <span>{isRetaking ? 'Đang chuẩn bị...' : 'Luyện tập lại (Đề xáo trộn)'}</span>
              </button>
            )}
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-sm transition-all hover:-translate-y-0.5 text-xs"
            >
              Trở về Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-gray-500 font-medium text-[11px] hidden md:block">
              Hệ thống sẽ tự động nộp bài khi hết thời gian.
            </p>
            {formattedSavedTime && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shrink-0">
                <Check size={11} className="stroke-[2.5]" />
                Đã tự động lưu ({formattedSavedTime})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`flex-1 sm:flex-none px-4 py-2 font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-transform hover:-translate-y-0.5 text-xs sm:text-sm ${
                isMiniChallenge ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              } disabled:opacity-50 disabled:hover:translate-y-0`}
            >
              {isSubmitting ? 'Đang nộp bài...' : (
                <>
                  Nộp bài ngay <Send size={14} />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
