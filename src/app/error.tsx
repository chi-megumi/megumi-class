'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error Boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#F0EDFF] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-pink-100/80 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shadow-sm">
          <AlertTriangle size={32} />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">Đã xảy ra sự cố khi tải trang</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Hệ thống gặp lỗi tạm thời khi tải nội dung này. Bạn có thể nhấn thử lại hoặc quay về trang chủ.
        </p>

        {error.digest && (
          <div className="text-[11px] text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg mb-6 border border-gray-100 truncate">
            Mã lỗi: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Thử lại</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all"
          >
            <Home size={16} />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
