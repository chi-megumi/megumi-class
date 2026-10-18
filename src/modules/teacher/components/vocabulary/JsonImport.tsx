'use client'

import { useState } from 'react'
import { Sparkles, Copy, Check } from 'lucide-react'

interface JsonImportProps {
  jsonInput: string
  setJsonInput: (json: string) => void
  jsonError: string
  setJsonError: (err: string) => void
  handleJsonImport: () => void
}

const VOCABULARY_JSON_SAMPLE = JSON.stringify(
  [
    {
      word: 'abandon',
      vi: 'từ bỏ, ruồng bỏ',
      ipa: '/əˈbændən/',
      pos: 'verb',
      emoji: '🚪',
      example: 'He decided to abandon his car in the snow.',
      exampleVi: 'Anh ấy quyết định bỏ lại chiếc xe trong tuyết.',
      tip: 'Cụm từ hay gặp: abandon hope, abandon a plan',
    },
    {
      word: 'brilliant',
      vi: 'xuất sắc, thông minh',
      ipa: '/ˈbrɪljənt/',
      pos: 'adjective',
      emoji: '💡',
      example: 'She has a brilliant idea for the project.',
      exampleVi: 'Cô ấy có một ý tưởng xuất sắc cho dự án.',
      tip: 'Đồng nghĩa: exceptional, intelligent',
    },
    {
      word: 'collaborate',
      vi: 'hợp tác, phối hợp',
      ipa: '/kəˈlæbəreɪt/',
      pos: 'verb',
      emoji: '🤝',
      example: 'We need to collaborate with each other to complete the task.',
      exampleVi: 'Chúng ta cần hợp tác với nhau để hoàn thành nhiệm vụ.',
      tip: 'Cấu trúc: collaborate with sb / on sth',
    },
  ],
  null,
  2,
)

const JsonImport = ({
  jsonInput,
  setJsonInput,
  jsonError,
  setJsonError,
  handleJsonImport,
}: JsonImportProps) => {
  const [showSample, setShowSample] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  const handleCopySample = () => {
    navigator.clipboard.writeText(VOCABULARY_JSON_SAMPLE)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  const handlePasteSampleToInput = () => {
    setJsonInput(VOCABULARY_JSON_SAMPLE)
    setJsonError('')
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Guide Alert */}
      <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={18} className="text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed flex-1">
          <p className="font-bold mb-1">Danh sách từ vựng (Vocabulary List)</p>
          <p className="text-indigo-700">
            Mỗi từ vựng gồm từ tiếng Anh (<span className="font-semibold text-indigo-950 font-mono">word</span>), nghĩa tiếng Việt (<span className="font-semibold text-indigo-950 font-mono">vi</span>) cùng các trường tuỳ chọn (<span className="font-mono text-indigo-900">ipa, pos, emoji, example, exampleVi, tip</span>).
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSample(!showSample)}
              className="font-bold underline text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              {showSample ? 'Ẩn cấu trúc mẫu' : 'Xem cấu trúc JSON mẫu'}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handleCopySample}
              className="font-bold inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              {hasCopied ? (
                <Check size={13} className="text-green-600" />
              ) : (
                <Copy size={13} />
              )}
              <span>{hasCopied ? 'Đã copy mẫu!' : 'Copy mẫu JSON'}</span>
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={handlePasteSampleToInput}
              className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              Dán mẫu thử nghiệm
            </button>
          </div>
        </div>
      </div>

      {/* Sample View Accordion */}
      {showSample && (
        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-900 shadow-inner animate-in fade-in duration-200">
          <div className="px-4 py-2 bg-gray-800 text-gray-300 text-xs font-mono flex items-center justify-between border-b border-gray-700">
            <span>Cấu trúc mẫu chuẩn (vocabulary.json)</span>
            <button
              type="button"
              onClick={handleCopySample}
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-sans text-xs transition-colors cursor-pointer"
            >
              {hasCopied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              <span>{hasCopied ? 'Đã copy' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto custom-scrollbar max-h-56 leading-relaxed">
            {VOCABULARY_JSON_SAMPLE}
          </pre>
        </div>
      )}

      <textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Dán mảng JSON vào đây..."
        className="w-full h-80 bg-gray-900 text-green-400 font-mono text-sm rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none custom-scrollbar"
      />
      {jsonError && <p className="text-red-500 text-sm font-medium">{jsonError}</p>}
      <button
        onClick={handleJsonImport}
        disabled={!jsonInput.trim()}
        className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
      >
        Import JSON Data
      </button>
    </div>
  )
}

export default JsonImport
