export type FilterOption = 'all' | 'active' | 'completed'

interface FilterBarProps {
  current: FilterOption
  onChange: (filter: FilterOption) => void
  totalCount: number
  activeCount: number
  completedCount: number
}

export default function FilterBar({
  current,
  onChange,
  totalCount,
  activeCount,
  completedCount,
}: FilterBarProps) {
  const filters: { key: FilterOption; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: totalCount },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'completed', label: 'Completed', count: completedCount },
  ]

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onChange(filter.key)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
            current === filter.key
              ? 'bg-indigo-100 text-indigo-700 shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          aria-pressed={current === filter.key}
        >
          {filter.label}
          <span
            className={`inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-xs font-semibold ${
              current === filter.key ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  )
}
