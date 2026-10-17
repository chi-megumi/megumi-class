import React from 'react'
import { ContactInfoData } from '../../types/landing'
import { Phone, Mail, MapPin, Clock, ShieldCheck, MessageCircle, ExternalLink } from 'lucide-react'

interface ContactInfoProps {
  contact: ContactInfoData
}

export const ContactInfo: React.FC<ContactInfoProps> = ({ contact }) => {
  return (
    <div className="flex flex-col justify-between h-full bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-10 rounded-3xl shadow-xl">
      <div>
        {/* Top Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-pink-300 text-xs font-bold uppercase tracking-wider mb-6">
          <span>🌸 Megumi Language Class — Song Ngữ Anh Trung</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
          Sẵn Sàng Bắt Đầu Hành Trình Cùng Cô Chi?
        </h3>

        <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
          Hãy để lại thông tin hoặc liên hệ trực tiếp để được xếp lịch kiểm tra trình độ miễn phí và nhận lộ trình học tập tối ưu nhất dành riêng cho bạn.
        </p>

        {/* Contact List */}
        <div className="mt-8 space-y-4">
          {/* Hotline */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/30">
              <Phone size={18} />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Hotline / Zalo tư vấn 24/7</span>
              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="text-base sm:text-lg font-bold text-white hover:text-pink-300 transition-colors"
              >
                {contact.hotlineFormatted}
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <Mail size={18} />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Email giải đáp thắc mắc</span>
              <a
                href={`mailto:${contact.email}`}
                className="text-sm sm:text-base font-semibold text-white hover:text-indigo-300 transition-colors"
              >
                {contact.email}
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <MapPin size={18} />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Địa chỉ lớp học trực tiếp</span>
              <span className="text-sm sm:text-base font-medium text-slate-200">
                {contact.address}
              </span>
            </div>
          </div>

          {/* Working Hours */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Clock size={18} />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Thời gian đón tiếp học viên</span>
              <span className="text-sm sm:text-base font-medium text-slate-200">
                {contact.workingHours}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Guarantee & Direct Links */}
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <ShieldCheck size={16} />
          <span>{contact.responseTime}</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={contact.zaloLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
          >
            <MessageCircle size={14} className="text-blue-400" />
            <span>Chat Zalo</span>
            <ExternalLink size={12} className="opacity-70" />
          </a>
        </div>
      </div>
    </div>
  )
}
