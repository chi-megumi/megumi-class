import React from 'react'
import { HeroContent } from './HeroContent'
import { PolaroidGallery } from './PolaroidGallery'
import { CherryBlossomParticles } from './CherryBlossomParticles'

export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-pink-50/30 to-white"
    >
      {/* Ambient background glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-pink-300/20 via-indigo-300/20 to-teal-200/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-10 right-10 w-72 h-72 bg-pink-200/30 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Sakura Petals */}
      <CherryBlossomParticles />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-6 xl:col-span-6">
            <HeroContent />
          </div>

          {/* Right Column: Classroom Photo + Overlapping Polaroids */}
          <div className="lg:col-span-6 xl:col-span-6">
            <PolaroidGallery />
          </div>
        </div>
      </div>
    </section>
  )
}
