'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import ReadingQuestionItem from './ReadingQuestionItem'
import type { ReadingQuestionListProps, ReadingQuestionExtended, ReadingQuestionKind } from './types'

export default function ReadingQuestionList({
  questions,
  isMiniChallenge,
  onUpdateQuestions,
  onAddQuestion,
}: ReadingQuestionListProps) {
  const handleUpdateItem = (
    index: number,
    updater: (prev: ReadingQuestionExtended) => ReadingQuestionExtended,
  ) => {
    const updated = questions.map((q, idx) => (idx === index ? updater(q) : q))
    onUpdateQuestions(updated)
  }

  const handleRemoveItem = (index: number) => {
    const updated = questions.filter((_, idx) => idx !== index)
    onUpdateQuestions(updated)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Danh sách câu hỏi bài đọc ({questions.length})
        </span>
      </div>

      {/* Danh sách các câu hỏi */}
      <div className="space-y-3">
        {questions.map((question, qIdx) => (
          <ReadingQuestionItem
            key={question.id || `rq-${qIdx}`}
            question={question}
            index={qIdx}
            totalCount={questions.length}
            isMiniChallenge={isMiniChallenge}
            onChangeQuestionText={(text) =>
              handleUpdateItem(qIdx, (prev) => ({ ...prev, text }))
            }
            onChangeKind={(kind: ReadingQuestionKind) =>
              handleUpdateItem(qIdx, (prev) => ({ ...prev, kind }))
            }
            onChangeOptions={(options) =>
              handleUpdateItem(qIdx, (prev) => ({ ...prev, options }))
            }
            onChangeCorrectIndex={(correctIndex) =>
              handleUpdateItem(qIdx, (prev) => ({ ...prev, correctIndex }))
            }
            onChangeAnswerText={(answer) =>
              handleUpdateItem(qIdx, (prev) => ({ ...prev, answer }))
            }
            onChangeSentenceToInsert={(sentence) =>
              handleUpdateItem(qIdx, (prev) => ({ ...prev, sentence }))
            }
            onChangeExplanation={(explanation) =>
              handleUpdateItem(qIdx, (prev) => ({ ...prev, explanation }))
            }
            onRemove={() => handleRemoveItem(qIdx)}
          />
        ))}
      </div>

      {/* Nút thêm câu hỏi */}
      <button
        type="button"
        onClick={onAddQuestion}
        className={`w-full py-3 border-2 border-dashed rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          isMiniChallenge
            ? 'border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300'
            : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300'
        }`}
      >
        <Plus size={18} />
        <span>Thêm câu hỏi cho bài đọc</span>
      </button>
    </div>
  )
}
