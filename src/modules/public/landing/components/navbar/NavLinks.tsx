'use client'

import React from 'react'
import { NavItem } from '../../types/landing'

interface NavLinksProps {
  items: NavItem[]
  activeHref?: string
  onItemClick?: (href: string) => void
  className?: string
}

export const NavLinks: React.FC<NavLinksProps> = ({
  items,
  activeHref,
  onItemClick,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    onItemClick?.(href)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className={`flex items-center gap-1 xl:gap-2 ${className}`} aria-label="Main Navigation">
      {items.map((item) => {
        const isActive = activeHref === item.href
        return (
          <a
            key={item.href}
            href={item.href}
            onClick={(e) => handleClick(e, item.href)}
            className={`relative px-2.5 xl:px-3.5 py-1.5 xl:py-2 text-xs xl:text-sm font-semibold rounded-full transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap shrink-0 ${
              isActive
                ? 'text-indigo-600 bg-indigo-50/90 shadow-xs'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100/70'
            }`}
          >
            <span>{item.label}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 text-[9px] xl:text-[10px] font-bold uppercase rounded-full bg-pink-500 text-white leading-none tracking-wider animate-pulse">
                {item.badge}
              </span>
            )}
          </a>
        )
      })}
    </nav>
  )
}
