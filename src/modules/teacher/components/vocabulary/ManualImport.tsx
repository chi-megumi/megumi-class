import { useState } from 'react'
import { Plus, Save, Sparkles } from 'lucide-react'

import { VocabItemData } from '../../types'

interface ManualImportProps {
  editingItem: VocabItemData | null
  onSave: (item: VocabItemData) => void
  onCancelEdit: () => void
}

const initialFormState = {
  word: '',
  vi: '',
  ipa: '',
  pos: '',
  emoji: '',
  example: '',
  exampleVi: '',
  tip: '',
}

const ManualImport = ({ editingItem, onSave, onCancelEdit }: ManualImportProps) => {
  const [formData, setFormData] = useState(() => {
    if (editingItem) {
      return {
        word: editingItem.word,
        vi: editingItem.vi,
        ipa: editingItem.ipa || '',
        pos: editingItem.pos || '',
        emoji: editingItem.emoji || '',
        example: editingItem.example || '',
        exampleVi: editingItem.exampleVi || '',
        tip: editingItem.tip || '',
      }
    }
    return initialFormState
  })

  const [showAdvanced, setShowAdvanced] = useState(() => {
    if (editingItem) {
      return !!(
        editingItem.ipa ||
        editingItem.pos ||
        editingItem.emoji ||
        editingItem.example ||
        editingItem.exampleVi ||
        editingItem.tip
      )
    }
    return false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    if (!formData.word.trim() || !formData.vi.trim()) return

    onSave({
      id: editingItem?.id || crypto.randomUUID(),
      word: formData.word.trim(),
      vi: formData.vi.trim(),
      ipa: formData.ipa.trim(),
      pos: formData.pos.trim(),
      emoji: formData.emoji.trim(),
      example: formData.example.trim(),
      exampleVi: formData.exampleVi.trim(),
      tip: formData.tip.trim(),
    })
    
    if (!editingItem) {
      setFormData(initialFormState)
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Từ vựng (Eng) *</label>
          <input
            type="text"
            name="word"
            value={formData.word}
            onChange={handleChange}
            placeholder="VD: account"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Định nghĩa (Vi) *</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="vi"
              value={formData.vi}
              onChange={handleChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="VD: tài khoản"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
            <button
              onClick={handleSave}
              disabled={!formData.word.trim() || !formData.vi.trim()}
              className="bg-[#6A5EEB] hover:bg-[#5b51d8] text-white p-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-[0.98]"
            >
              {editingItem ? <Save size={20} /> : <Plus size={20} />}
            </button>
          </div>
        </div>
      </div>

      {editingItem && (
        <div className="flex justify-start">
          <button
            onClick={onCancelEdit}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            Hủy chỉnh sửa
          </button>
        </div>
      )}

      {/* Advanced Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-medium text-[#6A5EEB] hover:underline flex items-center gap-1"
        >
          <Sparkles size={14} /> {showAdvanced ? 'Ẩn nâng cao' : 'Thêm chi tiết (IPA, Ví dụ...)'}
        </button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2 duration-300">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phát âm (IPA)</label>
            <input
              type="text"
              name="ipa"
              value={formData.ipa}
              onChange={handleChange}
              placeholder="/əˈkaʊnt/"
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Loại từ (POS)</label>
            <input
              type="text"
              name="pos"
              value={formData.pos}
              onChange={handleChange}
              placeholder="n, v, adj..."
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Emoji</label>
            <input
              type="text"
              name="emoji"
              value={formData.emoji}
              onChange={handleChange}
              placeholder="📱"
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Mẹo nhớ (Tip)</label>
            <input
              type="text"
              name="tip"
              value={formData.tip}
              onChange={handleChange}
              placeholder="💡 Cụm từ hay gặp: social media account..."
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Câu ví dụ (Eng)</label>
            <input
              type="text"
              name="example"
              value={formData.example}
              onChange={handleChange}
              placeholder="Don't share your account password."
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Nghĩa câu ví dụ (Vi)
            </label>
            <input
              type="text"
              name="exampleVi"
              value={formData.exampleVi}
              onChange={handleChange}
              placeholder="Đừng chia sẻ mật khẩu tài khoản."
              className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ManualImport
