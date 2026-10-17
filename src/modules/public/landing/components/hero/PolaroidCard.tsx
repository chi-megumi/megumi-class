'use client'

import React from 'react'
import Image from 'next/image'
import { PolaroidPhoto } from '../../types/landing'

interface PolaroidCardProps {
  photo: PolaroidPhoto
  className?: string
}

export const PolaroidCard: React.FC<PolaroidCardProps> = ({ photo, className = '' }) => {
  return (
    <div
      className={`group relative bg-white p-3 sm:p-4 rounded-lg shadow-xl shadow-slate-900/15 border border-slate-100 transition-all duration-300 hover:scale-105 hover:z-30 hover:shadow-2xl ${className}`}
      style={{
        transform: `rotate(${photo.tiltDeg}deg)`,
      }}
    >
      {/* Decorative Washi Tape on top */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-pink-200/80 backdrop-blur-xs rounded-xs shadow-xs pointer-events-none transform -rotate-2 border-t border-b border-pink-300/60"
        aria-hidden="true"
      />

      {/* Photo Frame */}
      <div className="relative aspect-4/3 w-48 sm:w-56 md:w-64 overflow-hidden rounded-sm bg-slate-100">
        <Image
          src={photo.imageSrc}
          alt={photo.imageAlt}
          fill
          sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {photo.badgeText && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-pink-600 shadow-md backdrop-blur-xs">
            {photo.badgeText}
          </div>
        )}
      </div>

      {/* Polaroid Caption bottom */}
      <div className="pt-3 pb-1 text-center">
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
          {photo.title}
        </h4>
        <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
          {photo.caption}
        </p>
      </div>
    </div>
  )
}
