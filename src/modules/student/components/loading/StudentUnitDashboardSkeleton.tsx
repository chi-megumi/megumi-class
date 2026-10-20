import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

export function StudentUnitDashboardSkeleton() {
  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-screen py-8 relative lg:px-4 space-y-8 animate-in fade-in duration-300">
      {/* Unit Header Banner Skeleton */}
      <div className="p-6 sm:p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
        </div>

        {/* Circular / Card Mastery Skeleton */}
        <div className="flex items-center gap-4 bg-gradient-to-br from-indigo-50/70 to-purple-50/50 p-4 rounded-2xl border border-indigo-100/60">
          <Skeleton className="w-14 h-14 rounded-full bg-indigo-200/60 shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        </div>
      </div>

      {/* 4 Game Launcher Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50',
          'bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200/50',
          'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50',
          'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50',
        ].map((colorClass, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-3xl border ${colorClass} shadow-2xs space-y-3 flex flex-col justify-between h-44`}
          >
            <div className="space-y-2">
              <Skeleton className="w-10 h-10 rounded-2xl bg-white/80" />
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl bg-white/80" />
          </div>
        ))}
      </div>

      {/* Vocab Vault Header Skeleton */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-2xs">
          <div className="space-y-1">
            <Skeleton className="h-5 w-48 rounded-lg" />
            <Skeleton className="h-3.5 w-36 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-20 rounded-xl" />
          </div>
        </div>

        {/* Vocab List Items Skeleton */}
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-8 h-8 rounded-full bg-indigo-50 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-32 rounded-md" />
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-52 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <Skeleton className="w-9 h-9 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentUnitDashboardSkeleton
