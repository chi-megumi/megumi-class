'use client'

import React from 'react'
import { NavItem } from '../../types/landing'
import { NavAuthActions } from './NavAuthActions'
import { X, Sparkles } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  items: NavItem[]
  activeHref?: string
  onItemClick?: (href: string) => void
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  items,
  activeHref,
  onItemClick,
}) => {
  if (!isOpen) return null

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    onItemClick?.(href)
    onClose()
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-white/95 backdrop-blur-xl shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-pink-100 text-pink-600 font-bold text-base shadow-xs">
                🌸
              </span>
              <span className="font-extrabold text-lg text-slate-800 tracking-tight">
                Megumi<span className="text-pink-600">.Class</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Đóng menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Links */}
          <div className="mt-6 flex flex-col gap-1.5">
            {items.map((item) => {
              const isActive = activeHref === item.href
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item.href)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-pink-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </a>
              )
            })}
          </div>
        </div>

        {/* Auth Actions in Mobile Menu */}
        <div className="pt-6 border-t border-slate-100">
          <div className="mb-4 text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Sparkles size={14} className="text-pink-500" />
            <span>Tham gia học cùng Megumi</span>
          </div>
          <NavAuthActions onActionComplete={onClose} />
        </div>
      </div>
    </div>
  )
}
