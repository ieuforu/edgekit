import { useState } from 'react'
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
  { label: string; className: string }
> = {
  URGENT: { label: 'Urgent', className: 'bg-red-100 text-red-700' },
  HIGH: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  MEDIUM: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
  LOW: { label: 'Low', className: 'bg-blue-100 text-blue-700' },
  NO_PRIORITY: { label: '—', className: 'bg-gray-100 text-gray-500' },
}

interface IssueCardProps {
  issue: IssueType
  onClick: () => void
  onDelete?: (issueId: number) => void
  isDragging?: boolean
}

export default function IssueCard({ issue, onClick, onDelete, isDragging }: IssueCardProps) {
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
      className={`group relative cursor-pointer rounded-lg border bg-white p-3 transition-all duration-150 ${
        dragging
          ? 'border-indigo-300 shadow-lg ring-2 ring-indigo-500/20'
          : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Delete button — visible on hover */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowDeleteDialog(true)
          }}
          className="absolute top-2 right-2 rounded-md p-1 text-gray-300 opacity-0 transition-all duration-150 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <h4 className="pr-6 text-sm font-medium text-gray-900 truncate">
        {issue.title}
      </h4>

      {issue.description && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-400 leading-relaxed">{issue.description}</p>
      )}

      <div className="mt-2.5 flex items-center gap-2">
        <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${priority.className}`}>
          {priority.label}
        </span>
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
}
