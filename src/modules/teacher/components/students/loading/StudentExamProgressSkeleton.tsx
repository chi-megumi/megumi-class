import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

export function StudentExamProgressSkeleton() {
  return (
    <div className="space-y-6">
      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {[
          'bg-indigo-50/60 border-indigo-100',
          'bg-purple-50/60 border-purple-100',
          'bg-emerald-50/60 border-emerald-100',
          'bg-amber-50/60 border-amber-100',
        ].map((colorClass, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${colorClass} space-y-2`}>
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Filter and search bar skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
        <Skeleton className="h-9 w-64 rounded-xl" />
        <Skeleton className="h-9 w-48 rounded-xl" />
      </div>

      {/* Exam list cards */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-gray-100 bg-white shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 flex-1">
              <Skeleton className="w-10 h-10 rounded-xl bg-indigo-50 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-4 w-16 rounded-md" />
                </div>
                <Skeleton className="h-3 w-56 rounded-md" />
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-50">
              <div className="text-right space-y-1">
                <Skeleton className="h-6 w-14 rounded-lg bg-indigo-100/70" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StudentExamProgressSkeleton
