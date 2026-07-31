import type { TaskType } from '../types'

interface TaskCardProps {
  task: TaskType
  onToggleComplete: (task: TaskType) => void
  onEdit: (task: TaskType) => void
  onDelete: (task: TaskType) => void
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function isOverdue(dateStr: string): boolean {
  try {
    const date = new Date(dateStr + 'T23:59:59')
    return date < new Date()
  } catch {
    return false
  }
}

function truncate(str: string | undefined, maxLength: number): string {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '…'
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const overdue = !task.completed && task.dueDate ? isOverdue(task.dueDate) : false

  return (
    <div
      className={`group relative rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md focus-within:shadow-md ${
        task.completed
          ? 'border-green-200 bg-green-50/30 hover:bg-green-50/50'
          : overdue
            ? 'border-red-200 bg-red-50/20 hover:bg-red-50/40 hover:shadow-red-100'
            : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Header: Toggle + Name */}
      <div className="mb-3 flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
            task.completed
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-gray-300 hover:border-indigo-400 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2'
          }`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && (
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <h3
            className={`text-base font-semibold leading-snug ${
              task.completed ? 'text-gray-400 line-through' : 'text-gray-900'
            }`}
          >
            {task.name}
          </h3>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p
          className={`mb-3 ml-8 text-sm leading-relaxed ${
            task.completed ? 'text-gray-400' : 'text-gray-500'
          }`}
        >
          {truncate(task.description, 120)}
        </p>
      )}

      {/* Footer: Due date + Actions */}
      <div className="ml-8 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200 ${
            task.completed
              ? 'bg-green-100 text-green-700'
              : overdue
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
          }`}
        >
          {overdue && (
            <svg
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          )}
          {!overdue && (
            <svg
              className="h-3 w-3 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
          )}
          {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
          {overdue && <span className="font-semibold">overdue</span>}
        </span>
        <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
          <button
            onClick={() => onEdit(task)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            aria-label="Edit task"
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
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="rounded-lg p-1.5 text-gray-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            aria-label="Delete task"
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
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
