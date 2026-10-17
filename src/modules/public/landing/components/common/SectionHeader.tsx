import React from 'react'

interface SectionHeaderProps {
  badge: string
  title: string
  titleHighlight?: string
  description?: string
  align?: 'center' | 'left'
  className?: string
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  titleHighlight,
  description,
  align = 'center',
  className = '',
}) => {
  const isCentered = align === 'center'

  return (
    <div
      className={`max-w-3xl mb-12 md:mb-16 ${
        isCentered ? 'mx-auto text-center' : 'text-left'
      } ${className}`}
    >
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase shadow-sm bg-gradient-to-r from-indigo-50 to-pink-50 border border-indigo-100/80 text-indigo-700 mb-4 ${
          isCentered ? 'justify-center' : ''
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
        <span>{badge}</span>
      </div>

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
        {title}
        <div>
          {titleHighlight && (
            <span className="bg-gradient-to-r from-indigo-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
              {titleHighlight}
            </span>
          )}
        </div>
      </h2>

      {description && (
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  )
}
