'use client'

type SearchFilterProps = {
  onSearch: (query: string) => void
  onFilterChange: (filter: string) => void
  currentFilter: string
  placeholder?: string
}

export function SearchFilter({
  onSearch,
  onFilterChange,
  currentFilter,
  placeholder = '搜索...',
}: SearchFilterProps) {
  return (
    <div className="mb-6 flex gap-3">
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/40"
      />
      <div className="flex gap-2">
        {['全部', '进行中', '已完成'].map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => onFilterChange(filter)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentFilter === filter
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}
