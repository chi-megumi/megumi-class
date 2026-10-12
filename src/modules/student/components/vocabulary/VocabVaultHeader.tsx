import React from 'react'
import { BookA, List, LayoutGrid, Printer } from 'lucide-react'
import { VocabVaultHeaderProps } from './types'

export const VocabVaultHeader: React.FC<VocabVaultHeaderProps> = ({
  totalCount,
  viewMode,
  onViewModeChange,
  onPrint,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
      {/* Title & Count */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
          <BookA size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            Kho từ vựng (The Vault)
          </h2>
        </div>
        {totalCount > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200/60">
            {totalCount} từ
          </span>
        )}
      </div>

      {/* Right Controls: Layout Buttons & Print PDF Button */}
      <div className="flex items-center gap-2 print:hidden self-end sm:self-auto">
        {/* Layout Switcher (List vs Grid 3 Column) */}
        <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200/70 shadow-2xs">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${
              viewMode === 'list'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
            title="Dạng danh sách (Mặc định)"
            aria-label="Chuyển sang dạng danh sách"
          >
            <List size={16} />
            <span>Danh sách</span>
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
            }`}
            title="Dạng lưới 3 cột"
            aria-label="Chuyển sang dạng lưới 3 cột"
          >
            <LayoutGrid size={16} />
            <span>Lưới 3 cột</span>
          </button>
        </div>

        {/* Print to PDF Button */}
        <button
          type="button"
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/60 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 shadow-2xs active:scale-95"
          title="In kho từ vựng ra PDF"
          aria-label="In kho từ vựng ra PDF"
        >
          <Printer size={16} />
          <span>In PDF</span>
        </button>
      </div>
    </div>
  )
}

export default VocabVaultHeader
