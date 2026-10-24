import { Search, BookA, Gamepad2, Zap, X, RotateCcw } from 'lucide-react'

type UnitProgressToolbarProps = {
  unitTitle: string
  searchTerm: string
  setSearchTerm: (term: string) => void
  onClose: () => void
  onRefresh?: () => void
  isLoading?: boolean
}

const UnitProgressToolbar = ({
  unitTitle,
  searchTerm,
  setSearchTerm,
  onClose,
  onRefresh,
  isLoading,
}: UnitProgressToolbarProps) => {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Chi tiết tiến độ học tập</h2>
          <p className="text-sm text-gray-500 mt-1">
            Bài học: <span className="font-bold text-indigo-600">{unitTitle}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className={`p-2 hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 rounded-full transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Làm mới dữ liệu mới nhất"
            >
              <RotateCcw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm học sinh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
          />
        </div>

        <div className="flex gap-4 text-xs font-semibold text-gray-500">
          <div className="flex items-center gap-1.5">
            <BookA size={14} className="text-blue-500" /> Lật thẻ
          </div>
          <div className="flex items-center gap-1.5">
            <Gamepad2 size={14} className="text-purple-500" /> Đố vui
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-orange-500" /> Ghép thẻ
          </div>
        </div>
      </div>
    </>
  )
}

export default UnitProgressToolbar
