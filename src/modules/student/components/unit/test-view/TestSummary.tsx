'use client'

import React, { useState } from 'react'
import { CheckCircle2, AlertCircle, RotateCcw, Clock, Calendar, History, Trophy, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react'
import type { TestResultPayload } from '@/actions/analytics/types'
import { formatDuration } from '@/actions/analytics/history-utils'

type TestSummaryProps = {
  result: TestResultPayload
  isRetakable?: boolean
  isRetaking: boolean
  onRetake: () => void
  onViewDetail: (attemptNumber?: number) => void
  onClose: () => void
}

export default function TestSummary({
  result,
  isRetakable,
  isRetaking,
  onRetake,
  onViewDetail,
  onClose,
}: TestSummaryProps) {
  const [showHistory, setShowHistory] = useState(false)

  const history = result.history || []
  const hasHistory = history.length > 1
  const bestScore = result.bestScore ?? Math.max(...(history.map(h => h.score)), result.score ?? 0)

  const formatDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return '--'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return '--'
    }
  }

  const formatTime = (dateStr?: string | Date | null) => {
    if (!dateStr) return '--'
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return '--'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-6 shadow-xl border border-gray-100 max-w-lg mx-auto my-2 sm:my-4 animate-in zoom-in-95 duration-500 w-full shrink-0">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm ${
          (result.score || 0) >= 80
            ? 'bg-green-100 text-green-600'
            : (result.score || 0) >= 50
              ? 'bg-orange-100 text-orange-600'
              : 'bg-red-100 text-red-600'
        }`}
      >
        {(result.score || 0) >= 80 ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
      </div>

      <h2 className="text-xl font-black text-gray-900 mb-1">Kết Quả Bài Thi</h2>
      <div className="text-4xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
        {result.score}/100
      </div>

      {bestScore > (result.score || 0) && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold mb-2">
          <Trophy size={13} className="text-amber-600" />
          <span>Điểm cao nhất đã đạt: {bestScore}đ</span>
        </div>
      )}

      <p className="text-gray-600 mb-4 font-medium text-xs sm:text-sm text-center">
        Bạn trả lời đúng <span className="font-bold text-gray-900">{result.correctAnswers}</span>/{result.totalQuestions} câu hỏi.
      </p>

      {/* Quick stats pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 w-full text-xs">
        {result.durationSeconds != null && result.durationSeconds > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg">
            <Clock size={13} className="text-indigo-500" />
            <span>Thời gian: <strong>{formatDuration(result.durationSeconds)}</strong></span>
          </div>
        )}
        {(result.completedAt || result.submittedAt) && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg">
            <Calendar size={13} className="text-indigo-500" />
            <span>
              Nộp: <strong>{formatTime(result.completedAt || result.submittedAt)} • {formatDate(result.completedAt || result.submittedAt)}</strong>
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg font-medium">
          <History size={13} className="text-indigo-600" />
          <span>Đã làm: <strong>{history.length || result.attemptCount || 1} lần</strong></span>
        </div>
      </div>

      {/* History collapsible list if multiple attempts */}
      {hasHistory && (
        <div className="w-full mb-4 border border-gray-200 rounded-xl overflow-hidden bg-gray-50/60">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-bold text-gray-700 hover:bg-gray-100/80 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <History size={14} className="text-indigo-600" />
              <span>Xem lịch sử {history.length} lần làm bài</span>
            </span>
            {showHistory ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showHistory && (
            <div className="p-3 space-y-2 border-t border-gray-200 bg-white max-h-64 overflow-y-auto custom-scrollbar">
              {history.map((entry) => {
                const isCurrent = entry.attempt === (history[history.length - 1]?.attempt)
                const isHighest = entry.score === bestScore
                return (
                  <div
                    key={entry.attempt}
                    onClick={() => onViewDetail(entry.attempt)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-xs flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 cursor-pointer transition-all hover:shadow-2xs group ${
                      isCurrent
                        ? 'border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50/80'
                        : 'border-gray-200 bg-gray-50/40 hover:bg-gray-100/70 hover:border-gray-300'
                    }`}
                    title="Bấm để xem chi tiết câu hỏi và đáp án của lượt thi này"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">Lượt #{entry.attempt}</span>
                      {isHighest && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Cao nhất
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          Vừa nộp
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-gray-600 ml-auto sm:ml-0">
                      <span className="font-extrabold text-indigo-700 text-xs sm:text-sm">{entry.score}đ</span>
                      <span className="text-[11px] text-gray-500">
                        {entry.correctAnswers ?? 0}/{entry.totalQuestions ?? 0} câu
                      </span>
                      {entry.durationSeconds && (
                        <span className="text-[11px] text-gray-500 hidden sm:flex items-center gap-1">
                          <Clock size={11} /> {formatDuration(entry.durationSeconds)}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400 hidden sm:inline">
                        {formatTime(entry.completedAt)} • {formatDate(entry.completedAt)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewDetail(entry.attempt)
                        }}
                        className="text-[11px] font-bold text-indigo-600 bg-white group-hover:bg-indigo-600 group-hover:text-white px-2 py-1 rounded-md border border-indigo-200 group-hover:border-indigo-600 transition-colors flex items-center gap-0.5 shrink-0"
                      >
                        <span>Xem đáp án</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2.5 justify-center w-full">
        {isRetakable && (
          <button
            type="button"
            onClick={onRetake}
            disabled={isRetaking}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg shadow-xs transition-all hover:-translate-y-0.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <RotateCcw size={13} className={isRetaking ? 'animate-spin' : ''} />
            <span>{isRetaking ? 'Đang chuẩn bị đề...' : 'Luyện tập lại ngay (Đề xáo trộn)'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onViewDetail()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition-all hover:-translate-y-0.5 text-xs"
        >
          Xem chi tiết đáp án
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-xs transition-all hover:-translate-y-0.5 text-xs"
        >
          Trở về Dashboard
        </button>
      </div>
    </div>
  )
}
