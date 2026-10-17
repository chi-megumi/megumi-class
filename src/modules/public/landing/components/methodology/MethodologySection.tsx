import React from 'react'
import { METHOD_STEPS } from '../../data/methodology'
import { MethodStepCard } from './MethodStepCard'
import { SectionHeader } from '../common/SectionHeader'

export const MethodologySection: React.FC = () => {
  return (
    <section
      id="methodology"
      className="py-20 sm:py-28 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50/60 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          badge="Phương pháp giảng dạy"
          title="Quy Trình 4 Bước Đột Phá"
          titleHighlight="Khả Năng Phản Xạ"
          description="Được thiết kế dựa trên các nguyên lý khoa học thần kinh về ghi nhớ và ứng dụng thực tiễn, giúp người học chuyển từ tiếp nhận thụ động sang phản xạ tự nhiên."
        />

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {METHOD_STEPS.map((step) => (
            <MethodStepCard key={step.stepNumber} step={step} />
          ))}
        </div>
      </div>
    </section>
  )
}
