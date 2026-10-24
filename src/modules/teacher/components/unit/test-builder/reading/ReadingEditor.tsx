'use client'

import React, { useState } from 'react'
import { Sparkles, BookOpen, FileCode2, Eye, Edit3 } from 'lucide-react'
import ReadingPassageCard from './ReadingPassageCard'
import ReadingTypePickerModal from './ReadingTypePickerModal'
import ReadingBlockPreview from './ReadingBlockPreview'
import type {
  ReadingEditorProps,
  ReadingPassageItem,
  ReadingQuestionExtended,
  ReadingInteractionType,
  ReadingImportJsonData,
} from './types'
import type { TestBlock } from '@/modules/teacher/types'

// Chuẩn hóa passages từ content (backward compatible)
function getInitialPassages(content?: TestBlock['content']): ReadingPassageItem[] {
  const contentAny = content as { passages?: ReadingPassageItem[] } | undefined
  if (contentAny?.passages && Array.isArray(contentAny.passages) && contentAny.passages.length > 0) {
    return contentAny.passages
  }

  // Nếu có dữ liệu dạng 1 bài đọc cũ
  if (content?.text || (content?.questions && content.questions.length > 0)) {
    return [
      {
        id: crypto.randomUUID(),
        title: 'Bài đọc 1',
        text: content.text || '',
        questions: (content.questions || []) as ReadingQuestionExtended[],
      },
    ]
  }

  // Mặc định tạo bài đọc 1
  return [
    {
      id: crypto.randomUUID(),
      title: 'Bài đọc 1',
      text: '',
      questions: [
        {
          id: crypto.randomUUID(),
          text: 'Câu hỏi 1:',
          options: ['', '', '', ''],
          correctIndex: 0,
          kind: 'multiple_choice',
        },
      ],
    },
  ]
}

export default function ReadingEditor({
  block,
  isMiniChallenge,
  vocabItems = [],
  onUpdateContent,
}: ReadingEditorProps) {
  const [isAddPassageModalOpen, setIsAddPassageModalOpen] = useState(false)
  const [pickerInitialTab, setPickerInitialTab] = useState<'prompt' | 'json' | 'paste'>('prompt')
  const [isEditorPreview, setIsEditorPreview] = useState(false)

  const passages = getInitialPassages(block.content)

  // Đồng bộ passages lên block content
  const handleUpdatePassages = (newPassages: ReadingPassageItem[]) => {
    onUpdateContent({
      ...block.content,
      passages: newPassages,
      // Đồng bộ backward compatibility cho các hệ thống cần text/questions gộp
      text: newPassages[0]?.text || '',
      questions: newPassages.flatMap((p) => p.questions),
    } as TestBlock['content'])
  }

  // Cập nhật 1 bài đọc cụ thể
  const handleUpdateSinglePassage = (index: number, updated: ReadingPassageItem) => {
    const next = passages.map((p, idx) => (idx === index ? updated : p))
    handleUpdatePassages(next)
  }

  // Xóa 1 bài đọc
  const handleRemovePassage = (index: number) => {
    const next = passages.filter((_, idx) => idx !== index)
    handleUpdatePassages(next)
  }

  // Thêm bài đọc mới từ Modal chọn định dạng (hỗ trợ cả 1 dạng hoặc Mix nhiều dạng)
  const handleAddNewPassageFromTypes = (types: ReadingInteractionType[]) => {
    const nextPassageIndex = passages.length + 1
    const activeTypes = types.length > 0 ? types : ['multiple_choice']

    const questions: ReadingQuestionExtended[] = activeTypes.map((t, idx) => {
      const qIdx = idx + 1
      if (t === 'true_false') {
        return {
          id: crypto.randomUUID(),
          text: `Câu ${qIdx}: Nhận định...`,
          options: ['True', 'False', 'Not Given'],
          correctIndex: 0,
          kind: 'true_false',
        }
      } else if (t === 'cloze') {
        return {
          id: crypto.randomUUID(),
          text: `Chọn từ thích hợp cho vị trí (${qIdx}):`,
          options: ['', '', '', ''],
          correctIndex: 0,
          kind: 'cloze_choice',
        }
      } else if (t === 'matching_heading') {
        return {
          id: crypto.randomUUID(),
          text: `Chọn tiêu đề cho Paragraph ${String.fromCharCode(64 + qIdx)}:`,
          options: ['', '', '', ''],
          correctIndex: 0,
          kind: 'matching_heading',
        }
      } else if (t === 'sentence_insertion') {
        return {
          id: crypto.randomUUID(),
          text: `Câu ${qIdx}: Xem xét câu văn sau:`,
          sentence: '',
          options: ['[A]', '[B]', '[C]', '[D]'],
          correctIndex: 0,
          kind: 'sentence_insertion',
        }
      } else if (t === 'short_answer') {
        return {
          id: crypto.randomUUID(),
          text: `Câu hỏi ${qIdx}:`,
          answer: '',
          kind: 'short_answer',
        }
      }
      return {
        id: crypto.randomUUID(),
        text: `Câu hỏi ${qIdx}:`,
        options: ['', '', '', ''],
        correctIndex: 0,
        kind: 'multiple_choice',
      }
    })

    let text = 'Nội dung bài đọc tiếng Anh...'
    if (activeTypes.includes('matching_heading')) {
      text = 'Paragraph A: ...\n\nParagraph B: ...'
    }
    if (activeTypes.includes('cloze')) {
      text += ' (1)______'
    }
    if (activeTypes.includes('sentence_insertion')) {
      text += ' [A] ... [B] ... [C] ... [D]'
    }

    const title =
      activeTypes.length > 1
        ? `Bài đọc ${nextPassageIndex} (Mix ${activeTypes.length} dạng)`
        : `Bài đọc ${nextPassageIndex}`

    const newPassage: ReadingPassageItem = {
      id: crypto.randomUUID(),
      title,
      text,
      questions,
    }

    handleUpdatePassages([...passages, newPassage])
  }

  // Thêm bài đọc mới từ JSON AI (hỗ trợ cả 1 bài hoặc nhiều bài đọc đồng thời)
  const handleAddNewPassageFromJson = (data: ReadingImportJsonData) => {
    if (data.passages && data.passages.length > 0) {
      const startIndex = passages.length + 1
      const newItems: ReadingPassageItem[] = data.passages.map((p, idx) => ({
        id: crypto.randomUUID(),
        title: p.title || `Bài đọc ${startIndex + idx}`,
        text: p.text || '',
        questions: (p.questions || []) as ReadingQuestionExtended[],
      }))
      handleUpdatePassages([...passages, ...newItems])
      return
    }

    const nextPassageIndex = passages.length + 1
    const newPassage: ReadingPassageItem = {
      id: crypto.randomUUID(),
      title: data.title || `Bài đọc ${nextPassageIndex}`,
      text: data.text || '',
      questions: (data.questions || []) as ReadingQuestionExtended[],
    }
    handleUpdatePassages([...passages, newPassage])
  }

  return (
    <div className="space-y-6">
      {/* Header tóm tắt & thanh công cụ chuyển đổi Soạn thảo / Xem trước */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-gray-700">
            <BookOpen size={15} className={isMiniChallenge ? 'text-orange-500' : 'text-indigo-600'} />
            <span>Tổng cộng: {passages.length} bài đọc trong phần này</span>
          </div>

          {/* Toggle Chỉnh sửa vs Xem trước bài đọc */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsEditorPreview(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                !isEditorPreview
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Edit3 size={13} />
              <span>Soạn thảo</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditorPreview(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                isEditorPreview
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Eye size={13} />
              <span>Xem trước</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditorPreview && (
            <button
              type="button"
              onClick={() => {
                setPickerInitialTab('paste')
                setIsAddPassageModalOpen(true)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
              title="Nhập dữ liệu bài đọc và câu hỏi từ JSON"
            >
              <FileCode2 size={13} />
              <span>Import JSON Bài Đọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Hiển thị chế độ Xem trước bài đọc trực tiếp */}
      {isEditorPreview ? (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between">
            <span>👁️ Bạn đang xem giao diện xem trước bài kiểm tra phần đọc hiểu.</span>
            <button
              type="button"
              onClick={() => setIsEditorPreview(false)}
              className="text-emerald-700 hover:underline font-bold"
            >
              ← Quay lại chỉnh sửa
            </button>
          </div>
          <ReadingBlockPreview block={block} isMiniChallenge={isMiniChallenge} />
        </div>
      ) : (
        /* Danh sách các bài đọc (Passages) ở chế độ soạn thảo */
        <>
          <div className="space-y-6">
            {passages.map((passage, pIdx) => (
              <ReadingPassageCard
                key={passage.id || `passage-${pIdx}`}
                passage={passage}
                index={pIdx}
                totalCount={passages.length}
                isMiniChallenge={isMiniChallenge}
                vocabItems={vocabItems}
                onUpdatePassage={(updated) => handleUpdateSinglePassage(pIdx, updated)}
                onRemovePassage={() => handleRemovePassage(pIdx)}
              />
            ))}
          </div>

          {/* Nút thêm bài đọc mới: Mở Modal chọn định dạng & Prompt AI */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setPickerInitialTab('prompt')
                setIsAddPassageModalOpen(true)
              }}
              className={`w-full py-3.5 px-4 rounded-2xl border-2 border-dashed font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xs ${
                isMiniChallenge
                  ? 'border-orange-300 text-orange-700 bg-orange-50/50 hover:bg-orange-100/60 hover:border-orange-400'
                  : 'border-indigo-300 text-indigo-700 bg-indigo-50/40 hover:bg-indigo-100/60 hover:border-indigo-400'
              }`}
            >
              <Sparkles size={16} className={isMiniChallenge ? 'text-orange-600' : 'text-indigo-600'} />
              <span>+ Thêm Bài Đọc Mới (Kèm Prompt AI & Định Dạng Mẫu)</span>
            </button>
          </div>
        </>
      )}

      {/* Modal Prompt AI & Chọn dạng bài đọc mới */}
      {isAddPassageModalOpen && (
        <ReadingTypePickerModal
          key={`reading-picker-${pickerInitialTab}`}
          isOpen={isAddPassageModalOpen}
          initialTab={pickerInitialTab}
          passageIndex={passages.length}
          vocabItems={vocabItems}
          unitTitle={block.title}
          onClose={() => setIsAddPassageModalOpen(false)}
          onSelectTypeToManual={handleAddNewPassageFromTypes}
          onImportJson={handleAddNewPassageFromJson}
        />
      )}
    </div>
  )
}
