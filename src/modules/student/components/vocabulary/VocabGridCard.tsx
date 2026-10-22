import React from 'react'
import { Check, Volume2, Maximize2 } from 'lucide-react'
import { VocabGridCardProps } from './types'
import { getMediaUrl } from '~/common/utils/media'

export const VocabGridCard: React.FC<VocabGridCardProps> = ({
  item,
  isMastered,
  onToggleMastered,
  onSpeak,
  onPreviewImage,
}) => {
  return (
    <div
      className={`p-4.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between break-inside-avoid relative group print:shadow-none print:border-gray-200 ${
        isMastered
          ? 'bg-emerald-50/30 border-emerald-200/90 shadow-sm hover:shadow-md'
          : 'bg-white border-gray-100 hover:border-indigo-200 shadow-sm hover:shadow-md'
      }`}
    >
      <div>
        {/* Vocab Image Banner (if exists) */}
        {item.image && (
          <div
            onClick={() => onPreviewImage?.(item)}
            className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 mb-3 group/gridimg cursor-pointer hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-center"
            title="Bấm để xem ảnh phóng to"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getMediaUrl(item.image)}
              alt={item.word}
              className="w-full h-full object-contain p-2 group-hover/gridimg:scale-105 transition-transform"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-md opacity-0 group-hover/gridimg:opacity-100 transition-opacity">
              <Maximize2 size={12} />
            </div>
          </div>
        )}

        {/* Top Header: Word, POS badge, Audio button */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                {item.word}
              </span>
              {item.pos && (
                <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {item.pos}
                </span>
              )}
            </div>

            {item.ipa && (
              <div className="text-xs text-indigo-500 font-mono mt-0.5">
                /{item.ipa}/
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onSpeak}
            className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors shrink-0 print:hidden"
            title="Nghe phát âm"
          >
            <Volume2 size={18} />
          </button>
        </div>

        {/* Vietnamese meaning and emoji */}
        <div className="text-gray-700 font-medium text-sm my-2 flex items-center gap-1.5 flex-wrap">
          <span>{item.vi}</span>
          {item.emoji && <span className="text-base leading-none">{item.emoji}</span>}
        </div>

        {/* Example sentence */}
        {item.example && (
          <div className="text-xs text-gray-500 mt-2 bg-gray-50/80 border border-gray-100/90 p-2.5 rounded-xl italic leading-relaxed">
            &quot;{item.example}&quot;
          </div>
        )}
      </div>

      {/* Card Footer: Mastered toggle button */}
      <div className="pt-3.5 mt-3 border-t border-gray-100/80 flex items-center justify-between print:hidden">
        <button
          type="button"
          onClick={onToggleMastered}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isMastered
              ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600'
              : 'bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
          }`}
          title={isMastered ? 'Bỏ đánh dấu đã thuộc' : 'Đánh dấu đã thuộc'}
        >
          <Check size={14} strokeWidth={isMastered ? 3 : 2} />
          <span>{isMastered ? 'Đã thuộc' : 'Chưa thuộc'}</span>
        </button>

        {isMastered && (
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <Check size={12} strokeWidth={3} /> Mastered
          </span>
        )}
      </div>
    </div>
  )
}

export default VocabGridCard
