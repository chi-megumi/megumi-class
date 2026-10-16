'use client'

import { useState } from 'react'
import { BookOpen, Check, Loader2, User } from 'lucide-react'
import { updateClassInfoAction } from '~/actions/class'
import { GeneralSettingsCardProps, SettingsFeedback } from './types'

export default function GeneralSettingsCard({
  classData,
  onClassUpdated,
}: GeneralSettingsCardProps) {
  const [name, setName] = useState(classData.name)
  const [description, setDescription] = useState(classData.description || '')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<SettingsFeedback>(null)

  const isChanged =
    name.trim() !== classData.name.trim() ||
    description.trim() !== (classData.description || '').trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Tên lớp học không được để trống' })
      return
    }

    setSaving(true)
    setFeedback(null)

    try {
      const res = await updateClassInfoAction(classData.id, {
        name: name.trim(),
        description: description.trim(),
      })

      if (res.success && res.data) {
        setFeedback({ type: 'success', message: 'Đã lưu thông tin lớp học thành công' })
        onClassUpdated?.(res.data)
      } else {
        setFeedback({ type: 'error', message: res.error || 'Có lỗi xảy ra khi lưu' })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Lỗi kết nối máy chủ, vui lòng thử lại' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Thông tin chung</h2>
            <p className="text-sm text-gray-500">Quản lý tên, mô tả và giáo viên phụ trách lớp học</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Class Name */}
        <div>
          <label htmlFor="className" className="block text-sm font-semibold text-gray-700 mb-2">
            Tên lớp học <span className="text-red-500">*</span>
          </label>
          <input
            id="className"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (feedback) setFeedback(null)
            }}
            placeholder="Ví dụ: Tiếng Anh Lớp 9A - Ôn Thi Vào 10"
            className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A5EEB]/30 focus:border-[#6A5EEB] transition-all shadow-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="classDesc" className="block text-sm font-semibold text-gray-700 mb-2">
            Mô tả lớp học
          </label>
          <textarea
            id="classDesc"
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (feedback) setFeedback(null)
            }}
            placeholder="Mô tả ngắn gọn về mục tiêu, lộ trình học tập của lớp..."
            className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-2xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A5EEB]/30 focus:border-[#6A5EEB] transition-all shadow-sm resize-none custom-scrollbar"
          />
        </div>

        {/* Current Teacher Info */}
        {classData.teacher && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {classData.teacher.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={classData.teacher.avatarUrl}
                    alt={classData.teacher.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  classData.teacher.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Giáo viên chủ nhiệm
                </p>
                <p className="text-sm font-bold text-gray-800">{classData.teacher.name}</p>
                <p className="text-xs text-gray-500">{classData.teacher.email}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-indigo-100/60 text-indigo-700 text-xs font-bold rounded-full flex items-center gap-1.5">
              <User size={13} />
              Chủ sở hữu
            </span>
          </div>
        )}

        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-sm font-medium transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                : 'bg-rose-50 border border-rose-100 text-rose-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !isChanged || !name.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-semibold text-sm text-white bg-[#6A5EEB] hover:bg-[#5b4fdb] shadow-[0_4px_15px_rgba(106,94,235,0.25)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check size={16} />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
