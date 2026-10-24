'use server'

import { getMe } from '../auth'
import { prisma } from '~/common/libs/prisma'
import type {
  UnitAnalyticsResult,
  UnitAnalyticsSummary,
  UnitVocabStat,
  VocabMistakeDetail,
} from './types'
import type {
  StudentAnalyticsData,
  PracticeSessionEntry,
  StudentExamDetail,
} from '@/modules/teacher/types'

type StoredResultPayload = {
  score?: number | null
  correctAnswers?: number
  totalQuestions?: number
  answers?: Record<string, unknown>
  correctAnswersDetail?: Record<string, string | number>
  startedAt?: string
  completedAt?: string | null
  isInterrupted?: boolean
}

type QuizAnswerRecord = {
  wordId: string
  correct: boolean
  selectedWordId?: string
}

/**
 * Returns comprehensive learning analytics for a specific Unit:
 * - Summary metrics (participation, avg mastery, avg quiz/test score, difficult words)
 * - Vocabulary mistake analytics (error rates, common mistaken choices, difficulty levels)
 * - Individual student progress breakdown
 */
export async function getUnitAnalytics(unitId: string): Promise<UnitAnalyticsResult> {
  const me = await getMe()
  const isTeacher = me?.role === 'teacher' || me?.role === 'TEACHER'
  const isAdmin = me?.systemRole === 'admin'
  if (!me || (!isTeacher && !isAdmin)) {
    throw new Error('Unauthorized')
  }

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      class: {
        include: {
          students: {
            where: { status: 'active' },
            include: {
              student: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
            orderBy: { joinedAt: 'asc' },
          },
          exams: {
            where: { isPublished: true, unitId: null },
            include: {
              results: {
                where: { completedAt: { not: null } },
              },
            },
          },
        },
      },
      vocabItems: {
        orderBy: { sortOrder: 'asc' },
      },
      studentProgress: true,
      exams: {
        orderBy: { createdAt: 'asc' },
        include: {
          results: {
            where: { completedAt: { not: null } },
            include: {
              student: {
                select: { id: true, name: true, email: true, avatarUrl: true },
              },
            },
          },
        },
      },
      quizSessions: {
        include: {
          answers: {
            include: {
              vocabItem: true,
              selectedVocabItem: true,
            },
          },
        },
      },
    },
  })

  if (!unit) {
    throw new Error('Không tìm thấy bài học')
  }

  if (!isAdmin && unit.class.teacherId !== me.id) {
    throw new Error('Unauthorized')
  }

  const activeStudents = unit.class.students
  const enrolledStudentIds = new Set(activeStudents.map((e) => e.student.id))

  // Include non-enrolled accounts (e.g. teacher or admin testing the unit) if they practiced
  const nonEnrolledProgressList = (unit.studentProgress || []).filter(
    (p) => !enrolledStudentIds.has(p.userId),
  )

  let extraStudentList: typeof activeStudents = []
  if (nonEnrolledProgressList.length > 0) {
    const extraUsers = await prisma.user.findMany({
      where: { id: { in: nonEnrolledProgressList.map((p) => p.userId) } },
      select: { id: true, name: true, email: true, avatarUrl: true },
    })
    extraStudentList = extraUsers.map((u) => ({
      id: `virtual-${u.id}`,
      classId: unit.classId,
      studentId: u.id,
      joinedAt: new Date(0),
      status: 'active',
      student: {
        id: u.id,
        name:
          u.id === unit.class.teacherId
            ? `${u.name} (Giáo viên - Thử nghiệm)`
            : `${u.name} (Thử nghiệm)`,
        email: u.email,
        avatarUrl: u.avatarUrl,
      },
    })) as typeof activeStudents
  }

  const allDisplayStudents = [...activeStudents, ...extraStudentList]
  const totalStudents = allDisplayStudents.length
  const vocabItems = unit.vocabItems
  const publishedUnitExams = (unit.exams || []).filter((e) => e.isPublished)
  const publishedClassExams = (unit.class.exams || []).filter((e) => e.isPublished)

  // 1. Process Student Analytics
  let participatedCount = 0
  let totalMasterySum = 0
  const quizScores: number[] = []
  const examScores: number[] = []
  let totalPracticesSum = 0
  let totalSubmissionsSum = 0

  const studentAnalyticsList: StudentAnalyticsData[] = allDisplayStudents.map((enrollment) => {
    const student = enrollment.student
    const progress = unit.studentProgress?.find((p) => p.userId === student.id)
    const history = (progress?.activityHistory as Record<string, unknown> | null) || {}

    const flashcardHistory = Array.isArray(history.flashcard) ? history.flashcard : []
    const quizHistory = Array.isArray(history.quiz) ? history.quiz : []
    const matchHistory = Array.isArray(history.match) ? history.match : []

    const flashcardPlays = Math.max(progress?.flashcardPlayCount || 0, flashcardHistory.length)
    const quizPlays = Math.max(progress?.quizPlayCount || 0, quizHistory.length)
    const matchPlays = Math.max(progress?.matchPlayCount || 0, matchHistory.length)
    const masteryProgress = progress?.masteryProgress || 0

    totalPracticesSum += flashcardPlays + quizPlays + matchPlays

    if (progress?.bestQuizScore !== null && progress?.bestQuizScore !== undefined) {
      quizScores.push(progress.bestQuizScore)
    }

    // Map unit exams for this student
    const unitExamList: StudentExamDetail[] = publishedUnitExams.map((exam) => {
      const res = exam.results?.find((r) => r.studentId === student.id)
      const payload = (res?.answers as StoredResultPayload | null) || {}
      const isCompleted = !!res?.completedAt
      const score = res?.score ?? (isCompleted ? payload.score ?? 0 : null)

      if (isCompleted && score !== null && score !== undefined) {
        examScores.push(score)
        totalSubmissionsSum++
      }

      return {
        id: exam.id,
        title: exam.title,
        type: 'unit',
        unitTitle: unit.title,
        duration: exam.duration,
        isCompleted,
        isInProgress: !isCompleted && !!res?.startedAt,
        score,
        correctAnswers: payload.correctAnswers ?? null,
        totalQuestions: payload.totalQuestions ?? null,
        completedAt: res?.completedAt || null,
        startedAt: res?.startedAt || null,
        answers: payload.answers || {},
        correctAnswersDetail: payload.correctAnswersDetail || {},
        content: exam.content,
        isInterrupted: !!payload.isInterrupted,
      }
    })

    // Map class exams
    const classExamList: StudentExamDetail[] = publishedClassExams.map((exam) => {
      const res = exam.results?.find((r) => r.studentId === student.id)
      const payload = (res?.answers as StoredResultPayload | null) || {}
      const isCompleted = !!res?.completedAt
      const score = res?.score ?? (isCompleted ? payload.score ?? 0 : null)

      return {
        id: exam.id,
        title: exam.title,
        type: 'class',
        unitTitle: 'Đề Tổng Hợp',
        duration: exam.duration,
        isCompleted,
        isInProgress: !isCompleted && !!res?.startedAt,
        score,
        correctAnswers: payload.correctAnswers ?? null,
        totalQuestions: payload.totalQuestions ?? null,
        completedAt: res?.completedAt || null,
        startedAt: res?.startedAt || null,
        answers: payload.answers || {},
        correctAnswersDetail: payload.correctAnswersDetail || {},
        content: exam.content,
        isInterrupted: !!payload.isInterrupted,
      }
    })

    const allExams = [...unitExamList, ...classExamList]
    const hasParticipated =
      masteryProgress > 0 ||
      flashcardPlays > 0 ||
      quizPlays > 0 ||
      matchPlays > 0 ||
      allExams.some((e) => e.isCompleted || e.isInProgress)

    if (hasParticipated) {
      participatedCount++
      totalMasterySum += masteryProgress
    }

    return {
      student,
      masteryProgress,
      games: {
        flashcard: {
          played: flashcardPlays > 0 || flashcardHistory.length > 0,
          progress: masteryProgress,
          timesPlayed: flashcardPlays,
          history: flashcardHistory as PracticeSessionEntry[],
        },
        quiz: {
          played: quizPlays > 0 || quizHistory.length > 0,
          score: progress?.bestQuizScore || 0,
          timesPlayed: quizPlays,
          history: quizHistory as PracticeSessionEntry[],
        },
        match: {
          played: matchPlays > 0 || matchHistory.length > 0,
          bestTime: progress?.bestMatchTime || null,
          timesPlayed: matchPlays,
          history: matchHistory as PracticeSessionEntry[],
        },
      },
      exams: allExams,
    }
  })

  // 2. Vocab Mistake Analytics
  type VocabAccItem = {
    totalAttempts: number
    correctCount: number
    incorrectCount: number
    mistakesMap: Map<string, { count: number; meaning?: string }>
  }

  const vocabAccMap = new Map<string, VocabAccItem>()
  const vocabLookup = new Map<string, { word: string; vi: string }>()

  vocabItems.forEach((v) => {
    vocabAccMap.set(v.id, {
      totalAttempts: 0,
      correctCount: 0,
      incorrectCount: 0,
      mistakesMap: new Map(),
    })
    vocabLookup.set(v.id, { word: v.word, vi: v.vi })
  })

  // 2.1 Extract from QuizSessions & QuizAnswers in DB
  unit.quizSessions.forEach((session) => {
    session.answers.forEach((ans) => {
      const item = vocabAccMap.get(ans.vocabItemId)
      if (item) {
        item.totalAttempts++
        if (ans.isCorrect) {
          item.correctCount++
        } else {
          item.incorrectCount++
          const wrongWord = ans.selectedVocabItem?.word || 'Lựa chọn sai'
          const wrongVi = ans.selectedVocabItem?.vi || ''
          const current = item.mistakesMap.get(wrongWord) || { count: 0, meaning: wrongVi }
          current.count++
          item.mistakesMap.set(wrongWord, current)
        }
      }
    })
  })

  // 2.2 Extract from student activityHistory.quiz answers if stored
  unit.studentProgress.forEach((prog) => {
    const history = (prog.activityHistory as Record<string, unknown> | null) || {}
    const quizList = Array.isArray(history.quiz) ? history.quiz : []
    quizList.forEach((attempt) => {
      const answers = (attempt as { answers?: QuizAnswerRecord[] })?.answers
      if (Array.isArray(answers)) {
        answers.forEach((ans) => {
          const item = vocabAccMap.get(ans.wordId)
          if (item) {
            // Only add if not already captured in quizSessions count
            if (unit.quizSessions.length === 0) {
              item.totalAttempts++
              if (ans.correct) {
                item.correctCount++
              } else {
                item.incorrectCount++
                const selected = ans.selectedWordId ? vocabLookup.get(ans.selectedWordId) : null
                const wrongWord = selected?.word || 'Lựa chọn sai'
                const wrongVi = selected?.vi || ''
                const current = item.mistakesMap.get(wrongWord) || { count: 0, meaning: wrongVi }
                current.count++
                item.mistakesMap.set(wrongWord, current)
              }
            }
          }
        })
      }
    })
  })

  // 3. Construct Final Vocab Stats
  const vocabStats: UnitVocabStat[] = vocabItems.map((v) => {
    const acc = vocabAccMap.get(v.id) || {
      totalAttempts: 0,
      correctCount: 0,
      incorrectCount: 0,
      mistakesMap: new Map(),
    }

    const totalAttempts = acc.totalAttempts
    const correctCount = acc.correctCount
    const incorrectCount = acc.incorrectCount

    // Count how many students mastered this word (based on student mastery %)
    // If student has 100% mastery, all words mastered; otherwise estimate proportional
    const masteredStudentCount = studentAnalyticsList.filter(
      (s) => s.masteryProgress >= 80,
    ).length
    const masteryRate =
      totalStudents > 0 ? Math.round((masteredStudentCount / totalStudents) * 100) : 0

    let accuracyRate = 100
    if (totalAttempts > 0) {
      accuracyRate = Math.round((correctCount / totalAttempts) * 100)
    } else if (participatedCount > 0) {
      // Estimate from average mastery rate if untested yet
      accuracyRate = Math.min(100, Math.max(0, masteryRate))
    }

    const errorRate = 100 - accuracyRate

    let difficultyLevel: 'hard' | 'medium' | 'easy' = 'easy'
    if (totalAttempts > 0) {
      if (accuracyRate < 50) difficultyLevel = 'hard'
      else if (accuracyRate < 80) difficultyLevel = 'medium'
      else difficultyLevel = 'easy'
    } else {
      if (masteryRate < 40 && participatedCount > 0) difficultyLevel = 'medium'
      else difficultyLevel = 'easy'
    }

    const commonMistakes: VocabMistakeDetail[] = Array.from(acc.mistakesMap.entries())
      .map(([wrongWord, data]) => ({
        wrongWord,
        wrongMeaning: data.meaning,
        count: data.count,
        percentage:
          incorrectCount > 0 ? Math.round((data.count / incorrectCount) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)

    return {
      id: v.id,
      word: v.word,
      vi: v.vi,
      ipa: v.ipa,
      pos: v.pos,
      emoji: v.emoji,
      example: v.example,
      exampleVi: v.exampleVi,
      tip: v.tip,
      totalAttempts,
      correctCount,
      incorrectCount,
      accuracyRate,
      errorRate,
      difficultyLevel,
      masteredStudentCount,
      masteryRate,
      commonMistakes,
    }
  })

  // Sort vocab stats by error rate descending (highest errors first), then attempts
  vocabStats.sort((a, b) => {
    if (b.errorRate !== a.errorRate) {
      return b.errorRate - a.errorRate
    }
    return b.totalAttempts - a.totalAttempts
  })

  // 4. Calculate Summary
  const avgVocabMastery =
    participatedCount > 0 ? Math.round(totalMasterySum / participatedCount) : 0
  const avgQuizScore =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : 0
  const avgExamScore =
    examScores.length > 0
      ? Math.round(examScores.reduce((a, b) => a + b, 0) / examScores.length)
      : 0

  const hardVocabCount = vocabStats.filter((v) => v.difficultyLevel === 'hard').length
  const mediumVocabCount = vocabStats.filter((v) => v.difficultyLevel === 'medium').length
  const easyVocabCount = vocabStats.filter((v) => v.difficultyLevel === 'easy').length

  const summary: UnitAnalyticsSummary = {
    unitId: unit.id,
    unitTitle: unit.title,
    totalStudents,
    participatedStudents: participatedCount,
    participationRate:
      totalStudents > 0 ? Math.round((participatedCount / totalStudents) * 100) : 0,
    averageVocabMastery: avgVocabMastery,
    averageQuizScore: avgQuizScore,
    averageExamScore: avgExamScore,
    totalVocabCount: vocabItems.length,
    hardVocabCount,
    mediumVocabCount,
    easyVocabCount,
    totalPracticesCount: totalPracticesSum,
    totalExamsCount: publishedUnitExams.length,
    examSubmissionsCount: totalSubmissionsSum,
  }

  return {
    summary,
    vocabStats,
    students: studentAnalyticsList,
  }
}
