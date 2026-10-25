import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

type TestViewSkeletonProps = {
  isReading?: boolean
}

export default function TestViewSkeleton({ isReading = false }: TestViewSkeletonProps) {
  return (
    <div
      className={`mx-auto flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-200 isolate transition-all duration-300 ${
        isReading ? 'w-full max-w-6xl' : 'w-full max-w-2xl'
      }`}
    >
      {/* Header Skeleton */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="space-y-1">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-3 w-60 rounded-sm" />
        </div>
        <Skeleton className="h-7 w-20 rounded-lg bg-gray-100" />
      </div>

      {/* Body Skeleton */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#f8f9fa] space-y-3.5">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
              <Skeleton className="w-6 h-6 rounded-md bg-indigo-100" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <Skeleton className="h-10 rounded-lg bg-gray-50 border border-gray-100" />
              <Skeleton className="h-10 rounded-lg bg-gray-50 border border-gray-100" />
              <Skeleton className="h-10 rounded-lg bg-gray-50 border border-gray-100" />
              <Skeleton className="h-10 rounded-lg bg-gray-50 border border-gray-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="p-3 sm:p-3.5 bg-white border-t border-gray-100 flex items-center justify-between">
        <Skeleton className="h-3 w-48 rounded-sm hidden sm:block" />
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg bg-indigo-100" />
        </div>
      </div>
    </div>
  )
}
