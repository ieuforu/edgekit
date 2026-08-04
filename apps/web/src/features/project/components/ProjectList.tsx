import { useState } from 'react'
import { motion } from 'motion/react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useProjects, useDeleteProject } from '@/features/project/hooks'
import type { ProjectType } from '@edgekit/shared'

interface ProjectListProps {
  workspaceId: number
  onCreateClick: () => void
  onProjectClick?: (projectId: number) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ProjectCard({
  project,
  onDelete,
  onClick,
}: {
  project: ProjectType
  onDelete: (id: number) => void
  onClick?: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Clickable content area */}
      <div
        onClick={onClick}
        className="cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-gray-900">{project.name}</h3>
            {project.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{project.description}</p>
            )}
          </div>
          <Badge
            variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
            className="shrink-0"
          >
            {project.status}
          </Badge>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Created: {project.createdAt ? formatDate(project.createdAt) : '—'}
          </span>
        </div>
      </div>

      {/* Non-clickable delete button — positioned absolutely so it sits outside the clickable area */}
      <div className="absolute top-2 right-2">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-opacity"
              />
            }
          >
            <Trash2 className="h-4 w-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel render={<Button variant="ghost" />}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                render={<Button variant="destructive" />}
                onClick={() => onDelete(project.id!)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  )
}

function EmptyProjects({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 px-4 py-12 text-center"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
        <svg
          className="h-7 w-7 text-indigo-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
          />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900">No projects yet</h3>
      <p className="mb-4 max-w-sm text-sm text-gray-500">
        Create your first project to start organizing issues and tracking work.
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </motion.div>
  )
}

export default function ProjectList({ workspaceId, onCreateClick, onProjectClick }: ProjectListProps) {
  const { data: projects, isLoading, error } = useProjects(workspaceId)
  const deleteMutation = useDeleteProject(workspaceId)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = (projectId: number) => {
    setDeleteError(null)
    deleteMutation.mutate(projectId, {
      onError: (err) => {
        setDeleteError(err.message || 'Failed to delete project')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="h-3 w-48 rounded bg-gray-100" />
              </div>
              <div className="h-5 w-16 rounded-full bg-gray-200" />
            </div>
            <div className="mt-4 h-3 w-24 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">Failed to load projects: {error.message}</p>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return <EmptyProjects onCreateClick={onCreateClick} />
  }

  return (
    <div className="space-y-3">
      {deleteError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{deleteError}</div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={handleDelete}
            onClick={onProjectClick ? () => onProjectClick(project.id!) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
