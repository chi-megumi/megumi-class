'use client'

import React from 'react'
import { StatItem } from '../../types/landing'
import { useCountUp } from '../../hooks/useCountUp'
import {
  Users,
  Trophy,
  Sparkles,
  GraduationCap,
  Clock,
  Heart,
  Award,
  BookCheck,
} from 'lucide-react'

interface StatCardProps {
  stat: StatItem
  isIntersecting: boolean
}

const ICON_MAP = {
  Users,
  Trophy,
  Sparkles,
  GraduationCap,
  Clock,
  Heart,
  Award,
  BookCheck,
}

export const StatCard: React.FC<StatCardProps> = ({ stat, isIntersecting }) => {
  const count = useCountUp({
    end: stat.value,
    durationMs: 1600,
    startWhen: isIntersecting,
  })

  const IconComponent = ICON_MAP[stat.iconName] || Sparkles

  return (
    <div className="group relative p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-50 to-pink-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <IconComponent size={24} className="group-hover:text-pink-600 transition-colors" />
      </div>

      {/* Number Value with count-up */}
      <div className="flex items-baseline gap-0.5">
        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {count.toLocaleString()}
        </span>
        <span className="text-xl sm:text-2xl font-extrabold text-pink-600">
          {stat.suffix}
        </span>
      </div>

      {/* Label */}
      <h3 className="mt-2 text-sm sm:text-base font-bold text-slate-800 leading-snug">
        {stat.label}
      </h3>

      {/* Sublabel */}
      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
        {stat.sublabel}
      </p>
    </div>
  )
}
