import { useState } from 'react'

import { VocabItemData } from '../../types'

interface TextImportProps {
  onImport: (items: VocabItemData[]) => void
}

const TextImport = ({ onImport }: TextImportProps) => {
  const [textInput, setTextInput] = useState('')
  const [separator, setSeparator] = useState('-')

  const handleTextImport = () => {
    if (!textInput.trim()) return

    const lines = textInput.split('\n')
    const newItems: VocabItemData[] = []

    for (const line of lines) {
      if (!line.trim()) continue

      const sep = separator === 'tab' ? '\t' : separator
      const parts = line.split(sep)

      if (parts.length >= 2) {
        newItems.push({
          id: crypto.randomUUID(),
          word: parts[0].trim(),
          vi: parts.slice(1).join(sep).trim(),
          createdAt: new Date().toISOString(),
        })
      }
    }

    if (newItems.length > 0) {
      onImport(newItems)
      setTextInput('')
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium text-gray-700">Ký tự phân cách:</label>
        <select
          value={separator}
          onChange={(e) => setSeparator(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6A5EEB]/20 focus:border-[#6A5EEB] transition-all"
        >
          <option value="-">Gạch ngang (-)</option>
          <option value=",">Dấu phẩy (,)</option>
          <option value="tab">Tab</option>
        </select>
      </div>

      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder={`apple - quả táo\nbanana - quả chuối`}
        className="w-full h-100 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/20 resize-none custom-scrollbar transition-all"
      />

      <button
        onClick={handleTextImport}
        disabled={!textInput.trim()}
        className="px-6 py-2 bg-[#6A5EEB] text-white rounded-xl font-medium shadow-sm hover:bg-[#5b51d8] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        Phân tích và Thêm
      </button>
    </div>
  )
}

export default TextImport
