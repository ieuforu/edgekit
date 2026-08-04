interface TaskPageProps {
  user: { id: number; email: string; name: string }
  onLogout: () => void
}

export default function TaskPage({ user, onLogout }: TaskPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 md:py-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">EdgeKit</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                Project management workspace
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-500 sm:inline">{user.email}</span>
              <button
                onClick={onLogout}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 px-4 py-16 text-center sm:px-6 sm:py-20">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 sm:mb-6 sm:h-20 sm:w-20">
            <svg
              className="h-8 w-8 text-indigo-500 sm:h-10 sm:w-10"
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
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Workspaces coming soon</h3>
          <p className="mb-5 max-w-sm text-sm text-gray-500 sm:mb-6">
            The data model has been upgraded to support workspaces, projects, and issues.
            The UI will be rebuilt in the next phase.
          </p>
        </div>
      </main>
    </div>
  )
}
