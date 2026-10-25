import React, { useState, useEffect, useRef } from 'react'
import { Clock, Rocket } from 'lucide-react'
import { formatTime } from './constants'

type TestHeaderProps = {
  title: string
  isMiniChallenge: boolean
  isReviewMode: boolean
  initialDurationSeconds?: number
  timeLeft?: number
  targetEndTime?: number | null
  onTimeUp?: () => void
}

function TestHeader({
  title,
  isMiniChallenge,
  isReviewMode,
  initialDurationSeconds = 0,
  timeLeft: controlledTimeLeft,
  targetEndTime,
  onTimeUp,
}: TestHeaderProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (controlledTimeLeft !== undefined) return controlledTimeLeft
    if (targetEndTime) {
      return Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000))
    }
    return initialDurationSeconds
  })

  const onTimeUpRef = useRef(onTimeUp)
  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    if (isReviewMode || controlledTimeLeft !== undefined) return

    const timer = setInterval(() => {
      const remaining = targetEndTime
        ? Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000))
        : Math.max(0, timeLeft - 1)

      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearInterval(timer)
        onTimeUpRef.current?.()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isReviewMode, controlledTimeLeft, targetEndTime, timeLeft])

  const displayTime = controlledTimeLeft !== undefined ? controlledTimeLeft : timeLeft

  return (
    <div
      className={`px-4 py-2.5 flex items-center justify-between border-b ${
        isMiniChallenge
          ? 'bg-gradient-to-r from-orange-400 to-pink-500 border-transparent text-white'
          : 'bg-white border-gray-100'
      }`}
    >
      <div>
        <h1
          className={`text-sm sm:text-base font-bold uppercase tracking-tight flex items-center gap-1.5 ${
            isMiniChallenge ? 'drop-shadow-sm' : 'text-gray-800'
          }`}
        >
          {isMiniChallenge && <Rocket size={16} className="text-white shrink-0" />} {title}
        </h1>
        <p className={`text-[11px] font-medium ${isMiniChallenge ? 'text-white/90' : 'text-gray-500'}`}>
          Hãy đọc kỹ câu hỏi và chọn đáp án đúng nhất.
        </p>
      </div>

      {!isReviewMode && (
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs shadow-inner ${
            isMiniChallenge ? 'bg-white/20' : 'bg-gray-100 text-gray-800'
          } ${displayTime < 60 ? 'animate-pulse text-red-500 bg-red-50' : ''}`}
        >
          <Clock size={14} />
          {formatTime(displayTime)}
        </div>
      )}
    </div>
  )
}

export default React.memo(TestHeader)
