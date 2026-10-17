'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { NAVIGATION_ITEMS } from '../../data/navigation'
import { NavLinks } from './NavLinks'
import { NavAuthActions } from './NavAuthActions'
import { MobileMenu } from './MobileMenu'

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false)
  const [activeHref, setActiveHref] = useState<string>('#hero')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)

      // Simple active link detection
      const sections = ['#hero', '#highlights', '#teacher', '#methodology', '#testimonials', '#contact']
      for (const sectionId of sections) {
        const el = document.querySelector(sectionId)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveHref(sectionId)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'py-3 bg-white/85 backdrop-blur-md shadow-sm border-b border-slate-200/50'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 xl:gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="group flex items-center gap-2.5 text-decoration-none focus:outline-hidden shrink-0"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform duration-200">
                <span className="text-xl">🌸</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Megumi
                  </span>
                  <span className="font-bold text-xs uppercase px-1.5 py-0.5 rounded-sm bg-pink-100 text-pink-700 tracking-wider">
                    Class
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wide uppercase">
                  Lớp học Cô Chi • Anh — Trung
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center justify-center min-w-0">
              <NavLinks
                items={NAVIGATION_ITEMS}
                activeHref={activeHref}
                onItemClick={(href) => setActiveHref(href)}
              />
            </div>

            {/* Desktop Auth Actions */}
            <div className="hidden md:flex items-center gap-2 xl:gap-3 shrink-0">
              <NavAuthActions />
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center gap-2 lg:hidden shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 transition-colors cursor-pointer"
                aria-label="Mở menu điều hướng"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={NAVIGATION_ITEMS}
        activeHref={activeHref}
        onItemClick={(href) => setActiveHref(href)}
      />
    </>
  )
}
