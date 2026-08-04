import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

interface CreateIssueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: number
  onSuccess?: () => void
  createIssue: (data: {
    projectId: number
    title: string
    description?: string
    status?: string
    priority?: string
  }) => void
  isPending: boolean
}

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

export default function CreateIssueDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
  createIssue: createIssueFn,
  isPending,
}: CreateIssueDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('TODO')
  const [priority, setPriority] = useState('NO_PRIORITY')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    createIssueFn({
      projectId,
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
    })

    setTitle('')
    setDescription('')
    setStatus('TODO')
    setPriority('NO_PRIORITY')
    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Issue</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue title"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" type="button" className="w-full justify-between" />}>
                    {STATUS_OPTIONS.find((s) => s.value === status)?.label}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <DropdownMenuItem key={opt.value} onClick={() => setStatus(opt.value)}>
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Priority</label>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="outline" type="button" className="w-full justify-between" />}>
                    {PRIORITY_OPTIONS.find((p) => p.value === priority)?.label}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <DropdownMenuItem key={opt.value} onClick={() => setPriority(opt.value)}>
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending}>
              {isPending ? 'Creating...' : 'Create Issue'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
