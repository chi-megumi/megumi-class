'use client'

import React, { useEffect } from 'react'
import { Navbar } from './navbar/Navbar'
import { HeroSection } from './hero/HeroSection'
import { HighlightsSection } from './highlights/HighlightsSection'
import { TeacherSection } from './teacher/TeacherSection'
import { MethodologySection } from './methodology/MethodologySection'
import { TestimonialsSection } from './testimonials/TestimonialsSection'
import { ContactSection } from './contact/ContactSection'
import { Footer } from './footer/Footer'
import '../styles/LandingPage.scss'

export const LandingPage: React.FC = () => {
  useEffect(() => {
    // Add body class for zero-padding full-width compatibility
    document.body.classList.add('has-megumi-landing')
    return () => {
      document.body.classList.remove('has-megumi-landing')
    }
  }, [])

  return (
    <div className="megumi-landing">
      {/* Sticky Full-width Navigation Bar */}
      <Navbar />

      {/* Hero Section with Classroom Photo & Overlapping Polaroids */}
      <HeroSection />

      {/* Highlights & Animated Stats Counters */}
      <HighlightsSection />

      {/* Teacher Introduction: Cô Chi Portrait & Achievements */}
      <TeacherSection />

      {/* 4-Step Methodology */}
      <MethodologySection />

      {/* Student Testimonials: 2-Row Continuous Marquee */}
      <TestimonialsSection />

      {/* Contact & Free Trial Class Registration Form */}
      <ContactSection />

      {/* Modern Footer */}
      <Footer />
    </div>
  )
}

export default LandingPage
