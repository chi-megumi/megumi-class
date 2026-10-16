'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react'
import { deleteClassAction } from '~/actions/class'
import { DeleteClassModalProps } from './types'

export default function DeleteClassModal({ classData, isOpen, onClose }: DeleteClassModalProps) {
  const router = useRouter()
  const [confirmName, setConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const isMatched = confirmName.trim().toLowerCase() === classData.name.trim().toLowerCase()

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMatched) return

    setDeleting(true)
    setErrorMsg(null)

    try {
      const res = await deleteClassAction(classData.id, confirmName)
      if (res.success) {
        onClose()
        router.push('/teacher')
        router.refresh()
      } else {
        setErrorMsg(res.error || 'Không thể xóa lớp học')
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ khi xóa lớp học')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-red-100 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa lớp học</h3>
              <p className="text-xs text-red-500 font-semibold">Hành động này không thể hoàn tác!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Warning text */}
        <div className="text-sm text-gray-600 space-y-2 bg-red-50/60 p-4 rounded-2xl border border-red-100/80">
          <p>
            Tất cả các bài học (units), từ vựng, bài kiểm tra (exams) và kết quả học tập của học sinh
            trong lớp sẽ bị <strong>xóa vĩnh viễn</strong>.
          </p>
          <p className="text-xs text-gray-500">
            Để xác nhận, vui lòng nhập chính xác tên lớp học:{' '}
            <strong className="text-gray-900 select-all font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-gray-200">
              {classData.name}
            </strong>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleDelete} className="space-y-4">
          <div>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => {
                setConfirmName(e.target.value)
                if (errorMsg) setErrorMsg(null)
              }}
              placeholder="Nhập tên lớp học để xác nhận..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400/40 focus:border-red-400"
              autoFocus
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!isMatched || deleting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {deleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Xóa lớp học này
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
