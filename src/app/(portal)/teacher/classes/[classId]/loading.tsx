import Skeleton from '@/components/skeleton/Skeleton'

export default function ClassTabLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
