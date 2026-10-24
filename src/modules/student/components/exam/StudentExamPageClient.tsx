'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react'
import type { ExamData } from '@/modules/teacher/types'
import type { TestResultPayload } from '@/actions/analytics/types'
import TestView from '@/modules/student/components/unit/test-view/TestView'

type StudentExamPageClientProps = {
  classId: string
  unitId?: string
  exam: ExamData
  classTitle: string
  unitTitle?: string
  initialResult?: TestResultPayload
  isRetake?: boolean
}

export default function StudentExamPageClient({
  classId,
  unitId,
  exam,
  classTitle,
  unitTitle,
  initialResult,
  isRetake = false,
}: StudentExamPageClientProps) {
  const router = useRouter()
  const [retakeActive, setRetakeActive] = useState(isRetake)

  const backUrl = unitId
    ? `/student/classes/${classId}/units/${unitId}`
    : `/student/classes/${classId}`

  const saveInterruptedIfActive = () => {
    try {
      const sessionKey = `megumi_active_test_${exam.id}`
      const raw = sessionStorage.getItem(sessionKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        const currentAnswers = parsed.answers
        if (currentAnswers && Object.keys(currentAnswers).length > 0) {
          const payload = {
            classId,
            unitId,
            testId: exam.id,
            answers: currentAnswers,
            isInterrupted: true,
          }
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
          if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/test-submit', blob)
          }
        }
        sessionStorage.removeItem(sessionKey)
      }
    } catch {
      // Ignore
    }
  }

  const handleClose = () => {
    saveInterruptedIfActive()
    router.push(backUrl)
  }

  const handleTestComplete = () => {
    setRetakeActive(false)
  }

  const hasReadingBlock = Array.isArray(exam.content) && exam.content.some((b) => b.type === 'reading')

  return (
    <div className="flex flex-col fixed w-full h-full top-0 left-0 right-0 bottom-0 overflow-hidden bg-slate-100/70 select-none">
      {/* Top Header */}
      <header className="h-14 border-b border-gray-200 bg-white/95 px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={backUrl}
            onClick={saveInterruptedIfActive}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-150 shrink-0"
            title="Quay lại"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2 min-w-0 text-xs sm:text-sm">
            <span className="font-semibold text-gray-800 truncate flex items-center gap-1.5 shrink-0">
              <GraduationCap size={16} className="text-indigo-600" />
              {classTitle}
            </span>
            {unitTitle && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-gray-600 truncate flex items-center gap-1.5 shrink-0">
                  <BookOpen size={14} className="text-gray-500" />
                  {unitTitle}
                </span>
              </>
            )}
            <span className="text-gray-300">/</span>
            <span className="font-bold text-gray-900 truncate">{exam.title}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="text-xs font-semibold px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-150"
        >
          Rời khỏi
        </button>
      </header>

      {/* Main Runner Container */}
      <main className="flex-1 min-h-0 py-2 sm:py-4 px-2 sm:px-4 flex justify-center">
        <div
          className={`w-full h-full flex flex-col transition-all duration-300 ${
            hasReadingBlock ? 'max-w-6xl' : 'max-w-2xl'
          }`}
        >
          <TestView
            testData={exam}
            unitId={unitId}
            initialResult={retakeActive ? undefined : initialResult}
            isRetake={retakeActive}
            onClose={handleClose}
            onTestComplete={handleTestComplete}
          />
        </div>
      </main>
    </div>
  )
}
