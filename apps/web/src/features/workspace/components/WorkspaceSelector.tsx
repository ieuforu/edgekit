import { motion } from 'motion/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { WorkspaceListItem } from '@/features/workspace/hooks'

interface WorkspaceSelectorProps {
  workspaces: WorkspaceListItem[]
  currentWorkspace: WorkspaceListItem
  onSelect: (workspaceId: number) => void
}

export function WorkspaceSelector({
  workspaces,
  currentWorkspace,
  onSelect,
}: WorkspaceSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.98]">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-100 text-xs font-bold text-indigo-700">
          {currentWorkspace.name.charAt(0).toUpperCase()}
        </div>
        <span className="max-w-[120px] truncate">{currentWorkspace.name}</span>
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {workspaces.map((ws, index) => (
          <motion.div
            key={ws.id ?? ws.slug}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <DropdownMenuItem
              onClick={() => {
                if (ws.id != null) onSelect(ws.id)
              }}
              className="cursor-pointer gap-2"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-200 text-[10px] font-bold text-gray-600">
                {ws.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{ws.name}</p>
                <p className="truncate text-xs text-gray-500">{ws.role}</p>
              </div>
              {ws.id != null && ws.id === currentWorkspace.id && (
                <svg
                  className="h-4 w-4 shrink-0 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              )}
            </DropdownMenuItem>
          </motion.div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
