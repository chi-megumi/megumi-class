'use client'

import React from 'react'
import Portal from '@/components/common/Portal'
import TestBuilderView from '../test-builder/TestBuilderView'
import type { TestBuilderModalProps } from './test-builder/types'

export default function TestBuilderModal(props: TestBuilderModalProps) {
  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex bg-gray-900/50 animate-in fade-in duration-200">
        <TestBuilderView
          unitId={props.unitId}
          classId={props.classId}
          isClassExam={props.isClassExam}
          editingTestId={props.editingTestId}
          existingTests={props.existingTests}
          vocabItems={props.vocabItems}
          unitTitle={props.unitTitle}
          initialExam={props.initialExam}
          isReadOnly={props.isReadOnly}
          onClose={props.onClose}
          onSaveSuccess={props.onSaveSuccess}
        />
      </div>
    </Portal>
  )
}
