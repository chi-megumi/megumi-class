'use client'

import React, { useState } from 'react'
import {
  X,
  FileCode2,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { TestQuestion, MatchingPair } from '../../types'
import { sanitizeMultipleChoiceOptions } from '../../utils/questionUtils'
import Portal from '@/components/common/Portal'

interface ImportBlockJsonModalProps {
  isOpen: boolean
  onClose: () => void
  blockTitle: string
  blockType: string
  currentCount: number
  onImport: (
    parsedData: { questions?: TestQuestion[]; pairs?: MatchingPair[] },
    mode: 'replace' | 'append',
  ) => void
}

export const TEMPLATE_JSON_SAMPLES: Record<string, string> = {
  multiple_choice: JSON.stringify(
    [
      {
        text: "What is the opposite meaning of the word 'generous'?",
        options: ['Kind', 'Selfish', 'Friendly', 'Honest'],
        correctIndex: 1,
      },
      {
        text: 'She has been living in Tokyo ___ 2018.',
        options: ['for', 'since', 'in', 'at'],
        correctIndex: 1,
      },
      {
        text: 'If it rains tomorrow, we ___ our trip to the beach.',
        options: ['cancel', 'will cancel', 'cancelled', 'would cancel'],
        correctIndex: 1,
      },
    ],
    null,
    2,
  ),
  fill_blank: JSON.stringify(
    [
      {
        text: 'Could you bring me an extra ___? (Bạn có thể mang cho tôi thêm một chiếc chăn không?)',
        answer: 'blanket',
      },
      {
        text: 'The sun rises in the ___ and sets in the west.',
        answer: 'east',
      },
      {
        text: 'He decided to ___ smoking because of health problems.',
        answer: 'quit',
      },
    ],
    null,
    2,
  ),
  matching: JSON.stringify(
    [
      {
        left: 'magnificent',
        right: 'tráng lệ, nguy nga',
      },
      {
        left: 'abandon',
        right: 'từ bỏ, ruồng bỏ',
      },
      {
        left: 'ancient',
        right: 'cổ kính, lâu đời',
      },
      {
        left: 'essential',
        right: 'thiết yếu, cực kỳ quan trọng',
      },
    ],
    null,
    2,
  ),
  reorder: JSON.stringify(
    [
      {
        text: 'Dịch sang tiếng Anh: Anh ấy quyết định từ bỏ chiếc xe cũ.',
        sentence: 'He decided to abandon the old car.',
      },
      {
        text: 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
        sentence: 'She has been studying English for five years.',
      },
      {
        text: 'Hoàn thiện câu:',
        sentence: 'Learning a new language opens up many opportunities.',
      },
    ],
    null,
    2,
  ),
}

export const TEMPLATE_LABELS: Record<string, { name: string; desc: string }> = {
  multiple_choice: {
    name: 'Trắc nghiệm (Multiple Choice)',
    desc: 'Mỗi câu có nội dung hỏi, mảng 4 đáp án và vị trí đáp án đúng (0, 1, 2, 3).',
  },
  fill_blank: {
    name: 'Điền khuyết (Fill in the Blanks)',
    desc: 'Mỗi câu chứa ký hiệu ___ và từ khóa đáp án đúng cần điền.',
  },
  matching: {
    name: 'Ghép nối (Matching)',
    desc: 'Mỗi mục gồm Cột A (left) và Cột B (right) tương ứng.',
  },
  reorder: {
    name: 'Sắp xếp câu (Sentence Reordering)',
    desc: 'Mỗi câu gồm gợi ý đề bài và câu tiếng Anh hoàn chỉnh (sentence).',
  },
}

interface ValidationOutput {
  isValid: boolean
  error: string | null
  itemsCount: number
  data: {
    questions?: Array<{
      id?: string
      text?: string
      options?: string[]
      correctIndex?: number
      answer?: string
      sentence?: string
    }>
    pairs?: Array<{
      id?: string
      left: string
      right: string
    }>
  } | null
}

function validateBlockJson(raw: string, blockType: string): ValidationOutput {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { isValid: false, error: null, itemsCount: 0, data: null }
  }

  try {
    let parsed: unknown = JSON.parse(trimmed)

    if (
      !Array.isArray(parsed) &&
      typeof parsed === 'object' &&
      parsed !== null
    ) {
      const obj = parsed as Record<string, unknown>
      if (Array.isArray(obj.questions)) parsed = obj.questions
      else if (Array.isArray(obj.pairs)) parsed = obj.pairs
      else if (Array.isArray(obj.data)) parsed = obj.data
    }

    if (!Array.isArray(parsed)) {
      return {
        isValid: false,
        error:
          'Dữ liệu JSON phải là một mảng (Array) gồm các object [ { ... }, { ... } ]',
        itemsCount: 0,
        data: null,
      }
    }

    if (parsed.length === 0) {
      return {
        isValid: false,
        error: 'Mảng JSON không chứa câu hỏi nào.',
        itemsCount: 0,
        data: null,
      }
    }

    if (blockType === 'multiple_choice') {
      const questions: Array<{
        id?: string
        text: string
        options: string[]
        correctIndex: number
      }> = []

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i] as Record<string, unknown> | null
        if (!item || typeof item !== 'object') {
          return {
            isValid: false,
            error: `Câu số ${i + 1} không đúng định dạng object.`,
            itemsCount: 0,
            data: null,
          }
        }
        if (!item.text || typeof item.text !== 'string' || !item.text.trim()) {
          return {
            isValid: false,
            error: `Câu số ${i + 1} thiếu nội dung câu hỏi ('text').`,
            itemsCount: 0,
            data: null,
          }
        }
        if (!Array.isArray(item.options) || item.options.length < 2) {
          return {
            isValid: false,
            error: `Câu số ${i + 1} phải có mảng các đáp án ('options') ít nhất 2 phương án.`,
            itemsCount: 0,
            data: null,
          }
        }

        let correctIdx = 0
        if (
          typeof item.correctIndex === 'number' &&
          item.correctIndex >= 0 &&
          item.correctIndex < item.options.length
        ) {
          correctIdx = item.correctIndex
        } else if (typeof item.correctAnswer === 'string') {
          const letterMatch = item.correctAnswer.trim().toUpperCase()
          if (['A', 'B', 'C', 'D'].includes(letterMatch)) {
            correctIdx = letterMatch.charCodeAt(0) - 65
          } else {
            const foundIdx = item.options.findIndex(
              (opt: unknown) =>
                String(opt).trim().toLowerCase() === letterMatch.toLowerCase(),
            )
            if (foundIdx !== -1) correctIdx = foundIdx
          }
        }

        const rawOpts = item.options.map((opt: unknown) => String(opt ?? '').trim())
        const cleanedOpts = sanitizeMultipleChoiceOptions(rawOpts)
        questions.push({
          id: typeof item.id === 'string' ? item.id : undefined,
          text: String(item.text).trim(),
          options: cleanedOpts,
          correctIndex: Math.min(correctIdx, Math.max(0, cleanedOpts.length - 1)),
        })
      }

      return {
        isValid: true,
        error: null,
        itemsCount: questions.length,
        data: { questions },
      }
    }

    if (blockType === 'fill_blank') {
      const questions: Array<{
        id?: string
        text: string
        answer: string
      }> = []

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i] as Record<string, unknown> | null
        if (!item || typeof item !== 'object') {
          return {
            isValid: false,
            error: `Câu số ${i + 1} không đúng định dạng object.`,
            itemsCount: 0,
            data: null,
          }
        }
        if (!item.text || typeof item.text !== 'string' || !item.text.trim()) {
          return {
            isValid: false,
            error: `Câu số ${i + 1} thiếu nội dung câu hỏi ('text').`,
            itemsCount: 0,
            data: null,
          }
        }
        const answer = item.answer ?? item.correctAnswer
        if (
          answer === undefined ||
          answer === null ||
          String(answer).trim() === ''
        ) {
          return {
            isValid: false,
            error: `Câu số ${i + 1} thiếu đáp án đúng ('answer').`,
            itemsCount: 0,
            data: null,
          }
        }

        questions.push({
          id: typeof item.id === 'string' ? item.id : undefined,
          text: String(item.text).trim(),
          answer: String(answer).trim(),
        })
      }

      return {
        isValid: true,
        error: null,
        itemsCount: questions.length,
        data: { questions },
      }
    }

    if (blockType === 'matching') {
      const pairs: Array<{
        id?: string
        left: string
        right: string
      }> = []

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i] as Record<string, unknown> | null
        if (!item || typeof item !== 'object') {
          return {
            isValid: false,
            error: `Cặp số ${i + 1} không đúng định dạng object.`,
            itemsCount: 0,
            data: null,
          }
        }
        if (!item.left || String(item.left).trim() === '') {
          return {
            isValid: false,
            error: `Cặp số ${i + 1} thiếu nội dung Cột A ('left').`,
            itemsCount: 0,
            data: null,
          }
        }
        if (!item.right || String(item.right).trim() === '') {
          return {
            isValid: false,
            error: `Cặp số ${i + 1} thiếu nội dung Cột B ('right').`,
            itemsCount: 0,
            data: null,
          }
        }

        pairs.push({
          id: typeof item.id === 'string' ? item.id : undefined,
          left: String(item.left).trim(),
          right: String(item.right).trim(),
        })
      }

      return {
        isValid: true,
        error: null,
        itemsCount: pairs.length,
        data: { pairs },
      }
    }

    if (blockType === 'reorder') {
      const questions: Array<{
        id?: string
        text: string
        sentence: string
      }> = []

      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i] as Record<string, unknown> | null
        if (!item || typeof item !== 'object') {
          return {
            isValid: false,
            error: `Câu số ${i + 1} không đúng định dạng object.`,
            itemsCount: 0,
            data: null,
          }
        }
        const sentence = item.sentence ?? item.correctSentence
        if (!sentence || String(sentence).trim() === '') {
          return {
            isValid: false,
            error: `Câu số ${i + 1} thiếu câu hoàn chỉnh ('sentence').`,
            itemsCount: 0,
            data: null,
          }
        }

        questions.push({
          id: typeof item.id === 'string' ? item.id : undefined,
          text: item.text
            ? String(item.text).trim()
            : 'Sắp xếp các từ sau thành câu hoàn chỉnh:',
          sentence: String(sentence).trim(),
        })
      }

      return {
        isValid: true,
        error: null,
        itemsCount: questions.length,
        data: { questions },
      }
    }

    return {
      isValid: false,
      error: `Chưa hỗ trợ import JSON cho dạng ${blockType}`,
      itemsCount: 0,
      data: null,
    }
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e)
    return {
      isValid: false,
      error: `Lỗi cú pháp JSON: ${errorMsg}`,
      itemsCount: 0,
      data: null,
    }
  }
}

export default function ImportBlockJsonModal({
  isOpen,
  onClose,
  blockTitle,
  blockType,
  currentCount,
  onImport,
}: ImportBlockJsonModalProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace')
  const [hasCopied, setHasCopied] = useState(false)
  const [showSample, setShowSample] = useState(false)

  if (!isOpen) return null

  const sampleJson = TEMPLATE_JSON_SAMPLES[blockType] || '[]'
  const templateInfo = TEMPLATE_LABELS[blockType] || {
    name: blockType,
    desc: 'Nhập mảng câu hỏi dạng JSON.',
  }

  const validationResult = validateBlockJson(jsonInput, blockType)

  const handleCopySample = () => {
    navigator.clipboard.writeText(sampleJson)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  const handlePasteSampleToInput = () => {
    setJsonInput(sampleJson)
  }

  const handleConfirm = () => {
    if (!validationResult.isValid || !validationResult.data) return

    const finalizedData: {
      questions?: TestQuestion[]
      pairs?: MatchingPair[]
    } = {}

    if (validationResult.data.questions) {
      finalizedData.questions = validationResult.data.questions.map((q) => ({
        ...q,
        id: q.id || crypto.randomUUID(),
      }))
    }

    if (validationResult.data.pairs) {
      finalizedData.pairs = validationResult.data.pairs.map((p) => ({
        ...p,
        id: p.id || crypto.randomUUID(),
      }))
    }

    onImport(finalizedData, importMode)
    onClose()
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-[2rem] max-w-6xl w-full h-full shadow-2xl border border-gray-200/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/60 to-purple-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <FileCode2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Import JSON Câu Hỏi
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Dành cho:{' '}
                <span className="font-semibold text-indigo-700">
                  {blockTitle}
                </span>{' '}
                ({templateInfo.name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
          {/* Guide Alert */}
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles size={18} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-relaxed flex-1">
              <p className="font-bold mb-1">{templateInfo.name}</p>
              <p className="text-indigo-700">{templateInfo.desc}</p>
              <div className="mt-2 flex items-center gap-3">
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
                <span>Cấu trúc mẫu chuẩn ({blockType}.json)</span>
                <button
                  type="button"
                  onClick={handleCopySample}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-sans text-xs transition-colors"
                >
                  {hasCopied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{hasCopied ? 'Đã copy' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto custom-scrollbar max-h-48 leading-relaxed">
                {sampleJson}
              </pre>
            </div>
          )}

          {/* Import Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Chế độ Import
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  importMode === 'replace'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm">Ghi đè toàn bộ (Replace)</div>
                  <div className="text-[11px] text-gray-500 font-normal">
                    {currentCount > 0
                      ? `Xóa ${currentCount} câu hiện tại và thay thế mới`
                      : 'Tạo mới toàn bộ'}
                  </div>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                  importMode === 'append'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm">Thêm tiếp vào sau (Append)</div>
                  <div className="text-[11px] text-gray-500 font-normal">
                    Giữ {currentCount} câu cũ, thêm các câu mới vào cuối
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* JSON Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Dán mã JSON vào đây *
              </label>
              {jsonInput && (
                <button
                  type="button"
                  onClick={() => setJsonInput('')}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Xóa trắng
                </button>
              )}
            </div>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`Dán mảng JSON vào đây, ví dụ:\n${sampleJson.slice(0, 140)}...`}
              rows={9}
              className="w-full bg-gray-900 text-emerald-400 font-mono text-xs rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none custom-scrollbar leading-relaxed"
            />
          </div>

          {/* Validation Feedback */}
          {validationResult.error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-150">
              <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
              <span>{validationResult.error}</span>
            </div>
          )}

          {validationResult.isValid && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in duration-150">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>
                Cú pháp hợp lệ! Đã nhận diện thành công{' '}
                <strong>{validationResult.itemsCount}</strong>{' '}
                {blockType === 'matching' ? 'cặp ghép nối' : 'câu hỏi'}.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors text-sm shadow-2xs"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!validationResult.isValid}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2"
          >
            <Check size={16} />
            <span>
              {importMode === 'replace' ? 'Ghi đè' : 'Thêm'} (
              {validationResult.itemsCount || 0} câu)
            </span>
          </button>
        </div>
      </div>
      </div>
    </Portal>
  )
}
