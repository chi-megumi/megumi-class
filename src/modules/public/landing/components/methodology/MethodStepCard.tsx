import React from 'react'
import { MethodStep } from '../../types/landing'
import { Sparkles, Layers, MessageSquareQuote, TrendingUp, CheckCircle2 } from 'lucide-react'

interface MethodStepCardProps {
  step: MethodStep
}

const ICON_MAP = {
  Sparkles,
  Layers,
  MessageSquareQuote,
  TrendingUp,
}

export const MethodStepCard: React.FC<MethodStepCardProps> = ({ step }) => {
  const IconComponent = ICON_MAP[step.iconName] || Sparkles

  return (
    <div className="relative p-6 sm:p-7 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between">
      <div>
        {/* Step Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-50 to-pink-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-xs">
            <IconComponent size={24} />
          </div>
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-900 text-white tracking-widest uppercase">
            BƯỚC {step.stepNumber}
          </span>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-lg font-bold text-slate-900 leading-snug">
          {step.title}
        </h3>
        <span className="text-xs font-bold text-pink-600 uppercase tracking-wide block mt-1">
          {step.subtitle}
        </span>

        {/* Description */}
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Highlights checklist */}
      <div className="mt-6 pt-4 border-t border-slate-100 space-y-1.5">
        {step.highlights.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <CheckCircle2 size={13} className="text-pink-500 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
