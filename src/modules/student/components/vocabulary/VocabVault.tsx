'use client'

import React, { useState } from 'react'
import { Volume2, X } from 'lucide-react'
import { VocabLayoutMode, VocabVaultProps } from './types'
import { VocabItemData } from '~/modules/teacher/types'
import { getMediaUrl } from '~/common/utils/media'
import VocabVaultHeader from './VocabVaultHeader'
import VocabListView from './VocabListView'
import VocabGridView from './VocabGridView'
import VocabEmptyState from './VocabEmptyState'

export const VocabVault: React.FC<VocabVaultProps> = ({
  vocabItems,
  masteredSet,
  toggleMasteredById,
  speak,
  unitTitle,
}) => {
  const [viewMode, setViewMode] = useState<VocabLayoutMode>('list')
  const [previewItem, setPreviewItem] = useState<VocabItemData | null>(null)

  // Sắp xếp ưu tiên: Từ mới tạo nhất hiển thị lên đầu
  const sortedItems = React.useMemo(() => {
    if (!vocabItems || vocabItems.length === 0) return []
    return [...vocabItems].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (timeDiff !== 0) return timeDiff
      }
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    })
  }, [vocabItems])

  const totalCount = sortedItems.length
  const masteredCount = sortedItems.filter((item) =>
    masteredSet.includes(item.id)
  ).length

  const handlePrint = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.print === 'function') {
        window.print()
      } else {
        alert('Trình duyệt hiện tại không hỗ trợ in trực tiếp. Vui lòng mở trang bằng Chrome hoặc Safari để in/lưu PDF.')
      }
    } catch {
      alert('Không thể kích hoạt tính năng in trên trình duyệt này. Vui lòng mở bằng Chrome hoặc Safari.')
    }
  }

  return (
    <section id="vocab-vault-section" className="w-full print:pt-2">
      {/* Printable Header - Visible only when printing to PDF */}
      <div className="hidden print:block pt-3 mb-6 pb-4 border-b-2 border-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Kho từ vựng (The Vault)
            </h1>
            {unitTitle && (
              <p className="text-sm font-semibold text-gray-700 mt-1">
                Bài học: {unitTitle}
              </p>
            )}
          </div>
          <div className="text-right text-xs text-gray-600">
            <p className="font-bold text-gray-900 uppercase tracking-wider">
              Megumi English
            </p>
            <p className="mt-0.5">
              Số lượng: {totalCount} từ {masteredCount > 0 && `(Đã thuộc: ${masteredCount})`}
            </p>
          </div>
        </div>
      </div>

      {/* Screen Header (Hidden when printing) */}
      <VocabVaultHeader
        totalCount={totalCount}
        masteredCount={masteredCount}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrint={handlePrint}
      />

      {/* Content Area */}
      {totalCount === 0 ? (
        <VocabEmptyState />
      ) : viewMode === 'list' ? (
        <VocabListView
          items={sortedItems}
          masteredSet={masteredSet}
          toggleMasteredById={toggleMasteredById}
          speak={speak}
          onPreviewImage={setPreviewItem}
        />
      ) : (
        <VocabGridView
          items={sortedItems}
          masteredSet={masteredSet}
          toggleMasteredById={toggleMasteredById}
          speak={speak}
          onPreviewImage={setPreviewItem}
        />
      )}

      {/* Lightbox Image Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span>{previewItem.word}</span>
                  {previewItem.pos && (
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
                      {previewItem.pos}
                    </span>
                  )}
                </h3>
                {previewItem.ipa && (
                  <p className="text-xs text-indigo-500 font-mono mt-0.5">/{previewItem.ipa}/</p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => speak(previewItem.word)}
                  className="w-9 h-9 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                  title="Nghe phát âm"
                >
                  <Volume2 size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all cursor-pointer"
                  title="Đóng"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-inner flex items-center justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getMediaUrl(previewItem.image)}
                alt={previewItem.word}
                className="w-full h-full object-contain p-2"
              />
            </div>

            <div className="space-y-2">
              <div className="text-gray-800 font-semibold text-base flex items-center gap-1.5">
                <span>{previewItem.vi}</span>
                {previewItem.emoji && <span>{previewItem.emoji}</span>}
              </div>

              {previewItem.example && (
                <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 p-2.5 rounded-xl italic">
                  &quot;{previewItem.example}&quot;
                  {previewItem.exampleVi && (
                    <div className="text-gray-400 not-italic mt-1">{previewItem.exampleVi}</div>
                  )}
                </div>
              )}

              {previewItem.tip && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 p-2 rounded-lg">
                  {previewItem.tip}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default VocabVault
