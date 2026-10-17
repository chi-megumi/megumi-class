'use client'

import React, { useState, useMemo } from 'react'
import { Search, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'
import VocabMistakeItem from './VocabMistakeItem'
import type { VocabStatItem, VocabFilterType, VocabSortType } from './types'

type VocabAnalyticsViewProps = {
  vocabStats: VocabStatItem[]
  onSpeak: (word: string) => void
  isSpeaking: boolean
}

export default function VocabAnalyticsView({
  vocabStats,
  onSpeak,
  isSpeaking,
}: VocabAnalyticsViewProps) {
  const [vocabSearch, setVocabSearch] = useState('')
  const [vocabFilter, setVocabFilter] = useState<VocabFilterType>('all')
  const [vocabSort, setVocabSort] = useState<VocabSortType>('error')

  const hardVocabs = useMemo(() => vocabStats.filter((v) => v.difficultyLevel === 'hard'), [vocabStats])
  const mediumVocabs = useMemo(() => vocabStats.filter((v) => v.difficultyLevel === 'medium'), [vocabStats])
  const easyVocabs = useMemo(() => vocabStats.filter((v) => v.difficultyLevel === 'easy'), [vocabStats])

  const topMistakenVocabs = useMemo(() => {
    return [...vocabStats].filter((v) => v.incorrectCount > 0 || v.errorRate > 20).slice(0, 3)
  }, [vocabStats])

  const filteredVocabs = useMemo(() => {
    return vocabStats
      .filter((v) => {
        const matchesSearch =
          v.word.toLowerCase().includes(vocabSearch.toLowerCase()) ||
          v.vi.toLowerCase().includes(vocabSearch.toLowerCase())
        if (!matchesSearch) return false

        if (vocabFilter === 'hard') return v.difficultyLevel === 'hard'
        if (vocabFilter === 'medium') return v.difficultyLevel === 'medium'
        if (vocabFilter === 'easy') return v.difficultyLevel === 'easy'
        return true
      })
      .sort((a, b) => {
        if (vocabSort === 'error') {
          if (b.errorRate !== a.errorRate) return b.errorRate - a.errorRate
          return b.incorrectCount - a.incorrectCount
        }
        if (vocabSort === 'attempts') return b.totalAttempts - a.totalAttempts
        return a.word.localeCompare(b.word)
      })
  }, [vocabStats, vocabSearch, vocabFilter, vocabSort])

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Insight Alert Card */}
      {topMistakenVocabs.length > 0 ? (
        <div className="bg-gradient-to-r from-amber-50 via-rose-50/60 to-indigo-50/40 border border-amber-200/80 rounded-xl p-3.5 shadow-2xs relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                Gợi ý giảng dạy cho giáo viên
              </h4>
              <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                Phát hiện học sinh trong lớp hay làm sai hoặc nhầm lẫn ở các từ sau:{' '}
                {topMistakenVocabs.map((v, i) => (
                  <span key={v.id}>
                    <span className="font-bold text-rose-700 bg-white/80 px-1.5 py-0.5 rounded border border-rose-200 text-[11px]">
                      {v.word} ({v.vi})
                    </span>
                    {i < topMistakenVocabs.length - 1 ? ', ' : '.'}
                  </span>
                ))}
              </p>
              <p className="text-[11px] text-indigo-700 font-semibold mt-1 flex items-center gap-1">
                💡 Mẹo: Dành 5-10 phút đầu buổi học để ôn tập lại cách phát âm và các cặp từ dễ nhầm này!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-emerald-900">Lớp học nắm từ vựng rất tốt!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Chưa ghi nhận từ vựng nào có tỷ lệ sai vượt mức quy định.
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-2 rounded-xl border border-gray-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-56">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm từ vựng hoặc nghĩa..."
              value={vocabSearch}
              onChange={(e) => setVocabSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setVocabFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                vocabFilter === 'all'
                  ? 'bg-white text-gray-800 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Tất cả ({vocabStats.length})
            </button>
            <button
              onClick={() => setVocabFilter('hard')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                vocabFilter === 'hard'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <span>Khó</span>
              <span className="text-[10px] font-bold">({hardVocabs.length})</span>
            </button>
            <button
              onClick={() => setVocabFilter('medium')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                vocabFilter === 'medium'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-amber-600 hover:bg-amber-50'
              }`}
            >
              <span>Trung bình</span>
              <span className="text-[10px] font-bold">({mediumVocabs.length})</span>
            </button>
            <button
              onClick={() => setVocabFilter('easy')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                vocabFilter === 'easy'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <span>Nắm vững</span>
              <span className="text-[10px] font-bold">({easyVocabs.length})</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Sắp xếp:</span>
          <select
            value={vocabSort}
            onChange={(e) => setVocabSort(e.target.value as VocabSortType)}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="error">Tỷ lệ sai cao nhất</option>
            <option value="attempts">Số lượt kiểm tra nhiều nhất</option>
            <option value="alpha">Theo bảng chữ cái (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Vocab Stats List */}
      {filteredVocabs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-bold text-gray-600">
            Không tìm thấy từ vựng nào khớp với bộ lọc
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc &quot;Tất cả&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredVocabs.map((vocab) => (
            <VocabMistakeItem
              key={vocab.id}
              vocab={vocab}
              onSpeak={onSpeak}
              isSpeaking={isSpeaking}
            />
          ))}
        </div>
      )}
    </div>
  )
}
