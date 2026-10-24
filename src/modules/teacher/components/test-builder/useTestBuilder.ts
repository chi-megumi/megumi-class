'use client'

import React, { useState } from 'react'
import type { ExamData, TestBlock, TestQuestion } from '@/modules/teacher/types'
import { sanitizeMultipleChoiceOptions } from '@/modules/teacher/utils/questionUtils'
import { ensureShuffledWords } from '@/modules/teacher/utils/reorderUtils'
import { useTestTimeEstimate } from '../unit/test-builder/useTestTimeEstimate'
import type { TemplateType, ImportBlockData } from '../unit/test-builder/types'
import type { ReadingInteractionType } from '../unit/test-builder/reading'
import type { GeneratedExamResult } from '@/modules/teacher/utils/examGenerator'

export type UseTestBuilderOptions = {
  unitId?: string | null
  classId?: string | null
  isClassExam?: boolean
  editingTestId: string
  existingTests: ExamData[]
  initialExam?: ExamData | GeneratedExamResult
  isReadOnly?: boolean
  onClose?: () => void
  onSaveSuccess?: (exams: ExamData[]) => void
}

export function useTestBuilder({
  unitId,
  classId,
  isClassExam,
  editingTestId,
  existingTests,
  initialExam,
  isReadOnly: isReadOnlyProp,
  onClose,
  onSaveSuccess,
}: UseTestBuilderOptions) {
  const existingTest = existingTests.find((t) => t.id === editingTestId)
  const isReadOnly = isReadOnlyProp ?? existingTest?.isPublished ?? false

  const [isPreview, setIsPreview] = useState(isReadOnly)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isReadOnly)
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null)
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null)

  const [testTitle, setTestTitle] = useState(
    initialExam?.title || existingTest?.title || 'Bài kiểm tra mới',
  )
  const [testDuration, setTestDuration] = useState(
    initialExam?.duration || existingTest?.duration || 45,
  )
  const [isRetakable, setIsRetakable] = useState<boolean>(
    initialExam?.isRetakable ?? existingTest?.isRetakable ?? false,
  )
  const [importingBlockId, setImportingBlockId] = useState<string | null>(null)
  const [isFullExamImportOpen, setIsFullExamImportOpen] = useState(false)
  const [isReadingPickerOpen, setIsReadingPickerOpen] = useState(false)

  const initialBlocks = initialExam
    ? 'blocks' in initialExam
      ? initialExam.blocks
      : initialExam.content
    : undefined

  const [blocks, setBlocks] = useState<TestBlock[]>(
    initialBlocks ||
      existingTest?.content || [
        {
          id: 'b1',
          type: 'multiple_choice',
          title: 'Part 1: Choose the correct answer',
          content: {
            questions: [{ id: 'q1', text: '', options: ['', '', '', ''], correctIndex: 0 }],
          },
        },
      ],
  )

  const { estimatedMins, timeWarning } = useTestTimeEstimate(blocks, testDuration)
  const isMiniChallenge = Number(testDuration) <= 15

  const handleImportBlockData = (parsedData: ImportBlockData, mode: 'replace' | 'append') => {
    if (!importingBlockId) return

    setBlocks((prevBlocks) =>
      prevBlocks.map((b) => {
        if (b.id !== importingBlockId) return b

        if (b.type === 'matching' && parsedData.pairs) {
          const newPairs =
            mode === 'replace'
              ? parsedData.pairs
              : [...(b.content?.pairs || []), ...parsedData.pairs]
          return {
            ...b,
            content: {
              ...b.content,
              pairs: newPairs,
            },
          }
        }

        if (b.type === 'reading') {
          const newQuestions = parsedData.questions
            ? mode === 'replace'
              ? parsedData.questions
              : [...(b.content?.questions || []), ...parsedData.questions]
            : b.content?.questions

          return {
            ...b,
            content: {
              ...b.content,
              text: parsedData.text !== undefined ? parsedData.text : b.content?.text,
              questions: newQuestions,
            },
          }
        }

        if (parsedData.questions) {
          const newQuestions =
            mode === 'replace'
              ? parsedData.questions
              : [...(b.content?.questions || []), ...parsedData.questions]
          return {
            ...b,
            content: {
              ...b.content,
              questions: newQuestions,
            },
          }
        }

        return b
      }),
    )
  }

  const handleSave = async () => {
    if (isReadOnly) return
    try {
      setIsSaving(true)

      const sanitizedBlocks = blocks.map((b) => {
        if (b.type === 'multiple_choice' && b.content?.questions) {
          return {
            ...b,
            content: {
              ...b.content,
              questions: b.content.questions.map((q) => {
                const cleanedOpts = sanitizeMultipleChoiceOptions(q.options)
                const maxIdx = Math.max(0, cleanedOpts.length - 1)
                return {
                  ...q,
                  options: cleanedOpts,
                  correctIndex:
                    typeof q.correctIndex === 'number' && q.correctIndex <= maxIdx
                      ? q.correctIndex
                      : 0,
                }
              }),
            },
          }
        }
        if (b.type === 'reorder' && b.content?.questions) {
          return {
            ...b,
            content: {
              ...b.content,
              questions: b.content.questions.map((q) => ({
                ...q,
                words: ensureShuffledWords(q.sentence, q.words),
              })),
            },
          }
        }
        return b
      })

      let newTests = [...existingTests]
      const currentTest: ExamData = {
        id: existingTest?.id || 'temp-' + crypto.randomUUID(),
        title: testTitle,
        duration: Number(testDuration),
        isEnabled: existingTest?.isEnabled ?? false,
        isPublished: existingTest?.isPublished ?? false,
        isRetakable: isRetakable,
        content: sanitizedBlocks,
        classId: classId || null,
        unitId: isClassExam ? null : unitId || null,
      }

      if (editingTestId === 'new') {
        newTests.unshift(currentTest)
      } else {
        newTests = newTests.map((t) => (t.id === editingTestId ? currentTest : t))
      }

      let res: { success: boolean; exams?: unknown[] }
      if (isClassExam && classId) {
        const { updateClassExams } = await import('@/actions/class')
        res = await updateClassExams(classId, newTests)
      } else if (unitId) {
        const { updateUnitExams } = await import('@/actions/class')
        res = await updateUnitExams(unitId, newTests)
      } else {
        throw new Error('Thiếu thông tin unitId hoặc classId')
      }

      if (res.success && res.exams) {
        if (onSaveSuccess) onSaveSuccess(res.exams as unknown as ExamData[])
      } else {
        if (onSaveSuccess) onSaveSuccess(newTests)
      }
      onClose?.()
    } catch (e) {
      console.error(e)
      alert('Lỗi lưu đề thi')
    } finally {
      setIsSaving(false)
    }
  }

  const addBlock = (type: TemplateType, title: string) => {
    let content: TestBlock['content'] = {}
    if (type === 'multiple_choice') {
      content = {
        questions: [{ id: crypto.randomUUID(), text: '', options: ['', '', '', ''], correctIndex: 0 }],
      }
    } else if (type === 'fill_blank') {
      content = { questions: [{ id: crypto.randomUUID(), text: '', answer: '' }] }
    } else if (type === 'matching') {
      content = {
        pairs: [
          { id: crypto.randomUUID(), left: '', right: '' },
          { id: crypto.randomUUID(), left: '', right: '' },
          { id: crypto.randomUUID(), left: '', right: '' },
        ],
      }
    } else if (type === 'reorder') {
      content = {
        questions: [{ id: crypto.randomUUID(), text: '', sentence: '' }],
      }
    }
    setBlocks([...blocks, { id: crypto.randomUUID(), type, title, content }])
  }

  const handleSelectReadingTypeToManual = (typesInput: ReadingInteractionType[] | ReadingInteractionType) => {
    const types = Array.isArray(typesInput) ? typesInput : [typesInput]
    if (types.length === 0) return

    const questions: TestQuestion[] = types.map((type, idx) => {
      switch (type) {
        case 'multiple_choice':
          return {
            id: crypto.randomUUID(),
            text: '',
            options: ['', '', '', ''],
            correctIndex: 0,
            kind: 'multiple_choice' as const,
          }
        case 'true_false':
          return {
            id: crypto.randomUUID(),
            text: '',
            options: ['True', 'False', 'Not Given'],
            correctIndex: 0,
            kind: 'true_false' as const,
          }
        case 'cloze':
          return {
            id: crypto.randomUUID(),
            text: `Chọn từ thích hợp cho vị trí (${idx + 1}):`,
            options: ['', '', '', ''],
            correctIndex: 0,
            kind: 'cloze_choice' as const,
          }
        case 'matching_heading':
          return {
            id: crypto.randomUUID(),
            text: 'Chọn tiêu đề cho đoạn văn:',
            options: ['', '', '', ''],
            correctIndex: 0,
            kind: 'matching_heading' as const,
          }
        case 'sentence_insertion':
          return {
            id: crypto.randomUUID(),
            text: 'Xem xét câu văn sau:',
            sentence: '',
            options: ['[A]', '[B]', '[C]', '[D]'],
            correctIndex: 0,
            kind: 'sentence_insertion' as const,
          }
        case 'short_answer':
          return {
            id: crypto.randomUUID(),
            text: '',
            answer: '',
            kind: 'short_answer' as const,
          }
        default:
          return {
            id: crypto.randomUUID(),
            text: '',
            options: ['', '', '', ''],
            correctIndex: 0,
            kind: 'multiple_choice' as const,
          }
      }
    })

    let title = 'Part: Đọc hiểu văn bản'
    if (types.length === 1) {
      const type = types[0]
      if (type === 'multiple_choice') title = 'Part: Đọc hiểu trắc nghiệm (Reading Comprehension)'
      else if (type === 'true_false') title = 'Part: True / False / Not Given'
      else if (type === 'cloze') title = 'Part: Cloze Test (Đục lỗ điền từ)'
      else if (type === 'matching_heading') title = 'Part: Matching Headings (Ghép tiêu đề đoạn)'
      else if (type === 'sentence_insertion') title = 'Part: Sentence Insertion (Chèn câu)'
      else if (type === 'short_answer') title = 'Part: Short Answer & Summary Completion'
    } else {
      title = `Part: Đọc hiểu tổng hợp (Mix ${types.length} dạng câu hỏi)`
    }

    let sampleText = ''
    if (types.includes('cloze')) {
      sampleText = 'Nội dung bài đọc... (1)______'
    } else if (types.includes('matching_heading')) {
      sampleText = 'Paragraph A: ...\n\nParagraph B: ...'
    } else if (types.includes('sentence_insertion')) {
      sampleText = 'Đoạn văn có vị trí [A] ... [B] ... [C] ... [D]'
    }

    setBlocks([...blocks, { id: crypto.randomUUID(), type: 'reading', title, content: { text: sampleText, questions } }])
  }

  const handleImportReadingJson = (data: { text?: string; questions?: TestQuestion[] }) => {
    setBlocks([
      ...blocks,
      {
        id: crypto.randomUUID(),
        type: 'reading',
        title: 'Part: Đọc hiểu văn bản',
        content: {
          text: data.text || '',
          questions: data.questions || [],
        },
      },
    ])
  }

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id))
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragItemIndex(index)
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
    }
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverItemIndex(index)
  }

  const handleDragEnd = () => {
    if (
      dragItemIndex !== null &&
      dragOverItemIndex !== null &&
      dragItemIndex !== dragOverItemIndex
    ) {
      const newBlocks = [...blocks]
      const draggedItem = newBlocks.splice(dragItemIndex, 1)[0]
      newBlocks.splice(dragOverItemIndex, 0, draggedItem)
      setBlocks(newBlocks)
    }
    setDragItemIndex(null)
    setDragOverItemIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const addQuestionToBlock = (blockId: string) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId) {
          if (b.type === 'multiple_choice') {
            return {
              ...b,
              content: {
                ...b.content,
                questions: [
                  ...(b.content?.questions || []),
                  { id: crypto.randomUUID(), text: '', options: ['', '', '', ''], correctIndex: 0 },
                ],
              },
            }
          } else if (b.type === 'fill_blank') {
            const currentQs =
              b.content?.questions && b.content.questions.length > 0
                ? b.content.questions
                : b.content?.text
                  ? [{ id: b.id, text: b.content.text, answer: b.content.answer || '' }]
                  : []
            return {
              ...b,
              content: {
                ...b.content,
                questions: [...currentQs, { id: crypto.randomUUID(), text: '', answer: '' }],
              },
            }
          } else if (b.type === 'matching') {
            const currentPairs = b.content?.pairs || []
            return {
              ...b,
              content: {
                ...b.content,
                pairs: [...currentPairs, { id: crypto.randomUUID(), left: '', right: '' }],
              },
            }
          } else if (b.type === 'reorder') {
            const currentQs = b.content?.questions || []
            return {
              ...b,
              content: {
                ...b.content,
                questions: [...currentQs, { id: crypto.randomUUID(), text: '', sentence: '' }],
              },
            }
          }
        }
        return b
      }),
    )
  }

  const updateBlockContent = (blockId: string, newContent: TestBlock['content']) => {
    setBlocks(blocks.map((b) => (b.id === blockId ? { ...b, content: newContent } : b)))
  }

  const updateBlockTitle = (index: number, newTitle: string) => {
    const newBlocks = [...blocks]
    newBlocks[index].title = newTitle
    setBlocks(newBlocks)
  }

  return {
    blocks,
    setBlocks,
    testTitle,
    setTestTitle,
    testDuration,
    setTestDuration,
    isRetakable,
    setIsRetakable,
    isPreview,
    setIsPreview,
    isSaving,
    isSidebarOpen,
    setIsSidebarOpen,
    dragItemIndex,
    dragOverItemIndex,
    importingBlockId,
    setImportingBlockId,
    isGeneratorOpen,
    setIsGeneratorOpen,
    isFullExamImportOpen,
    setIsFullExamImportOpen,
    isReadingPickerOpen,
    setIsReadingPickerOpen,
    estimatedMins,
    timeWarning,
    isMiniChallenge,
    isReadOnly,
    handleSave,
    addBlock,
    removeBlock,
    updateBlockContent,
    updateBlockTitle,
    addQuestionToBlock,
    handleImportBlockData,
    handleSelectReadingTypeToManual,
    handleImportReadingJson,
    handleDragStart,
    handleDragEnter,
    handleDragEnd,
    handleDragOver,
  }
}
