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
    <div className="relative max-w-md mx-auto lg:max-w-none">
      {/* Ambient background glow */}
      <div
        className="absolute -inset-4 bg-gradient-to-tr from-pink-300/40 via-indigo-300/40 to-rose-200/40 rounded-3xl blur-2xl -z-10"
        aria-hidden="true"
      />

      {/* Outer Gradient Border Wrapper */}
      <div className="relative p-2 rounded-3xl bg-gradient-to-tr from-indigo-500 via-pink-500 to-rose-400 shadow-2xl shadow-pink-500/15">
        <div className="relative aspect-3/4 w-full overflow-hidden rounded-[22px] bg-slate-100">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-top"
          />

          {/* Bottom subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

          {/* Teacher Tag bottom overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-pink-300 block">
                  {role}
                </span>
                <span className="text-base sm:text-lg font-extrabold text-white">
                  {name}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-pink-500/80 flex items-center justify-center text-white">
                <Sparkles size={16} />
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
