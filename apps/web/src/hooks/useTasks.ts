import { useCallback, useEffect, useMemo, useState } from 'react'
import type { TaskType } from '../types'
import { api } from '../lib/api'
import type { FilterOption } from '../components/FilterBar'

export function useTasks() {
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

  function dismissError() {
    setError(null)
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

  return {
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
  }
}
