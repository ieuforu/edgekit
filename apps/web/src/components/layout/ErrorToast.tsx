import { useEffect } from 'react'

interface ErrorToastProps {
  message: string
  onDismiss: () => void
}

export default function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 sm:bottom-6 sm:right-6">
      <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 shadow-lg transition-all duration-200">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-4 w-4 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Error</p>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 rounded p-1 text-gray-400 transition-colors duration-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
