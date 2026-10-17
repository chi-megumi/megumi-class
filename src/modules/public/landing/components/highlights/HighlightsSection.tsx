'use client'

import React from 'react'
import { STATS_ITEMS, HIGHLIGHT_FEATURES } from '../../data/highlights'
import { StatCard } from './StatCard'
import { FeatureCard } from './FeatureCard'
import { SectionHeader } from '../common/SectionHeader'
import { useIntersection } from '../../hooks/useIntersection'

export const HighlightsSection: React.FC = () => {
  const [sectionRef, isIntersecting] = useIntersection<HTMLElement>({
    threshold: 0.1,
  })

  return (
    <section
      id="highlights"
      ref={sectionRef}
      className="py-20 sm:py-28 bg-slate-50/60 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          badge="Con số & Điểm khác biệt"
          title="Vì Sao Hơn 1,200+ Học Viên Chọn"
          titleHighlight="Megumi Class?"
          description="Sự kết hợp giữa chuyên môn Biên - Phiên dịch của Cô Chi, giáo trình song ngữ cá nhân hóa và nền tảng flashcards thông minh mang lại hiệu quả thực chứng vượt trội."
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {STATS_ITEMS.map((stat) => (
            <StatCard
              key={stat.id}
              stat={stat}
              isIntersecting={isIntersecting}
            />
          ))}
        </div>

        {/* Core Strengths Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {HIGHLIGHT_FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
