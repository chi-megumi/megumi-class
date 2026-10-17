import React from 'react'

interface FloatingBadgeProps {
  icon?: React.ReactNode
  label: string
  detail?: string
  className?: string
}

export const FloatingBadge: React.FC<FloatingBadgeProps> = ({
  icon,
  label,
  detail,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md border border-white/60 shadow-lg shadow-indigo-500/10 ${className}`}
    >
      {icon && (
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 text-white shadow-sm">
          {icon}
        </div>
      )}
      <div className="flex flex-col text-left">
        <span className="text-xs font-bold text-slate-800 leading-tight">
          {label}
        </span>
        {detail && (
          <span className="text-[11px] font-medium text-slate-500 leading-tight">
            {detail}
          </span>
        )}
      </div>
    </div>
  )
}
