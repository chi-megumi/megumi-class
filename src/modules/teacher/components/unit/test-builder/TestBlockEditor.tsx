'use client'

import React from 'react'
import { GripVertical, FileCode2, Trash2 } from 'lucide-react'
import MultipleChoiceEditor from './MultipleChoiceEditor'
import FillBlankEditor from './FillBlankEditor'
import MatchingEditor from './MatchingEditor'
import ReorderEditor from './ReorderEditor'
import { ReadingEditor } from './reading'
import type { TestBlock, VocabItemData } from '@/modules/teacher/types'

type TestBlockEditorProps = {
  block: TestBlock
  index: number
  isMiniChallenge: boolean
  isDragOver: boolean
  vocabItems?: VocabItemData[]
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragEnter: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  onDragOver: (e: React.DragEvent) => void
  onTitleChange: (newTitle: string) => void
  onOpenImportBlockJson: (blockId: string) => void
  onRemoveBlock: (blockId: string) => void
  onUpdateContent: (newContent: TestBlock['content']) => void
  onAddQuestionToBlock: (blockId: string) => void
}

function TestBlockEditor({
  block,
  index,
  isMiniChallenge,
  isDragOver,
  vocabItems,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDragOver,
  onTitleChange,
  onOpenImportBlockJson,
  onRemoveBlock,
  onUpdateContent,
  onAddQuestionToBlock,
}: TestBlockEditorProps) {
  return (
    <div
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      className={`bg-white rounded-2xl border ${
        isDragOver
          ? 'border-indigo-500 border-t-4'
          : isMiniChallenge
            ? 'border-orange-200'
            : 'border-gray-200'
      } overflow-hidden group scroll-contain-item`}
    >
      {/* Block Toolbar */}
      <div
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        className={`${
          isMiniChallenge ? 'bg-orange-50/50 border-orange-100' : 'bg-gray-50 border-gray-100'
        } border-b px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <GripVertical
            size={18}
            className={`${isMiniChallenge ? 'text-orange-300' : 'text-gray-400'} shrink-0`}
          />
          <span
            className={`font-bold shrink-0 ${
              isMiniChallenge ? 'text-orange-600' : 'text-gray-700'
            }`}
          >
            Phần {index + 1}:
          </span>
          <input
            type="text"
            value={(block.title || '').replace(/^Phần\s+\d+:\s*/i, '')}
            onChange={(e) => onTitleChange(e.target.value)}
            className={`font-bold bg-transparent border-b border-transparent focus:outline-none flex-1 py-1 px-2 transition-colors cursor-text truncate ${
              isMiniChallenge
                ? 'text-orange-700 focus:border-orange-400'
                : 'text-gray-700 focus:border-indigo-400'
            }`}
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking input
          />
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <button
            type="button"
            onClick={() => onOpenImportBlockJson(block.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
              isMiniChallenge
                ? 'bg-orange-100/80 hover:bg-orange-200/80 text-orange-800 border-orange-200'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
            title="Import danh sách câu hỏi từ JSON cho phần này"
          >
            <FileCode2 size={13} />
            <span>Import JSON</span>
          </button>
          <button
            onClick={() => onRemoveBlock(block.id)}
            className={`p-1.5 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
              isMiniChallenge ? 'text-orange-300' : 'text-gray-400'
            }`}
            title="Xóa phần này"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Block Content Editor */}
      <div className="p-6">
        {block.type === 'multiple_choice' && (
          <MultipleChoiceEditor
            block={block}
            isMiniChallenge={isMiniChallenge}
            onUpdateContent={onUpdateContent}
            onAddQuestion={() => onAddQuestionToBlock(block.id)}
          />
        )}

        {block.type === 'fill_blank' && (
          <FillBlankEditor
            block={block}
            isMiniChallenge={isMiniChallenge}
            onUpdateContent={onUpdateContent}
            onAddQuestion={() => onAddQuestionToBlock(block.id)}
          />
        )}

        {block.type === 'matching' && (
          <MatchingEditor
            block={block}
            isMiniChallenge={isMiniChallenge}
            onUpdateContent={onUpdateContent}
            onAddPair={() => onAddQuestionToBlock(block.id)}
          />
        )}

        {block.type === 'reorder' && (
          <ReorderEditor
            block={block}
            isMiniChallenge={isMiniChallenge}
            onUpdateContent={onUpdateContent}
            onAddQuestion={() => onAddQuestionToBlock(block.id)}
          />
        )}

        {block.type === 'reading' && (
          <ReadingEditor
            block={block}
            isMiniChallenge={isMiniChallenge}
            vocabItems={vocabItems}
            onUpdateContent={onUpdateContent}
            onAddQuestion={() => onAddQuestionToBlock(block.id)}
          />
        )}

        {block.type === 'listening' && (
          <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50">
            UI đang được hoàn thiện cho dạng bài này...
          </div>
        )}
      </div>
    </div>
  )
}

export default React.memo(TestBlockEditor)
