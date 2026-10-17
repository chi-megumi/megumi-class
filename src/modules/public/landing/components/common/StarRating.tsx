'use client'

import React from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: number
  className?: string
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1 text-amber-400 ${className}`}
      aria-label={`${rating} trên ${maxRating} sao`}
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const isFilled = index < Math.floor(rating)
        return (
          <Star
            key={index}
            size={size}
            className={
              isFilled
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-300'
            }
          />
        )
      })}
    </div>
  )
}
