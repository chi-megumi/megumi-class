'use client'

import React, { useEffect, useState } from 'react'
import { getUnitAnalytics } from '@/actions/analytics'
import type { UnitAnalyticsResult } from '@/actions/analytics/types'
import { useSpeech } from '@/components/flashcards/hooks/useSpeech'
import AnalyticsKpiCards from './analytics/AnalyticsKpiCards'
import AnalyticsSubNav from './analytics/AnalyticsSubNav'
import VocabAnalyticsView from './analytics/VocabAnalyticsView'
import StudentAnalyticsView from './analytics/StudentAnalyticsView'
import ExamAnalyticsView from './analytics/ExamAnalyticsView'
import { useFallbackStudents } from './analytics/useFallbackStudents'
import type { ExamData, StudentExamDetail } from '@/modules/teacher/types'
import type { AnalyticsSubTab, UnitAnalyticsTabProps, VocabStatItem } from './analytics/types'

const EMPTY_VOCAB_STATS: VocabStatItem[] = []

export default function UnitAnalyticsTab({
  unit,
  activeStudents = [],
  classExams = [],
  onViewExamResults,
}: UnitAnalyticsTabProps) {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<UnitAnalyticsResult | null>(null)
  const [subTab, setSubTab] = useState<AnalyticsSubTab>('vocab')
  const { speak, isSpeaking } = useSpeech()

  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      try {
        const res = await getUnitAnalytics(unit.id)
        if (!ignore) {
          setAnalyticsData(res)
        }
      } catch (err) {
        console.error('Failed to load unit analytics:', err)
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [unit.id])

  // Fallback student list if server action has not returned yet
  const fallbackStudents = useFallbackStudents(unit, activeStudents, classExams)

  const students = analyticsData?.students || fallbackStudents
  const vocabStats = analyticsData?.vocabStats ?? EMPTY_VOCAB_STATS

  // Compute summary stats with fallbacks
  const totalStudents = students.length
  const participatedStudents = students.filter(
    (s) =>
      s.masteryProgress > 0 ||
      s.games.flashcard.played ||
      s.games.quiz.played ||
      s.games.match.played ||
      s.exams?.some((e: StudentExamDetail) => e.isCompleted || e.isInProgress),
  ).length

  const participationRate =
    totalStudents > 0 ? Math.round((participatedStudents / totalStudents) * 100) : 0

  const sumMastery = students.reduce((acc, s) => acc + (s.masteryProgress || 0), 0)
  const avgMastery =
    participatedStudents > 0
      ? Math.round(sumMastery / participatedStudents)
      : totalStudents > 0
        ? Math.round(sumMastery / totalStudents)
        : 0

  const quizScores = students
    .filter((s) => s.games.quiz.played && s.games.quiz.score > 0)
    .map((s) => s.games.quiz.score)
  const avgQuizScore =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : 0

  const examScores = students.flatMap((s) =>
    (s.exams || [])
      .filter((e: StudentExamDetail) => e.isCompleted && e.score !== null)
      .map((e: StudentExamDetail) => e.score as number),
  )
  const avgExamScore =
    examScores.length > 0
      ? Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length)
      : 0

  const hardVocabs = vocabStats.filter((v) => v.difficultyLevel === 'hard')
  const mediumVocabs = vocabStats.filter((v) => v.difficultyLevel === 'medium')
  const easyVocabs = vocabStats.filter((v) => v.difficultyLevel === 'easy')

  const publishedExams = (unit.exams || []).filter((e: ExamData) => e.isPublished)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
      {/* Top Banner Toolbar */}
      <div className="px-6 py-2.5 bg-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
              Phân tích học tập
            </span>
            <h3 className="text-base font-bold text-gray-800">
              Báo cáo tiến độ: <span className="text-[#6A5EEB]">{unit.title}</span>
            </h3>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Theo dõi chuyên cần và phát hiện các từ vựng học sinh hay làm sai.
          </p>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <AnalyticsKpiCards
        participatedStudents={participatedStudents}
        totalStudents={totalStudents}
        participationRate={participationRate}
        avgMastery={avgMastery}
        vocabCount={unit.vocabItems?.length || 0}
        avgExamScore={avgExamScore}
        avgQuizScore={avgQuizScore}
        hardVocabsCount={hardVocabs.length}
        mediumVocabsCount={mediumVocabs.length}
        easyVocabsCount={easyVocabs.length}
      />

      {/* Sub-view Navigation Pills */}
      <AnalyticsSubNav
        subTab={subTab}
        onTabChange={setSubTab}
        hardVocabsCount={hardVocabs.length}
        totalStudentsCount={students.length}
        publishedExamsCount={publishedExams.length}
        isLoading={loading}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
        {subTab === 'vocab' && (
          <VocabAnalyticsView
            vocabStats={vocabStats}
            onSpeak={speak}
            isSpeaking={isSpeaking}
          />
        )}

        {subTab === 'students' && (
          <StudentAnalyticsView
            students={students}
            examCount={unit.exams?.length || 0}
          />
        )}

        {subTab === 'exams' && (
          <ExamAnalyticsView
            exams={unit.exams || []}
            totalStudents={totalStudents}
            onViewExamResults={onViewExamResults}
          />
        )}
      </div>
    </div>
  )
}
