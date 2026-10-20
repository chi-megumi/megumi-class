'use client'

import React, { useState } from 'react'
import { VocabLayoutMode, VocabVaultProps } from './types'
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

  const totalCount = vocabItems?.length || 0
  const masteredCount = vocabItems.filter((item) =>
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
          items={vocabItems}
          masteredSet={masteredSet}
          toggleMasteredById={toggleMasteredById}
          speak={speak}
        />
      ) : (
        <VocabGridView
          items={vocabItems}
          masteredSet={masteredSet}
          toggleMasteredById={toggleMasteredById}
          speak={speak}
        />
      )}
    </section>
  )
}

export default VocabVault
