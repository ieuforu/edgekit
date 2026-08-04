import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
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
import type { IssueType } from '@edgekit/shared'

const STATUS_OPTIONS = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'Todo' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const

const PRIORITY_OPTIONS = [
  { value: 'NO_PRIORITY', label: 'No priority' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
] as const

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-blue-100 text-blue-700',
  NO_PRIORITY: 'bg-gray-100 text-gray-500',
}

interface IssueDetailPanelProps {
  issue: IssueType | undefined
  onClose: () => void
  onUpdate: (issueId: number, data: { title?: string; description?: string; status?: string; priority?: string }) => void
  onDelete: (issueId: number) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function IssueDetailPanel({
  issue,
  onClose,
  onUpdate,
  onDelete,
}: IssueDetailPanelProps) {
  const [title, setTitle] = useState(issue?.title ?? '')
  const [description, setDescription] = useState(issue?.description ?? '')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)

  useEffect(() => {
    if (issue) {
      setTitle(issue.title)
      setDescription(issue.description ?? '')
    }
  }, [issue?.id])

  if (!issue || issue.id === undefined) return null

  const issueId = issue.id

  const handleTitleBlur = () => {
    setEditingTitle(false)
    if (title.trim() && title.trim() !== issue.title) {
      onUpdate(issueId, { title: title.trim() })
    } else {
      setTitle(issue.title)
    }
  }

  const handleDescBlur = () => {
    setEditingDesc(false)
    if (description !== (issue.description ?? '')) {
      onUpdate(issueId, { description: description.trim() || undefined })
    }
  }

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== issue.status) {
      onUpdate(issueId, { status: newStatus })
    }
  }

  const handlePriorityChange = (newPriority: string) => {
    if (newPriority !== issue.priority) {
      onUpdate(issueId, { priority: newPriority })
    }
  }

  const statusLabel = STATUS_OPTIONS.find((s) => s.value === issue.status)?.label ?? issue.status
  const priorityLabel = PRIORITY_OPTIONS.find((p) => p.value === issue.priority)?.label ?? issue.priority

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/20"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-gray-200 bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          {editingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleBlur()
                if (e.key === 'Escape') {
                  setTitle(issue.title)
                  setEditingTitle(false)
                }
              }}
              autoFocus
              className="text-lg font-semibold"
            />
          ) : (
            <h2
              className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-indigo-600"
              onClick={() => setEditingTitle(true)}
            >
              {issue.title}
            </h2>
          )}
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-5">
            {/* Status */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" className="w-full justify-between" />}>
                  {statusLabel}
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <DropdownMenuItem key={opt.value} onClick={() => handleStatusChange(opt.value)}>
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
                Priority
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" className="w-full justify-between" />}>
                  <span className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[issue.priority] ?? ''}`}>
                      {priorityLabel}
                    </span>
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <DropdownMenuItem key={opt.value} onClick={() => handlePriorityChange(opt.value)}>
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </label>
              {editingDesc ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleDescBlur}
                  rows={4}
                  autoFocus
                  placeholder="Add a description..."
                />
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  className="min-h-[80px] cursor-pointer rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:bg-white"
                >
                  {description || <span className="italic text-gray-400">Click to add a description...</span>}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{issue.createdAt ? formatDate(issue.createdAt) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Creator</span>
                  <span>{issue.creatorId ? `#${issue.creatorId}` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  />
                }
              >
                <Trash2 className="h-4 w-4" />
                Delete Issue
              </AlertDialogTrigger>
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
                      onDelete(issueId)
                      onClose()
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </motion.div>
    </>
  )
}
