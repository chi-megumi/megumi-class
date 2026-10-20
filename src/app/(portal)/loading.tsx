import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

export default function Loading() {
  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-screen py-8 relative lg:px-4 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner Skeleton */}
      <div className="p-6 sm:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-2xl bg-indigo-100/70 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-56 rounded-xl" />
              <Skeleton className="h-4 w-72 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Grid Content Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white border border-gray-100 shadow-2xs space-y-4"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-md" />
            <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
