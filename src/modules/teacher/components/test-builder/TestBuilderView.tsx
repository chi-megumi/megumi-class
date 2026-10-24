'use client'

import React from 'react'
import ExamGeneratorModal from '../unit/ExamGeneratorModal'
import ImportBlockJsonModal from '../unit/ImportBlockJsonModal'
import ImportFullExamModal from '../unit/ImportFullExamModal'
import TestBuilderSidebar from '../unit/test-builder/TestBuilderSidebar'
import TestBuilderHeader from '../unit/test-builder/TestBuilderHeader'
import TestBuilderPaperHeader from '../unit/test-builder/TestBuilderPaperHeader'
import TestBlockPreview from '../unit/test-builder/TestBlockPreview'
import TestBlockEditor from '../unit/test-builder/TestBlockEditor'
import { ReadingTypePickerModal } from '../unit/test-builder/reading'
import { useTestBuilder, type UseTestBuilderOptions } from './useTestBuilder'
import type { TestBlock, VocabItemData } from '@/modules/teacher/types'

export type TestBuilderViewProps = UseTestBuilderOptions & {
  vocabItems?: VocabItemData[]
  unitTitle?: string
}

export default function TestBuilderView(props: TestBuilderViewProps) {
  const { vocabItems, unitTitle, onClose, isReadOnly } = props

  const {
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
  } = useTestBuilder(props)

  const importingBlock = blocks.find((b) => b.id === importingBlockId)

  return (
    <div className="w-full h-full bg-[#f8f9fa] flex flex-col md:flex-row flex-1 min-h-0">
      {/* SIDEBAR: TEMPLATES */}
      {!isReadOnly && !isPreview && isSidebarOpen && (
        <TestBuilderSidebar
          vocabItems={vocabItems}
          onOpenGenerator={() => setIsGeneratorOpen(true)}
          onOpenFullExamImport={() => setIsFullExamImportOpen(true)}
          onAddBlock={addBlock}
          onOpenReadingPicker={() => setIsReadingPickerOpen(true)}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onCloseModal={() => onClose?.()}
        />
      )}

      {/* MAIN CANVAS */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50 min-h-0">
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
          onClose={() => onClose?.()}
          onOpenFullExamImport={() => setIsFullExamImportOpen(true)}
          onOpenGenerator={() => setIsGeneratorOpen(true)}
          vocabItems={vocabItems}
          isReadOnly={isReadOnly}
        />

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6 pb-32">
            {timeWarning && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl shadow-sm text-sm font-semibold flex items-center gap-2">
                <span className="text-xl">⏱️</span> {timeWarning} (Ước tính cần {estimatedMins} phút)
              </div>
            )}

            <TestBuilderPaperHeader
              testTitle={testTitle}
              testDuration={testDuration}
              isRetakable={isRetakable}
            />

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
                    vocabItems={vocabItems}
                    onDragStart={handleDragStart}
                    onDragEnter={handleDragEnter}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onTitleChange={(newTitle: string) => updateBlockTitle(index, newTitle)}
                    onOpenImportBlockJson={setImportingBlockId}
                    onRemoveBlock={removeBlock}
                    onUpdateContent={(content: TestBlock['content']) => updateBlockContent(block.id, content)}
                    onAddQuestionToBlock={addQuestionToBlock}
                  />
                )
              })
            )}
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
            if (generated.title) setTestTitle(generated.title)
            if (generated.duration) setTestDuration(generated.duration)
            if (generated.blocks && generated.blocks.length > 0) {
              setBlocks(generated.blocks)
            }
            setIsGeneratorOpen(false)
          }}
        />
      )}

      {/* Modal Import Full Exam */}
      {!isReadOnly && isFullExamImportOpen && (
        <ImportFullExamModal
          isOpen={isFullExamImportOpen}
          onClose={() => setIsFullExamImportOpen(false)}
          onImport={(importedExam) => {
            if (importedExam.title) setTestTitle(importedExam.title)
            if (importedExam.duration) setTestDuration(importedExam.duration)
            if (importedExam.blocks && importedExam.blocks.length > 0) {
              setBlocks(importedExam.blocks)
            }
            setIsFullExamImportOpen(false)
          }}
        />
      )}

      {/* Modal Import Single Block */}
      {!isReadOnly && !!importingBlockId && importingBlock && (
        <ImportBlockJsonModal
          isOpen={!!importingBlockId}
          blockTitle={importingBlock.title || 'Phần thi'}
          blockType={importingBlock.type}
          currentCount={
            importingBlock.type === 'matching'
              ? (importingBlock.content?.pairs?.length || 0)
              : (importingBlock.content?.questions?.length || 0)
          }
          onClose={() => setImportingBlockId(null)}
          onImport={handleImportBlockData}
        />
      )}

      {/* Modal Reading Picker */}
      {!isReadOnly && isReadingPickerOpen && (
        <ReadingTypePickerModal
          isOpen={isReadingPickerOpen}
          vocabItems={vocabItems}
          unitTitle={unitTitle}
          onClose={() => setIsReadingPickerOpen(false)}
          onSelectTypeToManual={handleSelectReadingTypeToManual}
          onImportJson={handleImportReadingJson}
        />
      )}
    </div>
  )
}
