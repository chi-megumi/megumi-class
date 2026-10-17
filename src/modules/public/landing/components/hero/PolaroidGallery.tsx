'use client'

import React from 'react'
import Image from 'next/image'
import { POLAROID_PHOTOS } from '../../data/hero'
import { PolaroidCard } from './PolaroidCard'
import { FloatingBadge } from '../common/FloatingBadge'
import { Sparkles, Trophy } from 'lucide-react'

export const PolaroidGallery: React.FC = () => {
  const [photoLeft, photoRight] = POLAROID_PHOTOS

  return (
    <div className="relative w-full max-w-2xl mx-auto lg:max-w-none py-8 sm:py-12 sm:px-4">
      {/* Decorative gradient glow behind gallery */}
      <div
        className="absolute -inset-4 bg-gradient-to-tr from-indigo-200/50 via-pink-200/40 to-emerald-100/50 rounded-3xl blur-2xl -z-10"
        aria-hidden="true"
      />

      {/* Main Big Classroom Image */}
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-3xl bg-slate-100 border-4 border-white shadow-2xl shadow-indigo-500/15">
        <Image
          src="/images/landing/classroom-hero.jpg"
          alt="Không gian lớp học tiếng Anh Megumi tươi sáng và ấm cúng"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />

        {/* Subtle gradient vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

        {/* Live Classroom Status Tag */}
        <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-xs font-semibold shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Lớp học trực tiếp & tương tác</span>
        </div>
      </div>

      {/* Overlapping Polaroid 1 - Top Left (Teacher & Student) */}
      {photoLeft && (
        <div className="absolute -top-6 -left-4 sm:-top-8 sm:-left-8 z-20 hidden sm:block">
          <PolaroidCard photo={photoLeft} />
        </div>
      )}

      {/* Overlapping Polaroid 2 - Bottom Right (Students Group High-Five) */}
      {photoRight && (
        <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-8 z-20 hidden sm:block">
          <PolaroidCard photo={photoRight} />
        </div>
      )}

      {/* Floating Trust Badge - Top Right */}
      <div className="absolute -top-3 right-4 sm:right-6 z-30 hidden sm:block">
        <FloatingBadge
          icon={<Trophy size={18} />}
          label="Top 1% Trung Tâm"
          detail="98% học viên đạt mục tiêu"
        />
      </div>

      {/* Floating Trust Badge - Bottom Left */}
      <div className="absolute -bottom-4 left-6 sm:left-8 z-30 hidden sm:block">
        <FloatingBadge
          icon={<Sparkles size={18} />}
          label="Phương pháp Độc quyền"
          detail="Học phản xạ & Flashcard số"
        />
      </div>
    </div>
  )
}
