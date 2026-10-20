import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

export function ClassesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2 py-1">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-transparent bg-white/40"
        >
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="w-4 h-4 rounded-md shrink-0 bg-indigo-100/70" />
            <Skeleton
              className="h-4 rounded-md"
              style={{ width: `${60 + ((index * 23) % 35)}%` }}
            />
          </div>
          <Skeleton className="w-3.5 h-3.5 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  )
}

export default ClassesSkeleton
