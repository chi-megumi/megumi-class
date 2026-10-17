import React from 'react'
import Image from 'next/image'
import { Award, Sparkles } from 'lucide-react'
import { FloatingBadge } from '../common/FloatingBadge'

interface TeacherPortraitProps {
  name: string
  role: string
  imageSrc: string
  imageAlt: string
}

export const TeacherPortrait: React.FC<TeacherPortraitProps> = ({
  name,
  role,
  imageSrc,
  imageAlt,
}) => {
  return (
    <div className="relative w-full mx-auto">
      {/* Ambient background glow */}
      <div
        className="absolute -inset-4 bg-gradient-to-tr from-pink-300/40 via-indigo-300/40 to-rose-200/40 rounded-3xl blur-2xl -z-10"
        aria-hidden="true"
      />

      {/* Outer Gradient Border Wrapper */}
      <div className="relative p-2.5 sm:p-3 rounded-3xl sm:rounded-[32px] bg-gradient-to-tr from-indigo-500 via-pink-500 to-rose-400 shadow-2xl shadow-pink-500/20 w-full">
        <div className="relative w-full h-[72vh] sm:h-[80vh] lg:h-[84vh] min-h-[580px] max-h-[820px] overflow-hidden rounded-[24px] sm:rounded-[26px] bg-slate-100">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover object-top"
          />

          {/* Bottom subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/65 via-slate-900/20 to-transparent pointer-events-none" />

          {/* Teacher Tag bottom overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 text-white p-3.5 sm:p-4 rounded-2xl bg-slate-900/65 backdrop-blur-md border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-pink-300 block">
                  {role}
                </span>
                <span className="text-base sm:text-xl font-extrabold text-white">{name}</span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md">
                <Sparkles size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Experience Badge */}
      <div className="absolute -top-4 -right-2 sm:-right-4 z-20">
        <FloatingBadge
          icon={<Award size={18} />}
          label="Song Ngữ Anh — Trung"
          detail="HSK 5 (273/300) & IELTS C1"
        />
      </div>
    </div>
  )
}
