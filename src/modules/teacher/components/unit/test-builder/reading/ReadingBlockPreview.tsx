'use client'

import React, { useState, useMemo } from 'react'
import type { TestBlock } from '@/modules/teacher/types'
import { ReadingBlock } from '@/modules/student/components/unit/test-view/reading'
import type { ReadingPassageItemView } from '@/modules/student/components/unit/test-view/reading/types'
import type { ReadingPassageItem } from './types'

export type ReadingBlockPreviewProps = {
  block: TestBlock
  isMiniChallenge?: boolean
  defaultLayout?: 'split' | 'stacked'
  showControls?: boolean
}

// Chuẩn hóa passages từ content
function extractPassages(block: TestBlock): ReadingPassageItem[] {
  const content = block.content
  const contentAny = content as { passages?: ReadingPassageItem[] } | undefined

  if (
    contentAny?.passages &&
    Array.isArray(contentAny.passages) &&
    contentAny.passages.length > 0
  ) {
    return contentAny.passages
  }

  if (content?.text || (content?.questions && content.questions.length > 0)) {
    return [
      {
        id: 'default-passage',
        title: (block.title || 'Bài đọc hiểu').replace(/^Phần\s+\d+:\s*/i, ''),
        text: content.text || '',
        questions: (content.questions || []) as ReadingPassageItem['questions'],
      },
    ]
  }

  return []
}

export default function ReadingBlockPreview({
  block,
  isMiniChallenge = false,
  defaultLayout = 'split',
  showControls = true,
}: ReadingBlockPreviewProps) {
  const passages = useMemo(() => extractPassages(block), [block])
  const [viewMode, setViewMode] = useState<'teacher' | 'student'>('teacher')
  const [testAnswers, setTestAnswers] = useState<Record<string, string | number>>({})

  const handleAnswer = (qId: string, val: string | number) => {
    setTestAnswers((prev) => ({
      ...prev,
      [qId]: val,
    }))
  }

  return (
    <ReadingBlock
      blockId={block.id}
      passages={passages as unknown as ReadingPassageItemView[]}
      isMiniChallenge={isMiniChallenge}
      defaultLayout={defaultLayout}
      showControls={showControls}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
      answers={testAnswers}
      onAnswer={handleAnswer}
      isReviewMode={false}
      result={null}
    />
  )
}
