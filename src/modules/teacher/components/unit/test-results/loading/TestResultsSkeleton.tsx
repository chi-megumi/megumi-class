import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

export function SubmissionsLeaderboardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50/50"
        >
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>
          <Skeleton className="w-10 h-7 rounded-lg bg-indigo-100/70 shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function QuestionAnalyticsSkeleton() {
  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-7 w-14 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Filter toolbar skeleton */}
      <div className="flex justify-between items-center py-2">
        <Skeleton className="h-4 w-40 rounded-md" />
        <Skeleton className="h-8 w-48 rounded-xl" />
      </div>

      {/* Question Cards Skeleton */}
      <div className="space-y-3.5">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-gray-100 bg-white shadow-2xs space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <div className="pt-2 flex gap-3">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TestResultsSkeleton() {
  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col md:flex-row gap-6">
      {/* Left Column: Submissions */}
      <div className="w-full md:w-1/3 flex flex-col gap-3 md:border-r border-gray-100 md:pr-4">
        <div className="flex items-center justify-between mb-1">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>
        <SubmissionsLeaderboardSkeleton count={6} />
      </div>

      {/* Right Column: Submission Detail */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/60 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-10 w-20 rounded-xl bg-indigo-100/70" />
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2">
            <Skeleton className="h-16 rounded-xl bg-white" />
            <Skeleton className="h-16 rounded-xl bg-white" />
            <Skeleton className="h-16 rounded-xl bg-white" />
          </div>
        </div>

        {/* Answer blocks skeleton */}
        <div className="space-y-3 pt-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-white space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <Skeleton className="h-4 w-5/6 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestResultsSkeleton
