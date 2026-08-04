import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProjectList from '@/features/project/components/ProjectList'
import CreateProjectDialog from '@/features/project/components/CreateProjectDialog'
import type { WorkspaceListItem } from '@/features/workspace/hooks'

interface IssuePageProps {
  workspace: WorkspaceListItem
}

export default function IssuePage({ workspace }: IssuePageProps) {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="space-y-8">
      {/* Workspace heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
        <p className="mt-1 text-sm text-gray-500">Role: {workspace.role}</p>
      </div>

      {/* Projects section */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="mt-4">
          <ProjectList workspaceId={workspace.id!} onCreateClick={() => setCreateOpen(true)} />
        </div>
      </section>

      <CreateProjectDialog
        workspaceId={workspace.id!}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  )
}
