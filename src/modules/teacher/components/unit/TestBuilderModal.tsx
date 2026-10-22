'use client'

import React, { useState } from 'react'
import Portal from '@/components/common/Portal'
import ExamGeneratorModal from './ExamGeneratorModal'
import ImportBlockJsonModal from './ImportBlockJsonModal'
import ImportFullExamModal from './ImportFullExamModal'
import TestBuilderSidebar from './test-builder/TestBuilderSidebar'
import TestBuilderHeader from './test-builder/TestBuilderHeader'
import TestBuilderPaperHeader from './test-builder/TestBuilderPaperHeader'
import TestBlockPreview from './test-builder/TestBlockPreview'
import TestBlockEditor from './test-builder/TestBlockEditor'
import { useTestTimeEstimate } from './test-builder/useTestTimeEstimate'
import type {
  TemplateType,
  TestBuilderModalProps,
  ImportBlockData,
} from './test-builder/types'
import type { ExamData, TestBlock } from '@/modules/teacher/types'
import { sanitizeMultipleChoiceOptions } from '@/modules/teacher/utils/questionUtils'

export default function TestBuilderModal({
  unitId,
  classId,
  isClassExam,
  editingTestId,
  existingTests,
  vocabItems,
  unitTitle,
  initialExam,
  isReadOnly: isReadOnlyProp,
  onClose,
  onSaveSuccess,
}: TestBuilderModalProps) {
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

  const [blocks, setBlocks] = useState<TestBlock[]>(
    initialExam?.blocks ||
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
      onClose()
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

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id))
  }

  // --- DRAG AND DROP ---
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

  const importingBlock = blocks.find((b) => b.id === importingBlockId)

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-full h-full bg-[#f8f9fa] flex flex-col md:flex-row">
          {/* SIDEBAR: TEMPLATES (Hidden in Preview, ReadOnly, or when Collapsed) */}
          {!isReadOnly && !isPreview && isSidebarOpen && (
            <TestBuilderSidebar
              vocabItems={vocabItems}
              onOpenGenerator={() => setIsGeneratorOpen(true)}
              onOpenFullExamImport={() => setIsFullExamImportOpen(true)}
              onAddBlock={addBlock}
              onCloseSidebar={() => setIsSidebarOpen(false)}
              onCloseModal={onClose}
            />
          )}

          {/* MAIN CANVAS: TEST BUILDER */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            {/* Header */}
            <TestBuilderHeader
              testTitle={testTitle}
              onTitleChange={setTestTitle}
              testDuration={testDuration}
              onDurationChange={setTestDuration}
              isRetakable={isRetakable}
              onRetakableChange={setIsRetakable}
              isPreview={isPreview}
              onTogglePreview={() => !isReadOnly && setIsPreview(!isPreview)}
              isSidebarOpen={isSidebarOpen}
              onOpenSidebar={() => !isReadOnly && setIsSidebarOpen(true)}
              isSaving={isSaving}
              onSave={handleSave}
              onClose={onClose}
              onOpenFullExamImport={() => setIsFullExamImportOpen(true)}
              onOpenGenerator={() => setIsGeneratorOpen(true)}
              vocabItems={vocabItems}
              isReadOnly={isReadOnly}
            />

            {/* Canvas Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
              <div className="max-w-4xl mx-auto space-y-6 pb-32">
                {/* Time Warning */}
                {timeWarning && (
                  <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl shadow-sm text-sm font-semibold flex items-center gap-2">
                    <span className="text-xl">⏱️</span> {timeWarning} (Ước tính cần {estimatedMins}{' '}
                    phút)
                  </div>
                )}

                {/* Paper Header */}
                <TestBuilderPaperHeader
                  testTitle={testTitle}
                  testDuration={testDuration}
                  isRetakable={isRetakable}
                />

                {/* Blocks List */}
                {blocks.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                    <p className="text-gray-500 font-medium text-lg">
                      Chưa có phần nào trong đề thi.
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Hãy click vào các Template bên trái để thêm vào bài kiểm tra.
                    </p>
                  </div>
                ) : (
                  blocks.map((block, index) => {
                    if (isPreview || isReadOnly) {
                      return <TestBlockPreview key={block.id} block={block} index={index} />
                    }

                    return (
                      <TestBlockEditor
                        key={block.id}
                        block={block}
                        index={index}
                        isMiniChallenge={isMiniChallenge}
                        isDragOver={dragOverItemIndex === index}
                        onDragStart={handleDragStart}
                        onDragEnter={handleDragEnter}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onTitleChange={(newTitle) => updateBlockTitle(index, newTitle)}
                        onOpenImportBlockJson={setImportingBlockId}
                        onRemoveBlock={removeBlock}
                        onUpdateContent={(content) => updateBlockContent(block.id, content)}
                        onAddQuestionToBlock={addQuestionToBlock}
                      />
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Generator */}
        {!isReadOnly && isGeneratorOpen && vocabItems && (
          <ExamGeneratorModal
            isOpen={isGeneratorOpen}
            onClose={() => setIsGeneratorOpen(false)}
            vocabItems={vocabItems}
            unitTitle={unitTitle}
            onGenerated={(generated) => {
              setTestTitle(generated.title)
              setTestDuration(generated.duration)
              setBlocks(generated.blocks)
            }}
          />
        )}

        {/* Modal Import Full Exam */}
        {!isReadOnly && isFullExamImportOpen && (
          <ImportFullExamModal
            isOpen={isFullExamImportOpen}
            onClose={() => setIsFullExamImportOpen(false)}
            onImport={(data) => {
              if (data.title) setTestTitle(data.title)
              if (data.duration) setTestDuration(data.duration)
              if (typeof data.isRetakable === 'boolean') setIsRetakable(data.isRetakable)
              setBlocks(data.blocks)
            }}
          />
        )}

        {/* Modal Import JSON for Block */}
        {!isReadOnly && importingBlock && (
          <ImportBlockJsonModal
            isOpen={!!importingBlock}
            onClose={() => setImportingBlockId(null)}
            blockTitle={importingBlock.title || 'Phần thi'}
            blockType={importingBlock.type}
            currentCount={
              importingBlock.type === 'matching'
                ? importingBlock.content?.pairs?.length || 0
                : importingBlock.content?.questions?.length || 0
            }
            onImport={handleImportBlockData}
          />
        )}
      </div>
    </Portal>
  )
}
