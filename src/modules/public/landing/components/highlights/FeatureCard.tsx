import React from 'react'
import { FeatureItem } from '../../types/landing'
import { BookOpen, Brain, Flame, Target, Compass, ShieldCheck } from 'lucide-react'

interface FeatureCardProps {
  feature: FeatureItem
}

const ICON_MAP = {
  BookOpen,
  Brain,
  Flame,
  Target,
  Compass,
  ShieldCheck,
}

const COLOR_STYLES = {
  primary: {
    bgLight: 'bg-indigo-50/70',
    border: 'border-indigo-100',
    iconText: 'text-indigo-600',
    iconBg: 'bg-indigo-100/80',
    badge: 'bg-indigo-100 text-indigo-700',
  },
  secondary: {
    bgLight: 'bg-pink-50/70',
    border: 'border-pink-100',
    iconText: 'text-pink-600',
    iconBg: 'bg-pink-100/80',
    badge: 'bg-pink-100 text-pink-700',
  },
  accent: {
    bgLight: 'bg-emerald-50/70',
    border: 'border-emerald-100',
    iconText: 'text-emerald-600',
    iconBg: 'bg-emerald-100/80',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  warning: {
    bgLight: 'bg-amber-50/70',
    border: 'border-amber-100',
    iconText: 'text-amber-600',
    iconBg: 'bg-amber-100/80',
    badge: 'bg-amber-100 text-amber-700',
  },
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
  const IconComponent = ICON_MAP[feature.iconName] || BookOpen
  const color = COLOR_STYLES[feature.colorVariant]

  return (
    <div
      className={`relative p-6 sm:p-8 rounded-2xl bg-white border ${color.border} shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between`}
    >
      <div>
        {/* Top Tag & Icon */}
        <div className="flex items-center justify-between mb-6">
          <div
            className={`w-12 h-12 rounded-xl ${color.iconBg} ${color.iconText} flex items-center justify-center shadow-xs`}
          >
            <IconComponent size={24} />
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${color.badge}`}
          >
            {feature.tag}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          {feature.description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-slate-500">
        <span>Chuẩn đầu ra Megumi Standard</span>
      </div>
    </div>
  )
}
