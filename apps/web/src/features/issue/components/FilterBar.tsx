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
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
            current === filter.key
              ? 'bg-gray-100 text-gray-700'
              : 'bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600'
          }`}
          aria-pressed={current === filter.key}
        >
          {filter.label}
          <span
            className={`inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-[10px] font-medium ${
              current === filter.key ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'
            }`}
          >
            {filter.count}
          </span>
        </button>
      ))}
    </div>
  )
}
