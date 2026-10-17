import React from 'react'
import { CONTACT_INFO } from '../../data/contact'
import { ContactInfo } from './ContactInfo'
import { ContactForm } from './ContactForm'
import { SectionHeader } from '../common/SectionHeader'

export const ContactSection: React.FC = () => {
  return (
    <section
      id="contact"
      className="py-20 sm:py-28 bg-white relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          badge="Tư vấn & Nhập học"
          title="Đăng Ký Học Thử & Nhận Lộ Trình"
          titleHighlight="Hoàn Toàn Miễn Phí"
          description="Đừng để sự e ngại trì hoãn sự tiến bộ của bạn. Hãy gửi tin nhắn ngay hôm nay để nhận bài test năng lực và 01 buổi học trải nghiệm tại lớp Cô Chi (Tiếng Anh & Tiếng Trung)."
        />

        {/* 2 Columns: Contact Info on Left, Form on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-5 flex">
            <ContactInfo contact={CONTACT_INFO} />
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
