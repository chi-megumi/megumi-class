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
import { TestBlock } from '../../types'
import { sanitizeMultipleChoiceOptions } from '../../utils/questionUtils'
import { ensureShuffledWords } from '../../utils/reorderUtils'
import { validateReadingJson } from './test-builder/reading/readingJsonValidator'
import Portal from '@/components/common/Portal'

interface ImportFullExamModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: {
    title?: string
    duration?: number
    isRetakable?: boolean
    blocks: TestBlock[]
  }) => void
}

const FULL_EXAM_SAMPLE = JSON.stringify(
  {
    title: 'Bài kiểm tra chất lượng giữa kỳ',
    duration: 45,
    isRetakable: true,
    blocks: [
      {
        type: 'multiple_choice',
        title: 'Part 1: Multiple Choice (Chọn đáp án đúng)',
        content: {
          questions: [
            {
              text: 'Which animal is known as the king of the jungle?',
              options: ['Tiger', 'Lion', 'Elephant', 'Giraffe'],
              correctIndex: 1,
            },
            {
              text: 'Water freezes at ___ degrees Celsius.',
              options: ['0', '32', '100', '-10'],
              correctIndex: 0,
            },
          ],
        },
      },
      {
        type: 'fill_blank',
        title: 'Part 2: Fill in the Blanks (Điền khuyết)',
        content: {
          questions: [
            {
              text: 'The sun rises in the ___ and sets in the west.',
              answer: 'east',
            },
          ],
        },
      },
      {
        type: 'matching',
        title: 'Part 3: Vocabulary Matching (Ghép nối từ)',
        content: {
          pairs: [
            { left: 'magnificent', right: 'tráng lệ, nguy nga' },
            { left: 'ancient', right: 'cổ kính, lâu đời' },
          ],
        },
      },
      {
        type: 'reorder',
        title: 'Part 4: Sentence Reordering (Sắp xếp câu)',
        content: {
          questions: [
            {
              text: 'Dịch: Chúng tôi đi dã ngoại vào cuối tuần.',
              sentence: 'We go on a picnic at the weekend.',
            },
          ],
        },
      },
    ],
  },
  null,
  2,
)

interface RawValidatedQuestion {
  id?: string
  text?: string
  options?: string[]
  correctIndex?: number
  answer?: string
  sentence?: string
  words?: string[]
}

interface RawValidatedPair {
  id?: string
  left: string
  right: string
}

interface RawValidatedBlock {
  id?: string
  type: string
  title: string
  content?: {
    questions?: RawValidatedQuestion[]
    pairs?: RawValidatedPair[]
  }
}

interface ValidationResult {
  isValid: boolean
  error: string | null
  blocksCount: number
  questionsCount: number
  data: {
    title?: string
    duration?: number
    isRetakable?: boolean
    blocks: RawValidatedBlock[]
  } | null
}

function validateFullExamJson(raw: string): ValidationResult {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { isValid: false, error: null, blocksCount: 0, questionsCount: 0, data: null }
  }

  try {
    const parsed: unknown = JSON.parse(trimmed)
    if (!parsed || typeof parsed !== 'object') {
      return {
        isValid: false,
        error: 'Dữ liệu JSON phải là một object chứa thông tin đề thi { title, duration, blocks: [...] }',
        blocksCount: 0,
        questionsCount: 0,
        data: null,
      }
    }

    const obj = parsed as Record<string, unknown>
    let rawBlocks: unknown = obj.blocks

    // If user pasted an array of blocks directly: [ { type: ..., content: ... } ]
    if (!rawBlocks && Array.isArray(parsed)) {
      rawBlocks = parsed
    }

    if (!Array.isArray(rawBlocks)) {
      return {
        isValid: false,
        error: "Đề thi phải có mảng các phần thi ('blocks').",
        blocksCount: 0,
        questionsCount: 0,
        data: null,
      }
    }

    if (rawBlocks.length === 0) {
      return {
        isValid: false,
        error: 'Mảng các phần thi (blocks) không được để trống.',
        blocksCount: 0,
        questionsCount: 0,
        data: null,
      }
    }

    const validatedBlocks: RawValidatedBlock[] = []
    let totalQuestions = 0

    for (let i = 0; i < rawBlocks.length; i++) {
      const b = rawBlocks[i] as Record<string, unknown> | null
      if (!b || typeof b !== 'object') {
        return {
          isValid: false,
          error: `Phần số ${i + 1} không đúng định dạng object.`,
          blocksCount: 0,
          questionsCount: 0,
          data: null,
        }
      }

      const type = String(b.type || 'multiple_choice').trim()
      const title = String(b.title || `Part ${i + 1}`).trim()
      const content = (b.content && typeof b.content === 'object' ? b.content : b) as Record<string, unknown>

      if (type === 'multiple_choice') {
        const rawQs = Array.isArray(content.questions) ? content.questions : []
        const qs: RawValidatedQuestion[] = rawQs.map((item: unknown) => {
          const q = item as Record<string, unknown> | null
          return {
            id: typeof q?.id === 'string' ? q.id : undefined,
            text: String(q?.text || '').trim(),
            options: sanitizeMultipleChoiceOptions(
              Array.isArray(q?.options)
                ? q.options.map((o: unknown) => String(o ?? '').trim())
                : ['', ''],
            ),
            correctIndex: typeof q?.correctIndex === 'number' ? q.correctIndex : 0,
          }
        })
        totalQuestions += qs.length
        validatedBlocks.push({
          id: typeof b.id === 'string' ? b.id : undefined,
          type,
          title,
          content: { questions: qs },
        })
      } else if (type === 'fill_blank') {
        const rawQs = Array.isArray(content.questions) ? content.questions : []
        const qs: RawValidatedQuestion[] = rawQs.map((item: unknown) => {
          const q = item as Record<string, unknown> | null
          return {
            id: typeof q?.id === 'string' ? q.id : undefined,
            text: String(q?.text || '').trim(),
            answer: String(q?.answer || q?.correctAnswer || '').trim(),
          }
        })
        totalQuestions += qs.length
        validatedBlocks.push({
          id: typeof b.id === 'string' ? b.id : undefined,
          type,
          title,
          content: { questions: qs },
        })
      } else if (type === 'matching') {
        const rawPairs = Array.isArray(content.pairs) ? content.pairs : []
        const pairs: RawValidatedPair[] = rawPairs.map((item: unknown) => {
          const p = item as Record<string, unknown> | null
          return {
            id: typeof p?.id === 'string' ? p.id : undefined,
            left: String(p?.left || '').trim(),
            right: String(p?.right || '').trim(),
          }
        })
        totalQuestions += pairs.length
        validatedBlocks.push({
          id: typeof b.id === 'string' ? b.id : undefined,
          type,
          title,
          content: { pairs },
        })
      } else if (type === 'reorder') {
        const rawQs = Array.isArray(content.questions) ? content.questions : []
        const qs: RawValidatedQuestion[] = rawQs.map((item: unknown) => {
          const q = item as Record<string, unknown> | null
          const sentence = String(q?.sentence || q?.correctSentence || '').trim()
          const importedWords =
            Array.isArray(q?.words) && q.words.every((w) => typeof w === 'string')
              ? (q.words as string[])
              : undefined

          return {
            id: typeof q?.id === 'string' ? q.id : undefined,
            text: String(q?.text || 'Sắp xếp các từ sau thành câu hoàn chỉnh:').trim(),
            sentence,
            words: ensureShuffledWords(sentence, importedWords),
          }
        })
        totalQuestions += qs.length
        validatedBlocks.push({
          id: typeof b.id === 'string' ? b.id : undefined,
          type,
          title,
          content: { questions: qs },
        })
      } else if (type === 'reading') {
        const readingRes = validateReadingJson(JSON.stringify(b.content || b))
        if (readingRes.isValid) {
          const qCount =
            readingRes.passages && readingRes.passages.length > 0
              ? readingRes.passages.reduce((acc, p) => acc + (p.questions?.length || 0), 0)
              : readingRes.questions.length
          totalQuestions += qCount
          validatedBlocks.push({
            id: typeof b.id === 'string' ? b.id : undefined,
            type: 'reading',
            title: title || readingRes.title || 'Bài tập Đọc hiểu (Reading)',
            content: {
              text: readingRes.text,
              questions: readingRes.questions,
              passages: readingRes.passages,
            },
          })
        } else {
          validatedBlocks.push({
            id: typeof b.id === 'string' ? b.id : undefined,
            type: 'reading',
            title,
            content: b.content || {},
          })
        }
      } else {
        validatedBlocks.push({
          id: typeof b.id === 'string' ? b.id : undefined,
          type,
          title,
          content: b.content || {},
        })
      }
    }

    return {
      isValid: true,
      error: null,
      blocksCount: validatedBlocks.length,
      questionsCount: totalQuestions,
      data: {
        title: typeof obj.title === 'string' ? obj.title.trim() : undefined,
        duration: typeof obj.duration === 'number' ? obj.duration : undefined,
        isRetakable: typeof obj.isRetakable === 'boolean' ? obj.isRetakable : undefined,
        blocks: validatedBlocks,
      },
    }
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e)
    return {
      isValid: false,
      error: `Lỗi cú pháp JSON: ${errorMsg}`,
      blocksCount: 0,
      questionsCount: 0,
      data: null,
    }
  }
}

export default function ImportFullExamModal({
  isOpen,
  onClose,
  onImport,
}: ImportFullExamModalProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [hasCopied, setHasCopied] = useState(false)
  const [showSample, setShowSample] = useState(false)

  if (!isOpen) return null

  const validationResult = validateFullExamJson(jsonInput)

  const handleCopySample = () => {
    navigator.clipboard.writeText(FULL_EXAM_SAMPLE)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  const handlePasteSample = () => {
    setJsonInput(FULL_EXAM_SAMPLE)
  }

  const handleConfirm = () => {
    if (!validationResult.isValid || !validationResult.data) return

    // Ensure all blocks and questions have UUIDs
    const finalizedBlocks: TestBlock[] = validationResult.data.blocks.map((b) => {
      const blockId = b.id || crypto.randomUUID()
      let updatedContent: TestBlock['content'] = {}

      if (b.type === 'matching' && b.content?.pairs) {
        updatedContent = {
          pairs: b.content.pairs.map((p) => ({
            id: p.id || crypto.randomUUID(),
            left: p.left,
            right: p.right,
          })),
        }
      } else if (b.type === 'reading') {
        updatedContent = {
          ...b.content,
          text: b.content?.text,
          passages: b.content?.passages?.map((p) => ({
            ...p,
            id: p.id || crypto.randomUUID(),
            questions: p.questions?.map((q) => ({
              ...q,
              id: q.id || crypto.randomUUID(),
            })),
          })),
          questions: b.content?.questions?.map((q) => ({
            ...q,
            id: q.id || crypto.randomUUID(),
          })),
        }
      } else if (b.content?.questions) {
        updatedContent = {
          ...b.content,
          questions: b.content.questions.map((q) => ({
            ...q,
            id: q.id || crypto.randomUUID(),
          })),
        }
      } else {
        updatedContent = { ...b.content }
      }

      return {
        id: blockId,
        type: b.type,
        title: b.title,
        content: updatedContent,
      }
    })

    onImport({
      title: validationResult.data.title,
      duration: validationResult.data.duration,
      isRetakable: validationResult.data.isRetakable,
      blocks: finalizedBlocks,
    })
    onClose()
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-[2rem] max-w-6xl w-full h-full shadow-2xl border border-gray-200/50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50/70 to-indigo-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-200">
              <FileCode2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Import Toàn Bộ Đề Thi (Full Exam JSON)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Nạp nhanh toàn bộ các phần thi (Part 1, 2, 3...) chỉ với một file JSON
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
          <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles size={18} className="text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-900 leading-relaxed flex-1">
              <p className="font-bold mb-1">Cấu trúc đề thi hoàn chỉnh</p>
              <p className="text-purple-700">
                Cho phép nhập tên đề thi, thời gian, chế độ làm lại (isRetakable) và danh sách tất cả các phần thi.
              </p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSample(!showSample)}
                  className="font-bold underline text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                >
                  {showSample ? 'Ẩn cấu trúc mẫu' : 'Xem cấu trúc JSON mẫu'}
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleCopySample}
                  className="font-bold inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                >
                  {hasCopied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                  <span>{hasCopied ? 'Đã copy mẫu!' : 'Copy mẫu JSON'}</span>
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={handlePasteSample}
                  className="font-bold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
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
                <span>Cấu trúc mẫu chuẩn: full_exam.json</span>
                <button
                  type="button"
                  onClick={handleCopySample}
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-sans text-xs transition-colors"
                >
                  {hasCopied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{hasCopied ? 'Đã copy' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto custom-scrollbar max-h-52 leading-relaxed">
                {FULL_EXAM_SAMPLE}
              </pre>
            </div>
          )}

          {/* JSON Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Dán mã JSON đề thi vào đây *
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
              placeholder={`Dán JSON đề thi vào đây...\nVí dụ:\n{\n  "title": "Bài kiểm tra",\n  "duration": 45,\n  "blocks": [ ... ]\n}`}
              rows={11}
              className="w-full bg-gray-900 text-emerald-400 font-mono text-xs rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none custom-scrollbar leading-relaxed"
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
                Cú pháp hợp lệ! Đã nhận diện <strong>{validationResult.blocksCount}</strong> phần thi
                với <strong>{validationResult.questionsCount}</strong> câu hỏi.
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
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center gap-2"
          >
            <Check size={16} />
            <span>Nạp Đề Thi ({validationResult.blocksCount || 0} phần)</span>
          </button>
        </div>
      </div>
      </div>
    </Portal>
  )
}
