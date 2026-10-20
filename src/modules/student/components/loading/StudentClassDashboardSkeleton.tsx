import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

export function StudentClassDashboardSkeleton() {
  return (
    <div className="w-full max-w-[1200px] mx-auto min-h-screen py-8 relative lg:px-4 space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner Skeleton */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-pink-50/80 rounded-3xl border border-indigo-100/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-2xl bg-indigo-200/60 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-60 rounded-xl" />
              <Skeleton className="h-4 w-80 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/70 p-4 rounded-2xl border border-white">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md bg-indigo-100/70" />
          </div>
        </div>
      </div>

      {/* Class Exams Section Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-lg bg-indigo-100" />
          <Skeleton className="h-5 w-44 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-5 w-48 rounded-lg" />
                  <Skeleton className="h-3.5 w-32 rounded-md" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full bg-indigo-100/70" />
              </div>
              <div className="pt-2 flex justify-between items-center border-t border-gray-50">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-xl bg-indigo-500/20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Units Section Skeleton */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-lg bg-indigo-100" />
          <Skeleton className="h-5 w-48 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3.5 w-16 rounded-md" />
                  <Skeleton className="w-7 h-7 rounded-lg" />
                </div>
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="h-3.5 w-full rounded-md" />
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-50">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20 rounded-md" />
                  <Skeleton className="h-3 w-10 rounded-md" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-2xl bg-indigo-50/80" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentClassDashboardSkeleton
