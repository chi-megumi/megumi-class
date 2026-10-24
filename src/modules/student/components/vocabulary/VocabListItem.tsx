import React from 'react'
import { Check, Volume2, Maximize2 } from 'lucide-react'
import { VocabListItemProps } from './types'
import { getMediaUrl } from '~/common/utils/media'

export const VocabListItem: React.FC<VocabListItemProps> = ({
  item,
  isMastered,
  onToggleMastered,
  onSpeak,
  onPreviewImage,
}) => {
  return (
    <div
      className={`p-3 md:p-4.5 flex flex-col md:flex-row md:items-center gap-3.5 transition-all group break-inside-avoid scroll-contain-item ${
        isMastered
          ? 'bg-emerald-50/40 border-l-4 border-l-emerald-500'
          : 'bg-white border-l-4 border-l-transparent hover:bg-indigo-50/30'
      }`}
    >
      {/* Mastered Checkmark Button (Desktop) */}
      <div className="hidden md:flex shrink-0 w-8 flex-col items-center justify-center print:hidden">
        <button
          type="button"
          onClick={onToggleMastered}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isMastered
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 scale-100'
              : 'bg-gray-100 text-gray-400 border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50 scale-95 hover:scale-100'
          }`}
          title={isMastered ? 'Bỏ đánh dấu đã thuộc' : 'Đánh dấu đã thuộc'}
        >
          {isMastered ? (
            <Check size={16} strokeWidth={3} />
          ) : (
            <Check size={16} strokeWidth={2} className="opacity-50" />
          )}
        </button>
      </div>

      {/* Vocab Image Thumbnail (if exists) */}
      {item.image && (
        <button
          type="button"
          onClick={() => onPreviewImage?.(item)}
          className="relative shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border border-gray-200/90 bg-gray-50 hover:border-indigo-400 hover:shadow-md transition-all group/thumb cursor-pointer self-start md:self-center"
          title="Nhấn để xem ảnh phóng to"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getMediaUrl(item.image)}
            alt={item.word}
            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 transition-colors flex items-center justify-center">
            <Maximize2
              size={14}
              className="text-white opacity-0 group-hover/thumb:opacity-100 drop-shadow-md transition-opacity"
            />
          </div>
        </button>
      )}

      {/* Word Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-2.5 mb-1">
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            {item.word}
          </span>
          {item.pos && (
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {item.pos}
            </span>
          )}
          {item.ipa && (
            <span className="text-sm text-indigo-500 font-mono">
              /{item.ipa}/
            </span>
          )}
        </div>

        <div className="text-gray-700 font-medium flex items-center gap-1.5 flex-wrap">
          <span>{item.vi}</span>
          {item.emoji && <span className="text-base leading-none">{item.emoji}</span>}
        </div>

        {item.example && (
          <div className="text-sm text-gray-600 mt-2 bg-gray-50/90 border border-gray-100 px-3 py-1.5 rounded-lg inline-block italic">
            &quot;{item.example}&quot;
          </div>
        )}
      </div>

      {/* Actions (Hidden when printing) */}
      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center print:hidden">
        {/* Mobile Mastered Toggle */}
        <button
          type="button"
          onClick={onToggleMastered}
          className={`md:hidden p-2.5 rounded-xl border transition-colors ${
            isMastered
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm'
              : 'bg-gray-50 text-gray-400 border-gray-200'
          }`}
          title={isMastered ? 'Bỏ đánh dấu đã thuộc' : 'Đánh dấu đã thuộc'}
        >
          <Check size={18} strokeWidth={isMastered ? 3 : 2} />
        </button>

        {/* Audio pronunciation button */}
        <button
          type="button"
          onClick={onSpeak}
          className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors shadow-sm"
          title="Nghe phát âm"
        >
          <Volume2 size={20} />
        </button>
      </div>
    </div>
  )
}

export default VocabListItem
