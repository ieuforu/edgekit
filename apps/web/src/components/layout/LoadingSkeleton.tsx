export default function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="h-5 w-5 shrink-0 rounded-full bg-gray-200/80" />
            <div className="h-4 w-1/2 rounded-md bg-gray-200/80" />
          </div>
          <div className="mb-2 ml-8 h-3.5 w-full rounded-md bg-gray-100" />
          <div className="mb-4 ml-8 h-3.5 w-3/4 rounded-md bg-gray-100" />
          <div className="ml-8 flex items-center justify-between">
            <div className="h-5 w-24 rounded-full bg-gray-100" />
            <div className="flex gap-1">
              <div className="h-7 w-7 rounded-lg bg-gray-100" />
              <div className="h-7 w-7 rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
