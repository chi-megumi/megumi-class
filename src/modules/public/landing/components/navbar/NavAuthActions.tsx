'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useUserStore } from '~/providers/UserProvider'

interface NavAuthActionsProps {
  className?: string
  onActionComplete?: () => void
}

export const NavAuthActions: React.FC<NavAuthActionsProps> = ({
  className = '',
  onActionComplete,
}) => {
  const user = useUserStore((s) => s.user)
  const loading = useUserStore((s) => s.loading)
  const isLogined = Boolean(user) && !loading

  if (isLogined && user) {
    return (
      <div className={`flex items-center gap-2 xl:gap-3 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[120px]">{user.name || 'Học viên'}</span>
        </div>

        <Link
          href="/flashcards"
          onClick={onActionComplete}
          className="inline-flex items-center gap-1.5 px-4 xl:px-5 py-2 text-xs xl:text-sm font-bold text-white rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
        >
          <span>Tiếp tục học</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Link
        href="/flashcards"
        onClick={onActionComplete}
        className="inline-flex items-center gap-1.5 px-4 xl:px-5 py-2 text-xs xl:text-sm font-bold text-white rounded-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-0.5 whitespace-nowrap shrink-0"
      >
        <span>Học thử</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  )
}

