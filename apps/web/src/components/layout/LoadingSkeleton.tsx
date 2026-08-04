export default function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-200" />
            <div className="h-5 w-1/2 rounded bg-gray-200" />
          </div>
          <div className="mb-2 ml-8 h-4 w-full rounded bg-gray-100" />
          <div className="mb-4 ml-8 h-4 w-3/4 rounded bg-gray-100" />
          <div className="ml-8 flex items-center justify-between">
            <div className="h-6 w-28 rounded-full bg-gray-100" />
            <div className="flex gap-1">
              <div className="h-8 w-8 rounded-lg bg-gray-100" />
              <div className="h-8 w-8 rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
