import React from 'react'
import { CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'
import type { TestResultPayload } from '@/actions/analytics/types'

type TestSummaryProps = {
  result: TestResultPayload
  isRetakable?: boolean
  isRetaking: boolean
  onRetake: () => void
  onViewDetail: () => void
  onClose: () => void
}

export default function TestSummary({ result, isRetakable, isRetaking, onRetake, onViewDetail, onClose }: TestSummaryProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] bg-white rounded-xl p-5 shadow-lg border border-gray-100 max-w-sm mx-auto mt-4 animate-in zoom-in-95 duration-500">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm ${
        (result.score || 0) >= 80 ? 'bg-green-100 text-green-600' : 
        (result.score || 0) >= 50 ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
      }`}>
        {(result.score || 0) >= 80 ? <CheckCircle2 size={30} /> : <AlertCircle size={30} />}
      </div>
      <h2 className="text-xl font-black text-gray-900 mb-1">Kết Quả Bài Thi</h2>
      <div className="text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
        {result.score}/100
      </div>
      <p className="text-gray-600 mb-4 font-medium text-xs sm:text-sm">
        Bạn trả lời đúng {result.correctAnswers}/{result.totalQuestions} câu hỏi.
      </p>
      <div className="flex flex-wrap gap-2.5 justify-center">
        {isRetakable && (
          <button 
            onClick={onRetake}
            disabled={isRetaking}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg shadow-xs transition-all hover:-translate-y-0.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw size={13} className={isRetaking ? 'animate-spin' : ''} />
            <span>{isRetaking ? 'Đang chuẩn bị đề...' : 'Luyện tập lại ngay (Đề xáo trộn)'}</span>
          </button>
        )}
        <button 
          onClick={onViewDetail}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition-all hover:-translate-y-0.5 text-xs"
        >
          Xem chi tiết đáp án
        </button>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-xs transition-all hover:-translate-y-0.5 text-xs"
        >
          Trở về Dashboard
        </button>
      </div>
    </div>
  )
}
