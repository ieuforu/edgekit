import { motion } from 'motion/react'
import type { WorkspaceListItem } from '@/features/workspace/hooks'

interface IssuePageProps {
  workspace: WorkspaceListItem
}

export default function IssuePage({ workspace }: IssuePageProps) {
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
        </div>

        <motion.div
          className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 px-4 py-12 text-center"
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
        </motion.div>
      </section>
    </div>
  )
}
