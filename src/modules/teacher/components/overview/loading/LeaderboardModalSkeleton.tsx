import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

export function LeaderboardModalSkeleton() {
  return (
    <div className="space-y-6">
      {/* 4 KPI summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          'bg-amber-50/60 border-amber-100',
          'bg-indigo-50/60 border-indigo-100',
          'bg-purple-50/60 border-purple-100',
          'bg-emerald-50/60 border-emerald-100',
        ].map((colorClass, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${colorClass} space-y-2`}>
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Top 3 podium skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-3"
          >
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-36 rounded-md" />
            <div className="w-full pt-2 border-t border-gray-50 flex justify-between items-center px-2">
              <Skeleton className="h-3 w-12 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-lg bg-indigo-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Student list rows */}
      <div className="space-y-2.5 pt-2">
        <Skeleton className="h-4 w-32 rounded-md mb-3" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-2xl border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-44 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-16 rounded-lg" />
              <Skeleton className="h-7 w-14 rounded-xl bg-indigo-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeaderboardModalSkeleton
