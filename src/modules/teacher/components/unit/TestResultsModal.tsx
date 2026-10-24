'use client'

import React, { useState, useEffect } from 'react'
import { getTestSubmissions, getExamQuestionAnalytics } from '@/actions/analytics/exam-analytics'
import Portal from '@/components/common/Portal'
import TestResultsHeader from './test-results/TestResultsHeader'
import SubmissionsLeaderboard from './test-results/SubmissionsLeaderboard'
import SubmissionDetailView from './test-results/SubmissionDetailView'
import ExamQuestionsAnalyticsView from './test-results/ExamQuestionsAnalyticsView'
import type {
  Submission,
  QuestionAnalytics,
  TestResultsTab,
  TestResultsModalProps,
} from './test-results/types'

export default function TestResultsModal({
  testId,
  testTitle,
  testData,
  onClose,
}: TestResultsModalProps) {
  const [activeTab, setActiveTab] = useState<TestResultsTab>('leaderboard')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [analytics, setAnalytics] = useState<QuestionAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const subs = (await getTestSubmissions(testId)) as Submission[]
        if (ignore) return

        // Sort submissions by score descending, then completedAt ascending
        const sorted = (subs || []).sort((a: Submission, b: Submission) => {
          if (b.result.score !== a.result.score) return b.result.score - a.result.score
          return new Date(a.result.completedAt).getTime() - new Date(b.result.completedAt).getTime()
        })
        setSubmissions(sorted)
        if (sorted.length > 0) {
          setSelectedSubmission(sorted[0])
        }

        // Fetch question analytics in parallel
        setIsLoadingAnalytics(true)
        const analyticsData = await getExamQuestionAnalytics(testId)
        if (!ignore) {
          setAnalytics(analyticsData as unknown as QuestionAnalytics)
        }
      } catch (e: unknown) {
        if (!ignore) {
          if (e instanceof Error) {
            setError(e.message)
          } else {
            setError('Lỗi khi tải kết quả bài thi')
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
          setIsLoadingAnalytics(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [testId])

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-gray-200/50">
          {/* Header */}
          <TestResultsHeader
            testTitle={testTitle}
            duration={testData.duration || 45}
            submissionsCount={submissions.length}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hardQuestionsCount={analytics?.hardQuestionsCount || 0}
            onClose={onClose}
          />

          {/* Modal Body */}
          {activeTab === 'leaderboard' ? (
            <div className="flex-1 overflow-auto p-6 flex flex-col md:flex-row gap-6">
              <SubmissionsLeaderboard
                submissions={submissions}
                selectedSubmission={selectedSubmission}
                onSelectSubmission={setSelectedSubmission}
                isLoading={isLoading}
                error={error}
              />
              <SubmissionDetailView
                submission={selectedSubmission}
                testData={testData}
              />
            </div>
          ) : (
            <ExamQuestionsAnalyticsView
              analytics={analytics}
              isLoading={isLoadingAnalytics}
            />
          )}
        </div>
      </div>
    </Portal>
  )
}
