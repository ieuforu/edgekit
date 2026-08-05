export default function LoadingSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-4 w-4 shrink-0 rounded bg-gray-100" />
            <div className="h-3.5 w-1/2 rounded bg-gray-100" />
          </div>
          <div className="mb-2 ml-7 h-3 w-full rounded bg-gray-50" />
          <div className="mb-4 ml-7 h-3 w-3/4 rounded bg-gray-50" />
          <div className="ml-7 flex items-center justify-between">
            <div className="h-4 w-20 rounded bg-gray-100" />
            <div className="h-4 w-12 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
