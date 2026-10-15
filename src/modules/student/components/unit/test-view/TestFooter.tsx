import React from 'react'
import { Send, RotateCcw } from 'lucide-react'

type TestFooterProps = {
  isReviewMode: boolean
  isMiniChallenge: boolean
  isSubmitting: boolean
  isRetakable?: boolean
  isRetaking: boolean
  onSubmit: () => void
  onRetake: () => void
  onClose: () => void
}

export default function TestFooter({ isReviewMode, isMiniChallenge, isSubmitting, isRetakable, isRetaking, onSubmit, onRetake, onClose }: TestFooterProps) {
  return (
    <div className="p-3 sm:p-3.5 bg-white border-t border-gray-100 flex items-center justify-between shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
      {isReviewMode ? (
        <div className="w-full flex justify-between items-center gap-2">
          <p className="text-gray-500 font-medium text-xs">Bạn đang xem chi tiết bài làm.</p>
          <div className="flex items-center gap-2">
            {isRetakable && (
              <button
                onClick={onRetake}
                disabled={isRetaking}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg shadow-xs transition-all hover:-translate-y-0.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <RotateCcw size={13} className={isRetaking ? 'animate-spin' : ''} />
                <span>{isRetaking ? 'Đang chuẩn bị...' : 'Luyện tập lại (Đề xáo trộn)'}</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-sm transition-all hover:-translate-y-0.5 text-xs"
            >
              Trở về Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-500 font-medium text-[11px] hidden md:block">
            Hệ thống sẽ tự động nộp bài khi hết thời gian.
          </p>
          <div className="flex gap-2.5 w-full md:w-auto">
            <button 
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`flex-1 md:flex-none px-4 py-2 font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-transform hover:-translate-y-0.5 text-xs sm:text-sm ${
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
