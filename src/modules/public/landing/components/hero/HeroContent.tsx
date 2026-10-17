'use client'

import React from 'react'
import { ArrowRight, MessageCircle, CheckCircle2 } from 'lucide-react'
import { HERO_CONFIG } from '../../data/hero'

export const HeroContent: React.FC = () => {
  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const element = document.querySelector(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
      {/* Category Pill Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-200/80 text-pink-700 text-xs sm:text-sm font-bold shadow-xs mb-6 animate-pulse">
        <span>{HERO_CONFIG.badge}</span>
      </div>

      {/* Main Punchy Heading */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15]">
        <span className="block bg-gradient-to-r from-indigo-600 via-pink-600 to-rose-500 bg-clip-text text-transparent leading-20">
          {HERO_CONFIG.titleHighlight}
        </span>

        <span className="flex flex-col gap-1">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-violet-600">
            {HERO_CONFIG.subtitle}
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
            {HERO_CONFIG.titleRest}
          </span>
        </span>
      </h1>

      {/* Subtitle / Value Proposition */}
      <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
        {HERO_CONFIG.description}
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <a
          href="#contact"
          onClick={(e) => handleScrollTo(e, '#contact')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm sm:text-base text-white bg-gradient-to-r from-indigo-600 via-pink-600 to-rose-500 hover:from-indigo-500 hover:to-rose-400 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/35 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
        >
          <span>{HERO_CONFIG.primaryCtaText}</span>
          <ArrowRight size={18} />
        </a>

        <a
          href="#testimonials"
          onClick={(e) => handleScrollTo(e, '#testimonials')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm sm:text-base text-slate-700 bg-white/90 hover:bg-slate-50 border border-slate-200 shadow-xs hover:text-indigo-600 transition-all duration-200 cursor-pointer"
        >
          <MessageCircle size={17} className="text-pink-500" />
          <span>{HERO_CONFIG.secondaryCtaText}</span>
        </a>
      </div>

      {/* Trust Mini Bullet Highlights */}
      <div className="mt-8 pt-6 border-t border-slate-200/60 w-full flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-600">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span>Dạy cả Tiếng Anh & Tiếng Trung</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
          <span>Lớp kèm sát 6 - 8 bạn hoặc kèm 1:1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={16} className="text-pink-500 shrink-0" />
          <span>Học thử 01 buổi trải nghiệm miễn phí</span>
        </div>
      </div>
    </div>
  )
}
