'use client'

import React from 'react'

interface Petal {
  id: number
  left: string
  top: string
  size: number
  opacity: number
  duration: string
  delay: string
  rotate: number
}

const STATIC_PETALS: Petal[] = [
  { id: 1, left: '5%', top: '12%', size: 14, opacity: 0.6, duration: '14s', delay: '0s', rotate: 25 },
  { id: 2, left: '18%', top: '28%', size: 10, opacity: 0.45, duration: '18s', delay: '2s', rotate: -15 },
  { id: 3, left: '42%', top: '8%', size: 16, opacity: 0.5, duration: '16s', delay: '4s', rotate: 45 },
  { id: 4, left: '72%', top: '20%', size: 12, opacity: 0.55, duration: '20s', delay: '1s', rotate: -30 },
  { id: 5, left: '88%', top: '35%', size: 15, opacity: 0.4, duration: '15s', delay: '5s', rotate: 60 },
  { id: 6, left: '92%', top: '15%', size: 11, opacity: 0.5, duration: '19s', delay: '3s', rotate: -40 },
  { id: 7, left: '25%', top: '55%', size: 13, opacity: 0.35, duration: '22s', delay: '6s', rotate: 10 },
  { id: 8, left: '60%', top: '65%', size: 12, opacity: 0.4, duration: '17s', delay: '7s', rotate: -20 },
]

export const CherryBlossomParticles: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {STATIC_PETALS.map((petal) => (
        <span
          key={petal.id}
          className="absolute inline-block transition-transform duration-1000"
          style={{
            left: petal.left,
            top: petal.top,
            fontSize: `${petal.size}px`,
            opacity: petal.opacity,
            transform: `rotate(${petal.rotate}deg)`,
            filter: 'drop-shadow(0 2px 4px rgba(236, 72, 153, 0.2))',
          }}
        >
          🌸
        </span>
      ))}
    </div>
  )
}
