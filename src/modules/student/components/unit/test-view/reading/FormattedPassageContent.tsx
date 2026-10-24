'use client'

import React, { useMemo } from 'react'

type FormattedPassageContentProps = {
  text: string
  fontSize?: 'normal' | 'large'
}

export default function FormattedPassageContent({
  text,
  fontSize = 'normal',
}: FormattedPassageContentProps) {
  const paragraphs = useMemo(() => {
    return text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
  }, [text])

  if (paragraphs.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 italic bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-xs">
        Chưa có nội dung bài đọc.
      </div>
    )
  }

  // Phân tích từng dòng văn bản để highlight (1)____ và [A], [B], [C], [D] và Paragraph A:
  const renderParagraphWithTokens = (p: string) => {
    const regex = /(\(\d+\)_{2,}|\(\d+\)\s*_{2,}|\[[A-D]\]|^Paragraph\s+[A-Z0-9]:)/g
    const parts = p.split(regex)

    return parts.map((part, idx) => {
      if (!part) return null

      // Khớp đục lỗ: (1)______
      if (/^\(\d+\)_{2,}/.test(part) || /^\(\d+\)\s*_{2,}/.test(part)) {
        const numMatch = part.match(/\d+/)
        const blankNum = numMatch ? numMatch[0] : ''
        return (
          <span
            key={idx}
            className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs shadow-2xs select-none"
            title={`Vị trí khuyết số (${blankNum})`}
          >
            <span>({blankNum})</span>
            <span className="tracking-widest">_____</span>
          </span>
        )
      }

      // Khớp vị trí chèn câu [A], [B], [C], [D]
      if (/^\[[A-D]\]$/.test(part)) {
        return (
          <span
            key={idx}
            className="inline-flex items-center justify-center min-w-5 h-5 px-1 mx-1 rounded-md bg-purple-100/90 border border-purple-300 text-purple-900 font-black text-xs shadow-2xs select-none"
            title={`Vị trí chèn câu ${part}`}
          >
            {part}
          </span>
        )
      }

      // Khớp Paragraph A:, Paragraph 1:
      if (/^Paragraph\s+[A-Z0-9]:/i.test(part)) {
        return (
          <span
            key={idx}
            className="font-bold text-indigo-900 bg-indigo-50/70 px-2 py-0.5 rounded mr-1.5 inline-block"
          >
            {part}
          </span>
        )
      }

      return <React.Fragment key={idx}>{part}</React.Fragment>
    })
  }

  return (
    <div
      className={`space-y-3.5 text-gray-800 leading-relaxed font-normal selection:bg-indigo-100 selection:text-indigo-900 ${
        fontSize === 'large'
          ? 'text-base sm:text-lg sm:leading-8'
          : 'text-xs sm:text-sm sm:leading-7'
      }`}
    >
      {paragraphs.map((p, idx) => (
        <p key={idx} className="text-justify indent-3">
          {renderParagraphWithTokens(p)}
        </p>
      ))}
    </div>
  )
}
