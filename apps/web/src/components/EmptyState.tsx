interface EmptyStateProps {
  onCreateClick: () => void
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 px-4 py-12 text-center sm:px-6 sm:py-16">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 sm:mb-5">
        <svg
          className="h-5 w-5 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
          />
        </svg>
      </div>
      <h3 className="mb-1.5 text-sm font-medium text-gray-700">No tasks yet</h3>
      <p className="mb-5 max-w-sm text-[13px] text-gray-400 sm:mb-6">
        Get started by creating your first task. Stay organized and boost your productivity.
      </p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-indigo-700"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Create your first task
      </button>
    </div>
  )
}
