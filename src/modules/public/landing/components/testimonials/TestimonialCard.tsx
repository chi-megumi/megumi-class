import React from 'react'
import { TestimonialItem } from '../../types/landing'
import { StarRating } from '../common/StarRating'
import { CheckCircle2 } from 'lucide-react'

interface TestimonialCardProps {
  testimonial: TestimonialItem
  className?: string
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  className = '',
}) => {
  return (
    <div
      className={`w-[320px] sm:w-[360px] md:w-[390px] shrink-0 p-5 sm:p-6 bg-white rounded-[6px] border border-slate-200 shadow-xs hover:shadow-lg hover:border-pink-300/80 transition-all duration-300 flex flex-col justify-between select-none ${className}`}
    >
      <div>
        {/* Top: Star Rating & Verified Tag */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <StarRating rating={testimonial.rating} size={15} />
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-[4px]">
            <CheckCircle2 size={12} />
            <span>Học viên chính thức</span>
          </div>
        </div>

        {/* Middle: Testimonial Quote */}
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed line-clamp-4 font-normal">
          &ldquo;{testimonial.content}&rdquo;
        </p>
      </div>

      {/* Bottom: Avatar + Name + School / Achievement */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with gradient initials */}
          <div
            className={`w-10 h-10 rounded-[6px] bg-gradient-to-tr ${testimonial.avatarColor} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}
          >
            {testimonial.avatarInitials}
          </div>

          <div className="min-w-0 flex flex-col">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {testimonial.name}
            </h4>
            <span className="text-[11px] text-slate-500 truncate">
              {testimonial.role}
            </span>
          </div>
        </div>

        {/* Achievement Pill */}
        <div className="shrink-0 text-right">
          <span className="inline-block px-2 py-1 rounded-[4px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px] sm:text-[11px] whitespace-nowrap">
            {testimonial.achievement}
          </span>
        </div>
      </div>
    </div>
  )
}
