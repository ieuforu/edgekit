import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Trash2 } from 'lucide-react'
import type { IssueType } from '@edgekit/shared'
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
import { Button } from '@/components/ui/button'

const PRIORITY_CONFIG: Record<
  IssueType['priority'],
  { label: string; dot: string }
> = {
  URGENT: { label: 'Urgent', dot: 'bg-red-400' },
  HIGH: { label: 'High', dot: 'bg-orange-400' },
  MEDIUM: { label: 'Medium', dot: 'bg-yellow-400' },
  LOW: { label: 'Low', dot: 'bg-blue-400' },
  NO_PRIORITY: { label: '', dot: '' },
}

interface IssueCardProps {
  issue: IssueType
  onClick: () => void
  onDelete?: (issueId: number) => void
  isDragging?: boolean
}

const IssueCard = React.memo(function IssueCard({ issue, onClick, onDelete, isDragging }: IssueCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { attributes, listeners, setNodeRef, transform, isDragging: dndDragging } = useDraggable({
    id: `issue-${issue.id}`,
    data: { issue },
  })

  const dragging = isDragging || dndDragging

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: dragging ? 0.9 : 1,
  }

  const priority = PRIORITY_CONFIG[issue.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`group relative cursor-pointer rounded-lg border bg-white p-3 transition-colors duration-150 ${
        dragging
          ? 'border-indigo-300 ring-1 ring-indigo-500/20'
          : 'border-gray-200 hover:bg-gray-50'
      }`}
    >
      {/* Delete button — visible on hover */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowDeleteDialog(true)
          }}
          className="absolute top-2 right-2 rounded p-1 text-gray-300 opacity-0 transition-all duration-150 hover:bg-red-50 hover:text-red-400 group-hover:opacity-100"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}

      <h4 className="pr-6 text-[13px] font-medium text-gray-900 truncate">
        {issue.title}
      </h4>

      {issue.description && (
        <p className="mt-1 line-clamp-2 text-[11px] text-gray-400 leading-relaxed">{issue.description}</p>
      )}

      <div className="mt-2 flex items-center gap-2">
        {priority.dot && (
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
            {priority.label}
          </span>
        )}
        {issue.assigneeId && (
          <span className="text-[10px] text-gray-400">Assigned</span>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete issue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{issue.title}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel render={<Button variant="ghost" />}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              render={<Button variant="destructive" />}
              onClick={() => {
                onDelete?.(issue.id)
                setShowDeleteDialog(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
})

export default IssueCard
