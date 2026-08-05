import React, { useState, useCallback } from 'react'
import { motion } from 'motion/react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { LoadingView, ErrorView, EmptyView } from '@/components/layout/StateViews'

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

const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  ACTIVE: { dot: 'bg-emerald-400', text: 'text-gray-500' },
  ARCHIVED: { dot: 'bg-gray-300', text: 'text-gray-400' },
}

const ProjectCard = React.memo(function ProjectCard({
  project,
  onDelete,
  onClick,
}: {
  project: ProjectType
  onDelete: (id: number) => void
  onClick?: () => void
}) {
  const statusStyle = STATUS_STYLES[project.status] ?? STATUS_STYLES.ACTIVE

  return (
    <motion.div
      transition={{ duration: 0.15 }}
      className="group relative cursor-pointer rounded-lg border border-gray-200 bg-white p-5 transition-colors duration-150 hover:bg-gray-50"
    >
      {/* Clickable content area */}
      <div onClick={onClick}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-medium text-gray-900">{project.name}</h3>
            {project.description && (
              <p className="mt-1 line-clamp-2 text-xs text-gray-400">{project.description}</p>
            )}
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
            <span className={`text-[11px] font-medium capitalize ${statusStyle.text}`}>
              {project.status?.toLowerCase()}
            </span>
          </div>
          <span className="text-[11px] text-gray-400">
            {project.createdAt ? formatDate(project.createdAt) : '—'}
          </span>
        </div>
      </div>

      {/* Delete button — visible on hover */}
      <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
              />
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
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
})

function EmptyProjects({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <EmptyView
      title="No projects yet"
      description="Create your first project to start organizing issues and tracking work."
      action={
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      }
    />
  )
}

export default function ProjectList({ workspaceId, onCreateClick, onProjectClick }: ProjectListProps) {
  const { data: projects, isLoading, error } = useProjects(workspaceId)
  const deleteMutation = useDeleteProject(workspaceId)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = useCallback(
    (projectId: number) => {
      setDeleteError(null)
      deleteMutation.mutate(projectId, {
        onError: (err) => {
          setDeleteError(err.message || 'Failed to delete project')
        },
      })
    },
    [deleteMutation],
  )

  const handleProjectClick = useCallback(
    (projectId: number) => {
      if (onProjectClick) onProjectClick(projectId)
    },
    [onProjectClick],
  )

  if (isLoading) {
    return <LoadingView />
  }

  if (error) {
    return <ErrorView message={`Failed to load projects: ${error.message}`} />
  }

  if (!projects || projects.length === 0) {
    return <EmptyProjects onCreateClick={onCreateClick} />
  }

  return (
    <div className="space-y-3">
      {deleteError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{deleteError}</div>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={handleDelete}
            onClick={project.id !== undefined ? () => handleProjectClick(project.id!) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
