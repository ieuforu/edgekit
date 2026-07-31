import { useTasks } from '../hooks/useTasks'
import Header from '../components/Header'
import TaskCard from '../components/TaskCard'
import CreateTaskModal from '../components/CreateTaskModal'
import EditTaskModal from '../components/EditTaskModal'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog'
import EmptyState from '../components/EmptyState'
import LoadingSkeleton from '../components/LoadingSkeleton'
import ErrorToast from '../components/ErrorToast'
import FilterBar from '../components/FilterBar'

interface TaskPageProps {
  user: { id: number; email: string; name: string }
  onLogout: () => void
}

export default function TaskPage({ user, onLogout }: TaskPageProps) {
  const {
    tasks,
    filteredTasks,
    loading,
    error,
    filter,
    setFilter,
    createOpen,
    setCreateOpen,
    editTask,
    setEditTask,
    deleteTask,
    setDeleteTask,
    totalCount,
    completedCount,
    activeCount,
    fetchTasks,
    handleToggleComplete,
    handleEdit,
    handleDelete,
    dismissError,
  } = useTasks()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        onLogout={onLogout}
        onCreateClick={() => setCreateOpen(true)}
        totalCount={totalCount}
        completedCount={completedCount}
      />

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
        <ErrorToast message={error} onDismiss={dismissError} />
      )}
    </div>
  )
}
