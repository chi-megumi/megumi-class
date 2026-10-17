import React from 'react'
import { Clock, Rocket } from 'lucide-react'
import { formatTime } from './constants'

type TestHeaderProps = {
  title: string
  isMiniChallenge: boolean
  isReviewMode: boolean
  timeLeft: number
}

export default function TestHeader({ title, isMiniChallenge, isReviewMode, timeLeft }: TestHeaderProps) {
  return (
    <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
      isMiniChallenge ? 'bg-gradient-to-r from-orange-400 to-pink-500 border-transparent text-white' : 'bg-white border-gray-100'
    }`}>
      <div>
        <h1 className={`text-sm sm:text-base font-bold uppercase tracking-tight flex items-center gap-1.5 ${isMiniChallenge ? 'drop-shadow-sm' : 'text-gray-800'}`}>
          {isMiniChallenge && <Rocket size={16} className="text-white shrink-0" />} {title}
        </h1>
        <p className={`text-[11px] font-medium ${isMiniChallenge ? 'text-white/90' : 'text-gray-500'}`}>
          Hãy đọc kỹ câu hỏi và chọn đáp án đúng nhất.
        </p>
      </div>
      
      {!isReviewMode && (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs shadow-inner ${
          isMiniChallenge ? 'bg-white/20 backdrop-blur-md' : 'bg-gray-100 text-gray-800'
        } ${timeLeft < 60 ? 'animate-pulse text-red-500 bg-red-50' : ''}`}>
          <Clock size={14} />
          {formatTime(timeLeft)}
        </div>
      )}
    </div>
  )
}
