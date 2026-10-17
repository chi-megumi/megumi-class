import { useFlashcardStore } from '../stores/useFlashcardStore'
import { categoryLabels } from '../data/vocabData'
import { useEffect, useRef } from 'react'
import { Search } from 'lucide-react'


const DEBOUNCE_MS = 300

export function ControlsBar() {
  const vocabItems = useFlashcardStore((s) => s.vocabItems)
  const activeFilter = useFlashcardStore((s) => s.activeFilter)
  const setFilter = useFlashcardStore((s) => s.setFilter)
  const searchQuery = useFlashcardStore((s) => s.searchQuery)
  const setSearch = useFlashcardStore((s) => s.setSearch)
  const starredSet = useFlashcardStore((s) => s.starredSet)
  const masteredSet = useFlashcardStore((s) => s.masteredSet)

  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== searchQuery) {
      inputRef.current.value = searchQuery
    }
  }, [searchQuery])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setSearch(e.target.value)
    }, DEBOUNCE_MS)
  }

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const uniqueCategories = Array.from(
    new Set(vocabItems.map((item) => item.category?.slug).filter(Boolean))
  )
  const filterKeys = ['all', ...uniqueCategories, 'starred', 'memorize']

  function getFilterCount(filter: string, data: string[]): number {
    if (filter === 'all') return vocabItems.length
    if (filter === 'starred' || filter === 'memorize') return data.length
    return vocabItems.filter((item) => item.category?.slug === filter).length
  }

  return (
    <div className="controls-row">
      <div className="filter-group">
        {filterKeys.map((key) => {
          // @ts-expect-error type inference on keys
          const label = categoryLabels[key] || key
          return (
            <button
              key={key}
              className={`filter-btn ${activeFilter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label === 'all' ? 'Tất cả' : label === 'starred' ? 'Đã lưu' : label === 'memorize' ? 'Đã thuộc' : label}
              {` (${getFilterCount(key as string, key === 'starred' ? starredSet : masteredSet)})`}
            </button>
          )
        })}
      </div>

      <div className="search-box">
        <span className="search-icon flex items-center justify-center">
          <Search size={16} className="text-gray-400" />
        </span>
        <input
          ref={inputRef}
          type="text"
          id="search-input"
          placeholder="Tìm từ, nghĩa..."
          defaultValue={searchQuery}
          onChange={handleChange}
        />
      </div>
    </div>
  )
}
