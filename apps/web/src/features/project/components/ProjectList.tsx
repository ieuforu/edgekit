import { useState } from 'react'
import { motion } from 'motion/react'
import { Plus, Trash2, FolderOpen } from 'lucide-react'
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
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md"
    >
      {/* Clickable content area */}
      <div onClick={onClick}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-gray-900">{project.name}</h3>
            {project.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{project.description}</p>
            )}
          </div>
          <Badge
            variant={project.status === 'ACTIVE' ? 'default' : 'secondary'}
            className="shrink-0 mr-6"
          >
            {project.status}
          </Badge>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Created {project.createdAt ? formatDate(project.createdAt) : '—'}
          </span>
        </div>
      </div>

      {/* Delete button — visible on hover */}
      <div className="absolute top-3 right-3">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
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
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white/50 px-4 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
        <FolderOpen className="h-7 w-7 text-indigo-500" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900">No projects yet</h3>
      <p className="mb-5 max-w-sm text-sm text-gray-500">
        Create your first project to start organizing issues and tracking work.
      </p>
      <Button onClick={onCreateClick}>
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </div>
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
              <div className="space-y-2.5">
                <div className="h-4 w-32 rounded-md bg-gray-100" />
                <div className="h-3 w-48 rounded-md bg-gray-100" />
              </div>
              <div className="h-5 w-16 rounded-full bg-gray-100" />
            </div>
            <div className="mt-4 h-3 w-24 rounded-md bg-gray-100" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">Failed to load projects: {error.message}</p>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return <EmptyProjects onCreateClick={onCreateClick} />
  }

  return (
    <div className="space-y-3">
      {deleteError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 ring-1 ring-red-200">{deleteError}</div>
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
