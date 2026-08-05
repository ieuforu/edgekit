import { motion } from 'motion/react'
import { ChevronDown, Check } from 'lucide-react'
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
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 active:scale-[0.98]">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-xs font-bold text-indigo-700">
          {currentWorkspace.name.charAt(0).toUpperCase()}
        </div>
        <span className="max-w-[120px] truncate">{currentWorkspace.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {workspaces.map((ws, index) => (
          <motion.div
            key={ws.id ?? ws.slug}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.15 }}
          >
            <DropdownMenuItem
              onClick={() => {
                if (ws.id != null) onSelect(ws.id)
              }}
              className="cursor-pointer gap-2.5 py-2"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[10px] font-bold text-gray-600">
                {ws.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{ws.name}</p>
                <p className="truncate text-xs text-gray-500">{ws.role}</p>
              </div>
              {ws.id != null && ws.id === currentWorkspace.id && (
                <Check className="h-4 w-4 shrink-0 text-indigo-600" />
              )}
            </DropdownMenuItem>
          </motion.div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
