'use client'

import React from 'react'
import Portal from '@/components/common/Portal'
import type { ExamData } from '@/modules/teacher/types'

type TestConfirmModalProps = {
  test: ExamData | null
  isLoading?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export default function TestConfirmModal({
  test,
  isLoading = false,
  onCancel,
  onConfirm,
}: TestConfirmModalProps) {
  if (!test || test.isRetakable) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Sẵn sàng làm bài?</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Bạn sắp bắt đầu làm bài <strong>{test.title}</strong>.<br />
            Thời gian giới hạn: <strong>{test.duration} phút</strong>.<br />
            <br />
            <span className="text-red-600 font-medium">
              ⚠️ Lưu ý quan trọng: Một khi đã bắt đầu, đồng hồ sẽ đếm ngược. Nếu bạn thoát ra
              hoặc đóng trang giữa chừng, bài sẽ tự động được nộp với số điểm hiện tại và bạn
              không thể làm lại.
            </span>
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Chưa sẵn sàng
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? 'Đang chuẩn bị...' : 'Bắt đầu ngay'}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
