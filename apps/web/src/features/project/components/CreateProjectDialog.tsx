import { useState, useCallback, type FormEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateProject } from '@/features/project/hooks'

interface CreateProjectDialogProps {
  workspaceId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateProjectDialog({
  workspaceId,
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const { mutate, isPending, error: mutationError } = useCreateProject(workspaceId)

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      if (!name.trim()) return

      setServerError(null)
      mutate(
        { name: name.trim(), description: description.trim() || undefined },
        {
          onSuccess: () => {
            setName('')
            setDescription('')
            onOpenChange(false)
          },
          onError: (err) => {
            setServerError(err.message || 'Failed to create project')
          },
        },
      )
    },
    [name, description, mutate, onOpenChange],
  )

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setName('')
        setDescription('')
        setServerError(null)
      }
      onOpenChange(isOpen)
    },
    [onOpenChange],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Projects help you organize issues and track work within your workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(serverError || mutationError) && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {serverError || mutationError?.message}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="project-name" className="text-[13px] font-medium text-gray-600">
              Project name
            </label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My project"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="project-description" className="text-[13px] font-medium text-gray-600">
              Description <span className="text-gray-300">(optional)</span>
            </label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? 'Creating…' : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
