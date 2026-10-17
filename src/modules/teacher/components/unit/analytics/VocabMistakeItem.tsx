'use client'

import React from 'react'
import { Volume2, CheckCircle2, XCircle } from 'lucide-react'
import type { VocabStatItem } from './types'

type VocabMistakeItemProps = {
  vocab: VocabStatItem
  onSpeak: (word: string) => void
  isSpeaking: boolean
}

export default function VocabMistakeItem({ vocab, onSpeak, isSpeaking }: VocabMistakeItemProps) {
  const isHard = vocab.difficultyLevel === 'hard'
  const isMedium = vocab.difficultyLevel === 'medium'

  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
        isHard
          ? 'border-rose-200/90 hover:border-rose-300 bg-rose-50/10'
          : isMedium
            ? 'border-amber-200/80 hover:border-amber-300'
            : 'border-gray-200/80 hover:border-indigo-200'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Word details */}
        <div className="flex items-start gap-3.5 min-w-[280px]">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 text-indigo-700 flex items-center justify-center text-xl shrink-0 border border-indigo-100">
            {vocab.emoji || '📖'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900">{vocab.word}</span>
              <button
                onClick={() => onSpeak(vocab.word)}
                disabled={isSpeaking}
                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Nghe phát âm"
              >
                <Volume2 size={16} />
              </button>
              {vocab.pos && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-600">
                  {vocab.pos}
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isHard
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : isMedium
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {isHard ? 'Khó — Cần lưu ý' : isMedium ? 'Trung bình' : 'Nắm vững'}
              </span>
            </div>

            <p className="text-xs text-gray-400 font-mono mt-0.5">{vocab.ipa || '/—/'}</p>
            <p className="text-sm font-semibold text-gray-700 mt-1">{vocab.vi}</p>

            {vocab.example && (
              <p className="text-xs text-gray-500 italic mt-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                &ldquo;{vocab.example}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Middle: Accuracy / Error Rate Bar */}
        <div className="flex-1 max-w-xs px-2">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-bold text-emerald-600">Đúng: {vocab.accuracyRate}%</span>
            <span
              className={`font-bold ${vocab.errorRate > 0 ? 'text-rose-600' : 'text-gray-400'}`}
            >
              Sai: {vocab.errorRate}%
            </span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all"
              style={{ width: `${vocab.accuracyRate}%` }}
              title={`Làm đúng: ${vocab.correctCount} lượt`}
            />
            <div
              className="bg-rose-500 h-full transition-all"
              style={{ width: `${vocab.errorRate}%` }}
              title={`Làm sai: ${vocab.incorrectCount} lượt`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1">
            <span>
              {vocab.totalAttempts > 0
                ? `${vocab.totalAttempts} lượt làm bài`
                : 'Chưa có lượt kiểm tra'}
            </span>
            <span>{vocab.masteryRate}% học sinh thuộc</span>
          </div>
        </div>

        {/* Right: Common Mistakes Pill List */}
        <div className="min-w-[240px] max-w-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Lỗi sai thường gặp:
          </p>
          {vocab.commonMistakes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {vocab.commonMistakes.slice(0, 3).map((m, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-1.5"
                  title={`Học sinh nhầm với ${m.wrongWord} ${m.count} lần`}
                >
                  <XCircle size={12} className="text-rose-500 shrink-0" />
                  <span className="font-bold truncate max-w-[120px]">{m.wrongWord}</span>
                  <span className="text-[10px] text-rose-500">
                    ({m.count} lần • {m.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-500" />
              Không ghi nhận lỗi sai phổ biến
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
