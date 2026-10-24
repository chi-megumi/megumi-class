'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import TestBuilderView from './TestBuilderView'
import type { ExamData, VocabItemData } from '@/modules/teacher/types'

export type TestBuilderPageClientProps = {
  classId: string
  unitId?: string | null
  unitTitle?: string
  editingTestId: string
  existingTests: ExamData[]
  vocabItems?: VocabItemData[]
  isClassExam?: boolean
  initialExam?: ExamData
  isReadOnly?: boolean
  returnTab?: string
}

export default function TestBuilderPageClient({
  classId,
  unitId,
  unitTitle,
  editingTestId,
  existingTests,
  vocabItems,
  isClassExam,
  initialExam,
  isReadOnly,
  returnTab = 'games',
}: TestBuilderPageClientProps) {
  const router = useRouter()

  const handleClose = () => {
    if (unitId) {
      router.push(`/teacher/classes/${classId}/units?unitId=${unitId}&tab=${returnTab}`)
    } else {
      router.push(`/teacher/classes/${classId}`)
    }
  }

  const handleSaveSuccess = () => {
    if (unitId) {
      router.push(`/teacher/classes/${classId}/units?unitId=${unitId}&tab=${returnTab}`)
    } else {
      router.push(`/teacher/classes/${classId}`)
    }
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-10 flex flex-col w-screen h-screen overflow-hidden bg-[#f8f9fa]">
      <TestBuilderView
        classId={classId}
        unitId={unitId}
        unitTitle={unitTitle}
        editingTestId={editingTestId}
        existingTests={existingTests}
        vocabItems={vocabItems}
        isClassExam={isClassExam}
        initialExam={initialExam}
        isReadOnly={isReadOnly}
        onClose={handleClose}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  )
}
