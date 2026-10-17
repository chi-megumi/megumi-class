'use client'

import React, { useState } from 'react'
import { COURSE_OPTIONS } from '../../data/contact'
import { ContactFormData, ContactFormErrors } from '../../types/landing'
import { Send, CheckCircle2, AlertCircle, Sparkles, RotateCcw } from 'lucide-react'
import { submitConsultation } from '~/actions/consultation'

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    phone: '',
    email: '',
    course: COURSE_OPTIONS[0] || '',
    learningGoal: '',
  })

  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [serverError, setServerError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const validate = (): boolean => {
    const newErrors: ContactFormErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên của bạn'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
      if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
        newErrors.phone = 'Số điện thoại không đúng định dạng (VD: 0988123456)'
      }
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Email không hợp lệ'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error as user types
    if (errors[name as keyof ContactFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setServerError('')

    try {
      const result = await submitConsultation(formData)
      if (result.error) {
        setServerError(result.error)
      } else {
        setIsSubmitted(true)
      }
    } catch {
      setServerError('Có lỗi kết nối xảy ra. Vui lòng thử lại sau hoặc liên hệ Zalo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      course: COURSE_OPTIONS[0] || '',
      learningGoal: '',
    })
    setErrors({})
    setServerError('')
    setIsSubmitted(false)
  }

  if (isSubmitted) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl text-center flex flex-col items-center justify-center min-h-[460px]">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20">
          <CheckCircle2 size={36} />
        </div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          Đăng Ký Thành Công! 🎉
        </h3>

        <p className="mt-3 text-slate-600 text-sm sm:text-base max-w-md leading-relaxed">
          Cảm ơn bạn <span className="font-bold text-slate-900">{formData.fullName}</span> đã quan tâm đến Megumi Class. Cô Chi sẽ trực tiếp liên hệ tư vấn và gửi lịch xếp lớp học thử trong vòng <span className="font-bold text-pink-600">15 phút</span>.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left w-full max-w-sm text-xs space-y-1.5 text-slate-600">
          <div><span className="font-semibold text-slate-700">Khóa học đăng ký:</span> {formData.course}</div>
          <div><span className="font-semibold text-slate-700">Số điện thoại:</span> {formData.phone}</div>
          {formData.email && <div><span className="font-semibold text-slate-700">Email:</span> {formData.email}</div>}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Gửi thông tin cho bạn khác</span>
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Đăng Ký Tư Vấn & Học Thử 0đ</span>
          <Sparkles size={20} className="text-pink-500" />
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
          Điền thông tin bên dưới, Megumi sẽ phản hồi nhanh chóng và bảo mật thông tin 100%.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Họ và tên của bạn <span className="text-pink-600">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Ví dụ: Nguyễn Minh Anh"
            value={formData.fullName}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
              errors.fullName
                ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white'
            }`}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle size={12} />
              <span>{errors.fullName}</span>
            </p>
          )}
        </div>

        {/* Phone & Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Số điện thoại (Zalo) <span className="text-pink-600">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0988 123 456"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                errors.phone
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white'
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email (để nhận giáo trình)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="minhanh@gmail.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                errors.email
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/30'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                <span>{errors.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Interested Course Dropdown */}
        <div>
          <label htmlFor="course" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Khóa học bạn quan tâm
          </label>
          <select
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm text-slate-900 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
          >
            {COURSE_OPTIONS.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Goal & Message */}
        <div>
          <label htmlFor="learningGoal" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Mục tiêu hoặc thắc mắc của bạn
          </label>
          <textarea
            id="learningGoal"
            name="learningGoal"
            rows={3}
            placeholder="Ví dụ: Em muốn ôn thi IELTS 7.0 từ band 5.5, hoặc cần lấy lại gốc tiếng Anh để đi làm..."
            value={formData.learningGoal}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-indigo-600 via-pink-600 to-rose-500 hover:from-indigo-500 hover:to-rose-400 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/35 transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang gửi thông tin...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Gửi Đăng Ký Học Thử Miễn Phí</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
