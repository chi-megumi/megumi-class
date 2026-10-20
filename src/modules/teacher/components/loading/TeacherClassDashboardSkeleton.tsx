import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

export function TeacherClassDashboardSkeleton() {
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
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl bg-indigo-100/70" />
        </div>
      </div>

      {/* Tabs navigation skeleton */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 pb-3">
        {['Tổng quan', 'Học sinh', 'Units bài học', 'Cài đặt lớp'].map((_, idx) => (
          <Skeleton key={idx} className="h-9 w-28 rounded-xl" />
        ))}
      </div>

      {/* 4 Summary Stats Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="w-7 h-7 rounded-lg bg-indigo-50" />
            </div>
            <Skeleton className="h-8 w-16 rounded-xl" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
        ))}
      </div>

      {/* Unit cards / exams skeleton */}
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-gray-100 shadow-2xs space-y-3"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-5 w-48 rounded-lg" />
                  <Skeleton className="h-3.5 w-64 rounded-md" />
                </div>
                <Skeleton className="w-8 h-8 rounded-xl" />
              </div>
              <div className="pt-2 flex justify-between items-center border-t border-gray-50">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeacherClassDashboardSkeleton
