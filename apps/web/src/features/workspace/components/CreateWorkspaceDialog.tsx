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
import { useCreateWorkspace } from '@/features/workspace/hooks'

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const { create, loading } = useCreateWorkspace()

  const slug = slugify(name)

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!name.trim() || !slug) return

      setServerError(null)
      try {
        await create(name.trim(), slug)
        setName('')
        onOpenChange(false)
        onSuccess()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create workspace'
        setServerError(message)
      }
    },
    [name, slug, create, onOpenChange, onSuccess],
  )

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setName('')
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
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            Workspaces help you organize projects and collaborate with your team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</div>
          )}

          <div className="space-y-2">
            <label htmlFor="workspace-name" className="text-sm font-medium text-gray-700">
              Workspace name
            </label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My workspace"
              autoFocus
              required
            />
            {name && (
              <p className="text-xs text-gray-400">
                Slug: <span className="font-mono text-gray-600">{slug}</span>
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim() || !slug}>
              {loading ? 'Creating…' : 'Create workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
