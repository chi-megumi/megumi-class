'use client'

import React, { useEffect } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Check,
  Send,
  Loader2,
  X,
  ArrowLeft,
} from 'lucide-react'
import Portal from '@/components/common/Portal'
import type { ExamQuestionsStats } from './examStats'

export type SubmitConfirmModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isSubmitting: boolean
  stats: ExamQuestionsStats
  isMiniChallenge?: boolean
}

export default function SubmitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  stats,
  isMiniChallenge = false,
}: SubmitConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  const hasUnanswered = stats.unansweredCount > 0

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
        onClick={() => {
          if (!isSubmitting) onClose()
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 relative my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-start justify-between bg-gradient-to-b from-gray-50/70 to-white">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  hasUnanswered
                    ? 'bg-amber-100 text-amber-600 border border-amber-200/60'
                    : 'bg-emerald-100 text-emerald-600 border border-emerald-200/60'
                }`}
              >
                {hasUnanswered ? (
                  <AlertTriangle size={22} className="stroke-[2.2]" />
                ) : (
                  <CheckCircle2 size={22} className="stroke-[2.2]" />
                )}
              </div>
              <div>
                <h3
                  id="confirm-modal-title"
                  className="text-base sm:text-lg font-bold text-gray-900 leading-tight"
                >
                  Xác nhận nộp bài
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {hasUnanswered
                    ? 'Bạn vẫn còn câu hỏi chưa hoàn thành'
                    : 'Bạn đã hoàn thành tất cả câu hỏi'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Đóng"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-5 space-y-4 max-h-[calc(85vh-140px)] overflow-y-auto custom-scrollbar">
            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-center">
                <span className="text-[11px] font-medium text-slate-500 block mb-0.5">
                  Tổng câu
                </span>
                <span className="text-lg font-black text-slate-800">
                  {stats.totalQuestions}
                </span>
              </div>

              <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-2.5 text-center">
                <span className="text-[11px] font-medium text-emerald-700 block mb-0.5">
                  Đã làm
                </span>
                <span className="text-lg font-black text-emerald-600">
                  {stats.answeredCount}
                </span>
              </div>

              <div
                className={`rounded-xl p-2.5 text-center border ${
                  hasUnanswered
                    ? 'bg-amber-50/90 border-amber-200'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <span
                  className={`text-[11px] font-medium block mb-0.5 ${
                    hasUnanswered ? 'text-amber-800' : 'text-slate-500'
                  }`}
                >
                  Chưa làm
                </span>
                <span
                  className={`text-lg font-black ${
                    hasUnanswered ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {stats.unansweredCount}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-gray-600 mb-1.5">
                <span>Tiến độ bài thi</span>
                <span
                  className={
                    hasUnanswered
                      ? 'text-amber-600 font-bold'
                      : 'text-emerald-600 font-bold'
                  }
                >
                  {stats.completionPercentage}% ({stats.answeredCount}/
                  {stats.totalQuestions})
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    hasUnanswered
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  }`}
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Alert banner */}
            {hasUnanswered ? (
              <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                <AlertTriangle
                  size={18}
                  className="text-amber-600 shrink-0 mt-0.5"
                />
                <div>
                  <span className="font-bold">Lưu ý: </span>
                  Bạn vẫn còn{' '}
                  <span className="font-bold underline text-amber-800">
                    {stats.unansweredCount} câu
                  </span>{' '}
                  chưa điền đáp án. Nếu bạn nộp bài ngay bây giờ, các câu chưa làm
                  sẽ không được tính điểm.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 leading-relaxed">
                <CheckCircle2
                  size={18}
                  className="text-emerald-600 shrink-0 mt-0.5"
                />
                <div>
                  <span className="font-bold">Tuyệt vời! </span>
                  Bạn đã trả lời đầy đủ tất cả câu hỏi trong bài kiểm tra. Hãy bấm{' '}
                  <span className="font-bold">Xác nhận nộp bài</span> để hệ thống
                  chấm điểm ngay.
                </div>
              </div>
            )}

            {/* Section Breakdown (if test has multiple blocks) */}
            {stats.blocksStats.length > 1 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Chi tiết từng phần ({stats.blocksStats.length})
                </div>
                <div className="max-h-28 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
                  {stats.blocksStats.map((b) => (
                    <div
                      key={b.id}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border ${
                        b.isComplete
                          ? 'bg-gray-50 border-gray-100 text-gray-700'
                          : 'bg-amber-50/50 border-amber-200/60 text-amber-900'
                      }`}
                    >
                      <span
                        className="font-medium truncate max-w-[200px]"
                        title={b.title}
                      >
                        {b.title}
                      </span>
                      <span className="font-semibold flex items-center gap-1.5 shrink-0">
                        <span
                          className={
                            b.isComplete
                              ? 'text-gray-500'
                              : 'text-amber-700 font-bold'
                          }
                        >
                          {b.answeredCount}/{b.totalQuestions}
                        </span>
                        {b.isComplete ? (
                          <Check size={13} className="text-emerald-500" />
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1 py-0.2 rounded font-bold">
                            Chưa xong
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-gray-400 text-center">
              Sau khi nộp bài, bạn sẽ không thể chỉnh sửa lại đáp án của lượt thi này.
            </p>
          </div>

          {/* Footer */}
          <div className="p-3.5 sm:p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Tiếp tục làm bài</span>
            </button>
            <button
              type="button"
              onClick={() => onConfirm()}
              disabled={isSubmitting}
              className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-1.5 ${
                isMiniChallenge
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang nộp bài...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận nộp bài</span>
                  <Send size={13} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
