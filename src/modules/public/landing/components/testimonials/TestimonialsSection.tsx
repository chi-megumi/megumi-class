import React from 'react'
import { TESTIMONIALS } from '../../data/testimonials'
import { TestimonialMarquee } from './TestimonialMarquee'
import { SectionHeader } from '../common/SectionHeader'
import { StarRating } from '../common/StarRating'
import { Heart } from 'lucide-react'

export const TestimonialsSection: React.FC = () => {
  return (
    <section
      id="testimonials"
      className="py-20 sm:py-28 bg-slate-50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        {/* Section Header */}
        <SectionHeader
          badge="Cảm nhận từ học viên"
          title="Những Bước Tiến Vượt Bậc &"
          titleHighlight="Câu Chuyện Thành Công"
          description="Hạnh phúc lớn nhất của Cô Chi là được nhìn thấy các bạn học viên tự tin cất tiếng nói Tiếng Anh & Tiếng Trung và chạm tay vào ước mơ của mình."
        />

        {/* Overall Trust Score Pill */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-slate-900">4.9</span>
              <StarRating rating={5} size={15} />
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Heart size={14} className="text-rose-500 fill-rose-500" />
              <span>Hơn 1,200+ đánh giá 5 sao</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Marquee Carousel */}
      <TestimonialMarquee testimonials={TESTIMONIALS} />
    </section>
  )
}
