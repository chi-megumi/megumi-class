import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

export function UnitAnalyticsSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* 5 KPI Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16 rounded-md" />
              <Skeleton className="w-6 h-6 rounded-lg bg-indigo-50" />
            </div>
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Sub Nav & Filter Toolbar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28 rounded-xl bg-indigo-100/70" />
          <Skeleton className="h-8 w-28 rounded-xl" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-44 rounded-xl" />
      </div>

      {/* Cards List Skeleton */}
      <div className="space-y-3.5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-gray-100 bg-white shadow-2xs flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="w-10 h-10 rounded-xl bg-indigo-50 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right space-y-1">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UnitAnalyticsSkeleton
