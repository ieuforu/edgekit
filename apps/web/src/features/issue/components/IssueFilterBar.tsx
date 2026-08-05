import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

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

interface IssueFilterBarProps {
  statusFilter: string | null
  priorityFilter: string | null
  onStatusChange: (status: string | null) => void
  onPriorityChange: (priority: string | null) => void
}

export default function IssueFilterBar({
  statusFilter,
  priorityFilter,
  onStatusChange,
  onPriorityChange,
}: IssueFilterBarProps) {
  const hasFilters = statusFilter !== null || priorityFilter !== null

  const statusLabel = statusFilter
    ? STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label ?? statusFilter
    : null

  const priorityLabel = priorityFilter
    ? PRIORITY_OPTIONS.find((p) => p.value === priorityFilter)?.label ?? priorityFilter
    : null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
      </span>

      {/* Status filter */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={statusFilter ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : ''}
            />
          }
        >
          {statusFilter ? `Status: ${statusLabel}` : 'Status'}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {STATUS_OPTIONS.map((opt) => (
            <DropdownMenuItem key={opt.value} onClick={() => onStatusChange(opt.value)}>
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority filter */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={priorityFilter ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : ''}
            />
          }
        >
          {priorityFilter ? `Priority: ${priorityLabel}` : 'Priority'}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {PRIORITY_OPTIONS.map((opt) => (
            <DropdownMenuItem key={opt.value} onClick={() => onPriorityChange(opt.value)}>
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Active filter badges + clear */}
      {hasFilters && (
        <div className="flex items-center gap-1.5">
          {statusFilter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              Status: {statusLabel}
              <button
                onClick={() => onStatusChange(null)}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-indigo-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {priorityFilter && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              Priority: {priorityLabel}
              <button
                onClick={() => onPriorityChange(null)}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-indigo-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { onStatusChange(null); onPriorityChange(null) }}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
