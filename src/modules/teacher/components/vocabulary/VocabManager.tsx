'use client'

import { useState } from 'react'
import { Trash2, Code, AlignLeft, Type, Edit2, Lightbulb, BookOpen, Image as ImageIcon, X, Sparkles } from 'lucide-react'

import { VocabItemData } from '../../types'
import { getMediaUrl } from '~/common/utils/media'
import JsonImport from '@/modules/teacher/components/vocabulary/JsonImport'
import TextImport from './TextImport'
import ManualImport from './ManualImport'

type VocabManagerProps = {
  vocabList: VocabItemData[]
  onChange: (list: VocabItemData[]) => void
}

const VocabManager = ({ vocabList, onChange }: VocabManagerProps) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'text' | 'json'>('manual')

  // Edit State
  const [editingItem, setEditingItem] = useState<VocabItemData | null>(null)

  // Quick View Image State
  const [previewItem, setPreviewItem] = useState<VocabItemData | null>(null)

  // JSON Import State
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')

  // Recently added IDs tracking (for highlighting newest additions)
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<string[]>([])

  const handleSaveManual = (item: VocabItemData) => {
    if (editingItem) {
      onChange(vocabList.map((v) => (v.id === editingItem.id ? item : v)))
      setEditingItem(null)
    } else {
      onChange([item, ...vocabList])
      setRecentlyAddedIds((prev) => [item.id, ...prev])
    }
  }

  const handleEditWord = (item: VocabItemData) => {
    setActiveTab('manual')
    setEditingItem(item)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
  }

  const handleTextImport = (newItems: VocabItemData[]) => {
    onChange([...newItems, ...vocabList])
    setRecentlyAddedIds((prev) => [...newItems.map((i) => i.id), ...prev])
  }

  const handleJsonImport = () => {
    try {
      setJsonError('')
      let parsed
      try {
        parsed = JSON.parse(jsonInput)
      } catch {
        // Fallback for JS-style object (e.g. copied directly from a TS file)
        const sanitized = jsonInput.trim()
        if (sanitized.startsWith('[') && sanitized.endsWith(']')) {
          parsed = new Function(`return ${sanitized}`)()
        } else {
          throw new Error('Dữ liệu phải là một mảng bắt đầu bằng [ và kết thúc bằng ]')
        }
      }

      if (!Array.isArray(parsed)) throw new Error('Data must be a JSON array')

      const newItems = parsed
        .map((item) => ({
          id: crypto.randomUUID(),
          word: item.word || '',
          vi: item.vi || '',
          ipa: item.ipa || '',
          pos: item.pos || '',
          emoji: item.emoji || '',
          image: item.image || '',
          example: item.example || '',
          exampleVi: item.exampleVi || '',
          tip: item.tip || '',
          createdAt: new Date().toISOString(),
        }))
        .filter((i) => i.word && i.vi)

      if (newItems.length > 0) {
        onChange([...newItems, ...vocabList])
        setRecentlyAddedIds((prev) => [...newItems.map((i) => i.id), ...prev])
        setJsonInput('')
      } else {
        setJsonError('Không tìm thấy từ vựng hợp lệ (cần có word và vi)')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi định dạng JSON'
      setJsonError(msg)
    }
  }

  const removeWord = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa từ này không?')) {
      onChange(vocabList.filter((v) => v.id !== id))
      if (editingItem?.id === id) setEditingItem(null)
    }
  }

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword.trim()) return text

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escapedKeyword})`, 'gi'))

    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? <strong key={index}>{part}</strong> : part,
    )
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="bg-[#6A5EEB]/10 p-1.5 rounded-lg text-[#6A5EEB] flex items-center justify-center">
            <BookOpen size={16} />
          </span>
          Bộ từ vựng ({vocabList.length})
        </h2>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-2">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'manual'
              ? 'bg-[#6A5EEB] text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {editingItem && activeTab === 'manual' ? <Edit2 size={16} /> : <Type size={16} />}
          {editingItem && activeTab === 'manual' ? 'Đang chỉnh sửa' : 'Nhập thủ công'}
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'text'
              ? 'bg-[#6A5EEB] text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <AlignLeft size={16} /> Nhập văn bản
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'json'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Code size={16} /> Import JSON
        </button>
      </div>

      {/* TAB CONTENTS */}
      <div className="mb-8">
        {/* MANUAL TAB */}
        {activeTab === 'manual' && (
          <ManualImport
            key={editingItem?.id || 'new'}
            editingItem={editingItem}
            onSave={handleSaveManual}
            onCancelEdit={handleCancelEdit}
          />
        )}

        {/* TEXT IMPORT TAB */}
        {activeTab === 'text' && <TextImport onImport={handleTextImport} />}

        {/* JSON IMPORT TAB */}
        {activeTab === 'json' && (
          <JsonImport
            setJsonError={setJsonError}
            jsonInput={jsonInput}
            setJsonInput={setJsonInput}
            jsonError={jsonError}
            handleJsonImport={handleJsonImport}
          />
        )}
      </div>

      {/* FLASHCARDS PREVIEW */}
      {vocabList.length > 0 && (
        <div className="space-y-3 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Danh sách từ đã thêm ({vocabList.length})
            </h3>
            <span className="text-xs text-indigo-600 bg-indigo-50 font-medium px-2.5 py-1 rounded-lg">
              Từ mới tạo hiển thị ở đầu
            </span>
          </div>
          <div className="p-1 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto custom-scrollbar pr-2">
            {vocabList.map((item) => {
              const isRecentlyAdded = recentlyAddedIds.includes(item.id)
              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-shadow group scroll-contain-item ${
                    isRecentlyAdded
                      ? 'border-emerald-300 ring-1 ring-emerald-200/60 bg-emerald-50/10'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 shrink-0 bg-indigo-50 rounded-xl flex items-center justify-center text-xl shadow-inner">
                        {item.emoji || '📝'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold text-gray-800 text-lg leading-none">
                            {item.word}
                          </h4>
                          {isRecentlyAdded && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full animate-in fade-in">
                              <Sparkles size={10} className="text-emerald-500" /> Vừa thêm
                            </span>
                          )}
                          {item.pos && (
                            <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                              {item.pos}
                            </span>
                          )}
                          {item.image && (
                            <button
                              type="button"
                              onClick={() => setPreviewItem(item)}
                              className={`inline-flex items-center gap-1 text-[11px] font-medium border px-2 py-0.5 rounded-full transition-all cursor-pointer shadow-2xs hover:scale-105 ${
                                item.pendingFile
                                  ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200/80'
                                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200/80'
                              }`}
                              title={item.pendingFile ? 'Xem ảnh preview (Chờ lưu)' : 'Xem ảnh minh họa kích thước chuẩn'}
                            >
                              <ImageIcon size={11} />
                              <span>{item.pendingFile ? 'Ảnh mới (chờ lưu)' : 'Xem ảnh'}</span>
                            </button>
                          )}
                        </div>
                        <p className="text-indigo-600 font-medium text-sm">{item.vi}</p>
                        {item.ipa && (
                          <p className="text-xs text-gray-400 mt-1 font-mono">{item.ipa}</p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditWord(item)}
                        className="p-2 text-gray-300 hover:text-[#6A5EEB] hover:bg-indigo-50 rounded-xl transition-all"
                        title="Sửa thẻ này"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => removeWord(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Xóa thẻ này"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Extra Details */}
                  {(item.tip || item.example) && (
                    <div className="pt-3 border-t border-gray-50 text-xs space-y-2">
                      {item.tip && (
                        <p className="text-amber-600 bg-amber-50 rounded px-2 py-1 flex items-start gap-1.5">
                          <Lightbulb size={14} className="shrink-0 mt-0.5" />
                          <span>{highlightKeyword(item.tip, item.word)}</span>
                        </p>
                      )}
                      {item.example && (
                        <div className="text-gray-500 pl-2 border-l-2 border-indigo-100">
                          <p className="font-medium text-gray-700 italic">
                            {highlightKeyword(item.example, item.word)}
                          </p>
                          {item.exampleVi && <p className="mt-0.5">{item.exampleVi}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* QUICK VIEW IMAGE MODAL */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <span>{previewItem.emoji || '🖼️'}</span>
                  <span>{previewItem.word}</span>
                </h3>
                <p className="text-xs text-gray-500">{previewItem.vi}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 shadow-inner flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getMediaUrl(previewItem.image)}
                alt={previewItem.word}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span className="font-mono truncate max-w-[240px]" title={previewItem.image || ''}>
                {previewItem.pendingFile ? (previewItem.pendingFile.name || 'Ảnh mới chọn') : previewItem.image}
              </span>
              {previewItem.pendingFile ? (
                <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">
                  Chờ tải lên khi lưu
                </span>
              ) : (
                <span className="text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                  Đã lưu trên Cloud
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VocabManager
