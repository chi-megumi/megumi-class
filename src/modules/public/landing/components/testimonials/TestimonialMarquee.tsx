'use client'

import React from 'react'
import { TestimonialItem } from '../../types/landing'
import { TestimonialCard } from './TestimonialCard'

interface TestimonialMarqueeProps {
  testimonials: TestimonialItem[]
}

export const TestimonialMarquee: React.FC<TestimonialMarqueeProps> = ({ testimonials }) => {
  // Split into 2 staggered groups
  const half = Math.ceil(testimonials.length / 2)
  const row1 = testimonials.slice(0, half)
  const row2 = testimonials.slice(half)

  // Duplicate for seamless infinite loop
  const row1Items = [...row1, ...row1, ...row1]
  const row2Items = [...row2, ...row2, ...row2]

  return (
    <div className="relative w-full overflow-hidden py-4 select-none">
      {/* Edge gradient mask for smooth fade-in and fade-out */}
      <div
        className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none"
        aria-hidden="true"
      />

      {/* Row 1: Marquee scrolling LEFT */}
      <div className="flex gap-5 mb-5 overflow-hidden group">
        <div className="flex gap-5 shrink-0 animate-marquee-left group-hover:[animation-play-state:paused]">
          {row1Items.map((item, index) => (
            <TestimonialCard
              key={`row1-${item.id}-${index}`}
              testimonial={item}
            />
          ))}
        </div>
      </div>

      {/* Row 2: Marquee scrolling RIGHT (reverse / staggered) */}
      <div className="flex gap-5 overflow-hidden group">
        <div className="flex gap-5 shrink-0 animate-marquee-right group-hover:[animation-play-state:paused]">
          {row2Items.map((item, index) => (
            <TestimonialCard
              key={`row2-${item.id}-${index}`}
              testimonial={item}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
