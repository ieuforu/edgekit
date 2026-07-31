import { useCallback, useEffect, useMemo, useState } from 'react'
import type { TaskType } from './types'
import { api } from './lib/api'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TaskCard from './components/TaskCard'
import CreateTaskModal from './components/CreateTaskModal'
import EditTaskModal from './components/EditTaskModal'
import DeleteConfirmDialog from './components/DeleteConfirmDialog'
import EmptyState from './components/EmptyState'
import LoadingSkeleton from './components/LoadingSkeleton'
import ErrorToast from './components/ErrorToast'
import FilterBar, { type FilterOption } from './components/FilterBar'

export default function App() {
  const { user, loading: authLoading, logout } = useAuth()
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login')

  // ── Auth gate ──────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <LoadingSkeleton />
      </div>
    )
  }

  if (!user) {
    return authPage === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthPage('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />
    )
  }

  return <TaskDashboard user={user} onLogout={logout} />
}

// ── Task dashboard (only rendered when authenticated) ────────────
function TaskDashboard({
  user,
  onLogout,
}: {
  user: { id: number; email: string; name: string }
  onLogout: () => void
}) {
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterOption>('all')

  // Modal states
  const [createOpen, setCreateOpen] = useState(false)
  const [editTask, setEditTask] = useState<TaskType | null>(null)
  const [deleteTask, setDeleteTask] = useState<TaskType | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.api.tasks.$get()
      if (!res.ok) {
        if (res.status === 401) {
          // Session expired — reload to trigger auth gate
          window.location.reload()
          return
        }
        throw new Error(`Failed to load tasks (${res.status})`)
      }
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  async function handleToggleComplete(task: TaskType) {
    const newCompleted = !task.completed

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.slug === task.slug ? { ...t, completed: newCompleted } : t)),
    )

    try {
      const res = await api.api.tasks[':taskSlug'].$patch({
        param: { taskSlug: task.slug },
        json: { completed: newCompleted },
      })

      if (!res.ok) {
        // Revert optimistic update
        setTasks((prev) =>
          prev.map((t) => (t.slug === task.slug ? { ...t, completed: !newCompleted } : t)),
        )
        throw new Error('Failed to update task')
      }
    } catch (err) {
      // Revert on network error too
      setTasks((prev) =>
        prev.map((t) => (t.slug === task.slug ? { ...t, completed: !newCompleted } : t)),
      )
      setError(err instanceof Error ? err.message : 'Failed to toggle task')
    }
  }

  function handleEdit(task: TaskType) {
    setEditTask(task)
  }

  function handleDelete(task: TaskType) {
    setDeleteTask(task)
  }

  // Derived counts
  const totalCount = tasks.length
  const completedCount = tasks.filter((t) => t.completed).length
  const activeCount = totalCount - completedCount

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return tasks.filter((t) => !t.completed)
      case 'completed':
        return tasks.filter((t) => t.completed)
      default:
        return tasks
    }
  }, [tasks, filter])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 md:py-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Tasks</h1>
              {totalCount > 0 && (
                <p className="mt-0.5 text-sm text-gray-500">
                  {completedCount} of {totalCount} completed
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-gray-500 sm:inline">{user.email}</span>
              <button
                onClick={onLogout}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Sign out
              </button>
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden sm:inline">New task</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-12 text-center sm:px-6 sm:py-16">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 sm:h-14 sm:w-14">
              <svg
                className="h-6 w-6 text-red-500 sm:h-7 sm:w-7"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Failed to load tasks</h3>
            <p className="mb-4 max-w-sm text-sm text-gray-500">{error}</p>
            <button
              onClick={fetchTasks}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
                />
              </svg>
              Try again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState onCreateClick={() => setCreateOpen(true)} />
        ) : (
          <>
            <FilterBar
              current={filter}
              onChange={setFilter}
              totalCount={totalCount}
              activeCount={activeCount}
              completedCount={completedCount}
            />

            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-12 text-center sm:px-6">
                <p className="text-sm text-gray-500">No {filter} tasks found.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.slug}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchTasks}
      />

      <EditTaskModal
        open={editTask !== null}
        task={editTask}
        onClose={() => setEditTask(null)}
        onUpdated={fetchTasks}
      />

      <DeleteConfirmDialog
        open={deleteTask !== null}
        task={deleteTask}
        onClose={() => setDeleteTask(null)}
        onDeleted={fetchTasks}
      />

      {/* Error toast — only show for operational errors when task list is visible */}
      {error && !loading && tasks.length > 0 && (
        <ErrorToast message={error} onDismiss={() => setError(null)} />
      )}
    </div>
  )
}
