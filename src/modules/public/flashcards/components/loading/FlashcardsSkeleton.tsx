import React from 'react'
import Skeleton from '@/components/skeleton/Skeleton'

export function FlashcardsSkeleton() {
  return (
    <div className="w-full max-w-[900px] mx-auto min-h-[80vh] py-6 flex flex-col items-center space-y-6 animate-in fade-in duration-300 px-4">
      {/* Header Skeleton */}
      <div className="text-center space-y-2 w-full max-w-md mx-auto">
        <Skeleton className="h-8 w-64 mx-auto rounded-xl" />
        <Skeleton className="h-4 w-48 mx-auto rounded-lg" />
      </div>

      {/* Mode Tabs Skeleton */}
      <div className="flex items-center justify-center gap-2 p-1.5 bg-gray-100/80 rounded-2xl">
        <Skeleton className="h-10 w-28 rounded-xl bg-white shadow-xs" />
        <Skeleton className="h-10 w-28 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Progress & Controls Bar Skeleton */}
      <div className="w-full max-w-lg space-y-2">
        <div className="flex justify-between items-center text-xs px-1">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Central 3D Flashcard Skeleton */}
      <div className="w-full max-w-lg h-[360px] sm:h-[400px] rounded-3xl bg-white border border-gray-100 shadow-xl p-8 flex flex-col justify-between items-center relative overflow-hidden">
        <div className="flex justify-between w-full">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>

        <div className="space-y-4 text-center w-full max-w-xs flex flex-col items-center">
          <Skeleton className="h-10 w-48 rounded-xl bg-indigo-100/70" />
          <Skeleton className="h-4 w-32 rounded-lg" />
          <Skeleton className="h-5 w-56 rounded-lg" />
        </div>

        <Skeleton className="h-4 w-36 rounded-md" />
      </div>

      {/* Bottom Controls Buttons Skeleton */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="h-12 w-32 rounded-2xl bg-indigo-500/20" />
        <Skeleton className="w-12 h-12 rounded-2xl" />
      </div>
    </div>
  )
}

export default FlashcardsSkeleton
