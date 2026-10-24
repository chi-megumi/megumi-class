'use client'

import React from 'react'
import { Plus, Trash2, ArrowRightLeft } from 'lucide-react'
import type { TestBlock, MatchingPair } from '@/modules/teacher/types'

type MatchingEditorProps = {
  block: TestBlock
  isMiniChallenge: boolean
  onUpdateContent: (newContent: TestBlock['content']) => void
  onAddPair: () => void
}

export default function MatchingEditor({
  block,
  isMiniChallenge,
  onUpdateContent,
  onAddPair,
}: MatchingEditorProps) {
  const pairs: MatchingPair[] = block.content?.pairs || []

  const handleFlipAll = () => {
    const flipped = pairs.map((p) => ({
      ...p,
      left: p.right || '',
      right: p.left || '',
    }))
    onUpdateContent({ ...block.content, pairs: flipped })
  }

  const handleSwapPair = (pIndex: number) => {
    const newPairs = [...pairs]
    const cur = newPairs[pIndex]
    newPairs[pIndex] = {
      ...cur,
      left: cur.right || '',
      right: cur.left || '',
    }
    onUpdateContent({ ...block.content, pairs: newPairs })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-2">
        <span>
          Nhập các cặp từ/khái niệm tương ứng. Hệ thống sẽ tự động xáo trộn Cột B khi học sinh làm
          bài.
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFlipAll}
            className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-1 transition-colors"
            title="Đổi chiều toàn bộ các cặp: Cột A ⇄ Cột B"
          >
            <ArrowRightLeft size={13} /> Đổi chiều tất cả
          </button>
          <span className="font-bold text-indigo-600">{pairs.length} cặp</span>
        </div>
      </div>

      <div className="space-y-3">
        {pairs.map((p, pIndex) => (
          <div
            key={p.id}
            className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-2xl border relative group/p transition-colors ${
              isMiniChallenge
                ? 'bg-gradient-to-br from-orange-50/20 to-pink-50/20 border-orange-100'
                : 'bg-gray-50/60 border-gray-100 hover:border-gray-200'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 self-start sm:self-center ${
                isMiniChallenge ? 'bg-orange-100 text-orange-700' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              {pIndex + 1}
            </div>

            {/* Left Item */}
            <div className="flex-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">
                Cột A (Từ / Khái niệm)
              </label>
              <input
                type="text"
                value={p.left || ''}
                onChange={(e) => {
                  const newPairs = [...pairs]
                  newPairs[pIndex] = { ...newPairs[pIndex], left: e.target.value }
                  onUpdateContent({ ...block.content, pairs: newPairs })
                }}
                placeholder="VD: magnificent"
                className={`w-full font-bold px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 ${
                  isMiniChallenge
                    ? 'border-orange-200 text-orange-950 focus:ring-orange-400/30'
                    : 'border-gray-200 text-gray-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Center Swap Button */}
            <div className="flex items-center justify-center shrink-0 self-center sm:self-center pt-1 sm:pt-4">
              <button
                type="button"
                onClick={() => handleSwapPair(pIndex)}
                className={`p-2 rounded-xl border transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xs ${
                  isMiniChallenge
                    ? 'text-orange-500 bg-orange-50/80 hover:bg-orange-100 border-orange-200 hover:border-orange-300'
                    : 'text-indigo-500 bg-indigo-50/80 hover:bg-indigo-100 border-indigo-200 hover:border-indigo-300'
                }`}
                title="Hoán đổi Cột A ⇄ Cột B của cặp này"
              >
                <ArrowRightLeft size={16} />
              </button>
            </div>

            {/* Right Item */}
            <div className="flex-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">
                Cột B (Nghĩa / Định nghĩa)
              </label>
              <input
                type="text"
                value={p.right || ''}
                onChange={(e) => {
                  const newPairs = [...pairs]
                  newPairs[pIndex] = { ...newPairs[pIndex], right: e.target.value }
                  onUpdateContent({ ...block.content, pairs: newPairs })
                }}
                placeholder="VD: tráng lệ, nguy nga"
                className={`w-full font-medium px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 ${
                  isMiniChallenge
                    ? 'border-orange-200 text-orange-950 focus:ring-orange-400/30'
                    : 'border-gray-200 text-gray-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
            </div>

            {/* Delete button */}
            {pairs.length > 2 && (
              <button
                className="self-end sm:self-center p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/p:opacity-100"
                onClick={() => {
                  const newPairs = [...pairs]
                  newPairs.splice(pIndex, 1)
                  onUpdateContent({ ...block.content, pairs: newPairs })
                }}
                title="Xóa cặp này"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={onAddPair}
          className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors border border-dashed ${
            isMiniChallenge
              ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 shadow-sm'
              : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
          }`}
        >
          <Plus size={18} /> Thêm cặp ghép nối
        </button>
      </div>
    </div>
  )
}
