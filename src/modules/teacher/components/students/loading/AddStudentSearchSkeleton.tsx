import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

export function AddStudentSearchSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-inner bg-gray-50/70 divide-y divide-gray-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white/70">
          <Skeleton className="w-5 h-5 rounded shrink-0" />
          <Skeleton className="w-8 h-8 rounded-full shrink-0 bg-indigo-100/70" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default AddStudentSearchSkeleton
