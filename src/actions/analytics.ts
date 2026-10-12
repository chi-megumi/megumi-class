'use server'

import { revalidatePath } from 'next/cache'
import { getMe } from './auth'
import { prisma } from '~/common/libs/prisma'
import { TestContent, TestBlock, TestQuestion } from '@/modules/teacher/types'

/**
 * Increments the play count and updates best score/time for a specific game in a unit.
 * Used at the end of a game session by the student.
 */
export async function recordGameCompletion({
  unitId,
  classId,
  gameType,
  score,
  time,
  masteryProgress,
}: {
  unitId: string
  classId: string
  gameType: 'flashcard' | 'quiz' | 'match'
  score?: number
  time?: number
  masteryProgress?: number
}) {
  const me = await getMe()
  if (!me) {
    return { success: false, error: 'Unauthorized' }
  }

  const role = me.role?.toLowerCase()
  // Teachers have full rights of students, so both students and teachers can study and record progress
  if (role !== 'student' && role !== 'teacher') {
    return { success: false, error: 'Unauthorized' }
  }

  // Ensure the progress record exists
  const existingProgress = await prisma.userUnitProgress.findUnique({
    where: {
      userId_unitId: {
        userId: me.id,
        unitId,
      },
    },
  })

  if (!existingProgress) {
    // Create new
    await prisma.userUnitProgress.create({
      data: {
        userId: me.id,
        unitId,
        flashcardPlayCount: gameType === 'flashcard' ? 1 : 0,
        quizPlayCount: gameType === 'quiz' ? 1 : 0,
        bestQuizScore: gameType === 'quiz' ? score : null,
        matchPlayCount: gameType === 'match' ? 1 : 0,
        bestMatchTime: gameType === 'match' ? time : null,
        masteryProgress: masteryProgress || 0,
      },
    })
  } else {
    // Update existing
    const updateData: import('@prisma/client').Prisma.UserUnitProgressUpdateInput = {}
    
    if (masteryProgress !== undefined) {
      updateData.masteryProgress = masteryProgress
    }

    if (gameType === 'flashcard') {
      updateData.flashcardPlayCount = { increment: 1 }
    } else if (gameType === 'quiz') {
      updateData.quizPlayCount = { increment: 1 }
      if (score !== undefined && (existingProgress.bestQuizScore === null || score > existingProgress.bestQuizScore)) {
        updateData.bestQuizScore = score
      }
    } else if (gameType === 'match') {
      updateData.matchPlayCount = { increment: 1 }
      if (time !== undefined && (existingProgress.bestMatchTime === null || time < existingProgress.bestMatchTime)) {
        updateData.bestMatchTime = time
      }
    }

    await prisma.userUnitProgress.update({
      where: { id: existingProgress.id },
      data: updateData,
    })
  }

  // Revalidate the teacher's dashboard so they see the updated counts immediately
  if (classId) {
    revalidatePath(`/teacher/classes/${classId}`)
  }
  
  return { success: true }
}

/**
 * Submits test results for a specific test
 */
export async function submitTestResult({
  unitId,
  classId,
  testId,
  answers,
}: {
  unitId?: string
  classId: string
  testId: string
  answers: Record<string, string | number>
}) {
  const me = await getMe()
  if (!me) {
    throw new Error('Unauthorized')
  }

  // Fetch test securely on the server from the Exam model
  const test = await prisma.exam.findUnique({
    where: { id: testId },
    include: {
      class: true,
      unit: true,
    },
  })

  if (!test) {
    throw new Error('Test not found')
  }

  // Verify that the test belongs to this class
  const examClassId = test.classId || test.unit?.classId
  if (examClassId !== classId) {
    throw new Error('Bài thi không thuộc lớp học này')
  }

  // Check if student has already completed this exam in ExamResult
  const existingExamResult = await prisma.examResult.findUnique({
    where: {
      examId_studentId: {
        examId: testId,
        studentId: me.id,
      },
    },
  })

  if (existingExamResult?.completedAt) {
    throw new Error('Bạn đã nộp bài kiểm tra này rồi, không thể nộp lại!')
  }

  // Also check legacy userUnitProgress if unitId is provided
  if (unitId) {
    const existingProgress = await prisma.userUnitProgress.findUnique({
      where: {
        userId_unitId: {
          userId: me.id,
          unitId,
        },
      },
    })
    if ((existingProgress?.testResults as any)?.[testId]?.completedAt) {
      throw new Error('Bạn đã nộp bài kiểm tra này rồi, không thể nộp lại!')
    }
  }

  let totalQuestions = 0
  let correctAnswers = 0
  const correctAnswersDetail: Record<string, string | number> = {}

  const blocks = (test.content as unknown as TestBlock[]) || []

  blocks.forEach((block: TestBlock) => {
    if (block.type === 'multiple_choice') {
      block.content?.questions?.forEach((q: TestQuestion) => {
        totalQuestions++
        correctAnswersDetail[q.id] = q.correctIndex ?? 0
        if (answers[q.id] === q.correctIndex) {
          correctAnswers++
        }
      })
    } else if (block.type === 'fill_blank') {
      const questions = (block.content as any)?.questions
      if (Array.isArray(questions) && questions.length > 0) {
        questions.forEach((q: TestQuestion) => {
          totalQuestions++
          correctAnswersDetail[q.id] = q.answer || ''
          const answerStr = (answers[q.id] || '').toString().trim().toLowerCase()
          const correctStr = (q.answer || '').toString().trim().toLowerCase()
          if (answerStr === correctStr) {
            correctAnswers++
          }
        })
      } else {
        totalQuestions++
        correctAnswersDetail[block.id] = (block.content as any)?.answer || ''
        const answerStr = (answers[block.id] || '').toString().trim().toLowerCase()
        const correctStr = ((block.content as any)?.answer || '').toString().trim().toLowerCase()
        if (answerStr === correctStr) {
          correctAnswers++
        }
      }
    } else if (block.type === 'matching') {
      const pairs = (block.content as any)?.pairs
      if (Array.isArray(pairs)) {
        pairs.forEach((p: any) => {
          totalQuestions++
          const key = `${block.id}_${p.id}`
          correctAnswersDetail[key] = p.right || p.id
          const studentAns = answers[key]
          if (
            studentAns === p.id ||
            (p.right && String(studentAns).trim().toLowerCase() === String(p.right).trim().toLowerCase())
          ) {
            correctAnswers++
          }
        })
      }
    } else if (block.type === 'reorder') {
      const questions = (block.content as any)?.questions
      if (Array.isArray(questions)) {
        questions.forEach((q: any) => {
          totalQuestions++
          const key = q.id
          correctAnswersDetail[key] = q.sentence || ''
          const studentAns = (answers[key] || '').toString()
          const correctSentence = (q.sentence || '').toString()
          const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim()
          if (normalize(studentAns) === normalize(correctSentence)) {
            correctAnswers++
          }
        })
      }
    }
  })

  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 100
  const completedAt = new Date()

  const answersPayload = {
    score,
    correctAnswers,
    totalQuestions,
    answers,
    correctAnswersDetail,
    startedAt: existingExamResult?.startedAt?.toISOString() || completedAt.toISOString(),
    completedAt: completedAt.toISOString(),
  }

  // 1. Primary storage: Upsert into ExamResult table
  await prisma.examResult.upsert({
    where: {
      examId_studentId: {
        examId: testId,
        studentId: me.id,
      },
    },
    update: {
      score,
      completedAt,
      answers: answersPayload as import('@prisma/client').Prisma.InputJsonValue,
    },
    create: {
      examId: testId,
      studentId: me.id,
      score,
      startedAt: existingExamResult?.startedAt ?? completedAt,
      completedAt,
      answers: answersPayload as import('@prisma/client').Prisma.InputJsonValue,
    },
  })

  // 2. Legacy mirror: Store in userUnitProgress if unitId exists
  if (unitId) {
    const existingProgress = await prisma.userUnitProgress.findUnique({
      where: {
        userId_unitId: {
          userId: me.id,
          unitId,
        },
      },
    })
    let currentResults: Record<string, unknown> = {}
    if (existingProgress?.testResults && typeof existingProgress.testResults === 'object') {
      currentResults = { ...(existingProgress.testResults as Record<string, unknown>) }
    }
    currentResults[testId] = answersPayload

    await prisma.userUnitProgress.upsert({
      where: {
        userId_unitId: {
          userId: me.id,
          unitId,
        },
      },
      update: {
        testResults: currentResults as import('@prisma/client').Prisma.InputJsonValue,
      },
      create: {
        userId: me.id,
        unitId,
        testResults: currentResults as import('@prisma/client').Prisma.InputJsonValue,
      },
    })

    revalidatePath(`/student/classes/${classId}/units/${unitId}`)
  }

  revalidatePath(`/student/classes/${classId}`)
  revalidatePath(`/teacher/classes/${classId}`)

  return { success: true, resultData: answersPayload }
}

export async function getTestSubmissions(testIdOrUnitId: string, maybeTestId?: string) {
  const testId = maybeTestId || testIdOrUnitId
  const me = await getMe()
  if (!me || (me.role !== 'teacher' && me.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  const exam = await prisma.exam.findUnique({
    where: { id: testId },
    include: {
      class: true,
      unit: { include: { class: true } },
      results: {
        where: { completedAt: { not: null } },
        include: {
          student: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { completedAt: 'desc' },
      },
    },
  })

  if (!exam) {
    throw new Error('Test not found')
  }

  const teacherId = exam.class?.teacherId || exam.unit?.class?.teacherId
  if (teacherId !== me.id) {
    throw new Error('Unauthorized')
  }

  return exam.results.map((r) => {
    const payload = (r.answers as any) || {}
    return {
      user: r.student,
      result: {
        score: r.score ?? payload.score ?? 0,
        correctAnswers: payload.correctAnswers ?? 0,
        totalQuestions: payload.totalQuestions ?? 0,
        completedAt: r.completedAt || payload.completedAt,
        answers: payload.answers || payload,
        correctAnswersDetail: payload.correctAnswersDetail || {},
      },
    }
  })
}

export async function startTest({
  classId,
  unitId,
  testId,
}: {
  classId: string
  unitId?: string
  testId: string
}) {
  const user = await getMe()
  if (!user) throw new Error('Unauthorized')

  // Check if test attempt exists in ExamResult
  const existingExamResult = await prisma.examResult.findUnique({
    where: {
      examId_studentId: {
        examId: testId,
        studentId: user.id,
      },
    },
  })

  if (existingExamResult?.completedAt) {
    return {
      success: true,
      startedAt: existingExamResult.startedAt.toISOString(),
      isCompleted: true,
    }
  }

  if (existingExamResult?.startedAt) {
    return {
      success: true,
      startedAt: existingExamResult.startedAt.toISOString(),
      isCompleted: false,
    }
  }

  // Fallback / auto-migration from legacy userUnitProgress if available
  if (unitId) {
    const progress = await prisma.userUnitProgress.findUnique({
      where: { userId_unitId: { userId: user.id, unitId } },
    })
    const oldResult = (progress?.testResults as any)?.[testId]
    if (oldResult?.completedAt) {
      await prisma.examResult.upsert({
        where: { examId_studentId: { examId: testId, studentId: user.id } },
        create: {
          examId: testId,
          studentId: user.id,
          score: oldResult.score ?? null,
          startedAt: oldResult.startedAt ? new Date(oldResult.startedAt) : new Date(),
          completedAt: new Date(oldResult.completedAt),
          answers: oldResult,
        },
        update: {},
      })
      return {
        success: true,
        startedAt: oldResult.startedAt || new Date().toISOString(),
        isCompleted: true,
      }
    }
    if (oldResult?.startedAt) {
      await prisma.examResult.upsert({
        where: { examId_studentId: { examId: testId, studentId: user.id } },
        create: {
          examId: testId,
          studentId: user.id,
          startedAt: new Date(oldResult.startedAt),
        },
        update: {},
      })
      return {
        success: true,
        startedAt: oldResult.startedAt,
        isCompleted: false,
      }
    }
  }

  const startedAt = new Date()

  // Create attempt in ExamResult table
  await prisma.examResult.upsert({
    where: {
      examId_studentId: {
        examId: testId,
        studentId: user.id,
      },
    },
    create: {
      examId: testId,
      studentId: user.id,
      startedAt,
    },
    update: {},
  })

  // Mirror to userUnitProgress for legacy compatibility
  if (unitId) {
    const progress = await prisma.userUnitProgress.findUnique({
      where: { userId_unitId: { userId: user.id, unitId } },
    })
    let currentResults: Record<string, any> = {}
    if (progress?.testResults && typeof progress.testResults === 'object') {
      currentResults = progress.testResults as Record<string, any>
    }
    currentResults[testId] = { ...(currentResults[testId] || {}), startedAt: startedAt.toISOString() }
    await prisma.userUnitProgress.upsert({
      where: { userId_unitId: { userId: user.id, unitId } },
      update: { testResults: currentResults },
      create: {
        userId: user.id,
        unitId,
        testResults: currentResults,
      },
    })
    revalidatePath(`/student/classes/${classId}/units/${unitId}`)
  }

  revalidatePath(`/student/classes/${classId}`)

  return { success: true, startedAt: startedAt.toISOString(), isCompleted: false }
}

/**
 * Returns class-wide leaderboard aggregating exam performances and vocab progress
 */
export async function getClassLeaderboard(classId: string) {
  const me = await getMe()
  if (!me || (me.role !== 'teacher' && me.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  const cls = await prisma.class.findUnique({
    where: { id: classId, teacherId: me.id },
    include: {
      students: {
        where: { status: 'active' },
        include: {
          student: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
      exams: {
        where: { isPublished: true },
        include: {
          results: {
            where: { completedAt: { not: null } },
          },
        },
      },
      units: {
        include: {
          exams: {
            where: { isPublished: true },
            include: {
              results: {
                where: { completedAt: { not: null } },
              },
            },
          },
          studentProgress: true,
        },
      },
    },
  })

  if (!cls) {
    throw new Error('Không tìm thấy lớp học')
  }

  const allPublishedExams = [
    ...cls.exams,
    ...cls.units.flatMap((u) => u.exams),
  ]
  const totalPublishedExams = allPublishedExams.length

  const studentStats = cls.students.map((enrollment) => {
    const student = enrollment.student
    const studentResults: Array<{ examId: string; score: number; completedAt: Date }> = []

    allPublishedExams.forEach((exam) => {
      const res = exam.results.find((r) => r.studentId === student.id)
      if (res && res.score !== null) {
        studentResults.push({
          examId: exam.id,
          score: res.score,
          completedAt: res.completedAt || new Date(),
        })
      }
    })

    const completedCount = studentResults.length
    const scores = studentResults.map((r) => r.score)
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

    const unitProgressList = cls.units.map((u) => {
      const prog = u.studentProgress.find((p) => p.userId === student.id)
      return prog?.masteryProgress || 0
    })
    const avgVocabMastery = unitProgressList.length > 0
      ? Math.round(unitProgressList.reduce((a, b) => a + b, 0) / unitProgressList.length)
      : 0

    const xp = (completedCount * 100) + (avgScore * 15) + (avgVocabMastery * 10)

    return {
      student,
      totalPublishedExams,
      completedExams: completedCount,
      completionRate: totalPublishedExams > 0 ? Math.round((completedCount / totalPublishedExams) * 100) : 0,
      avgScore,
      highestScore,
      lowestScore,
      avgVocabMastery,
      xp,
    }
  })

  studentStats.sort((a, b) => {
    if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore
    if (b.completedExams !== a.completedExams) return b.completedExams - a.completedExams
    return b.xp - a.xp
  })

  const rankedStudents = studentStats.map((item, index) => ({
    ...item,
    rank: index + 1,
  }))

  const totalCompletedResults = studentStats.reduce((acc, s) => acc + s.completedExams, 0)
  const classAvgScore = studentStats.length > 0 && studentStats.some((s) => s.completedExams > 0)
    ? Math.round(
        studentStats.filter((s) => s.completedExams > 0).reduce((acc, s) => acc + s.avgScore, 0) /
        studentStats.filter((s) => s.completedExams > 0).length,
      )
    : 0

  return {
    classId: cls.id,
    className: cls.name,
    totalStudents: cls.students.length,
    totalPublishedExams,
    totalCompletedResults,
    classAvgScore,
    leaderboard: rankedStudents,
  }
}

/**
 * Returns complete exam history and attempt details for a specific student in a class
 */
export async function getStudentExamHistory(classId: string, studentId: string) {
  const me = await getMe()
  if (!me || (me.role !== 'teacher' && me.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  const cls = await prisma.class.findUnique({
    where: { id: classId, teacherId: me.id },
    include: {
      exams: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      },
      units: {
        orderBy: { createdAt: 'asc' },
        include: {
          exams: {
            where: { isPublished: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      },
    },
  })

  if (!cls) throw new Error('Không tìm thấy lớp học')

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, email: true, avatarUrl: true },
  })

  if (!student) throw new Error('Không tìm thấy học sinh')

  const examsList: Array<{
    exam: any
    type: 'class' | 'unit'
    unitTitle?: string
  }> = []

  cls.exams.forEach((e) => examsList.push({ exam: e, type: 'class' }))
  cls.units.forEach((u) => {
    u.exams.forEach((e) => examsList.push({ exam: e, type: 'unit', unitTitle: u.title }))
  })

  const examIds = examsList.map((item) => item.exam.id)

  const results = await prisma.examResult.findMany({
    where: {
      examId: { in: examIds },
      studentId: student.id,
    },
  })

  const resultMap = new Map(results.map((r) => [r.examId, r]))

  const history = examsList.map(({ exam, type, unitTitle }) => {
    const res = resultMap.get(exam.id)
    const answersData = (res?.answers as any) || {}

    let status: 'completed' | 'in_progress' | 'not_started' = 'not_started'
    if (res?.completedAt) {
      status = 'completed'
    } else if (res?.startedAt) {
      status = 'in_progress'
    }

    return {
      examId: exam.id,
      title: exam.title,
      type,
      unitTitle: unitTitle || null,
      duration: exam.duration,
      status,
      score: res?.score ?? (status === 'completed' ? answersData.score ?? 0 : null),
      correctAnswers: answersData.correctAnswers ?? null,
      totalQuestions: answersData.totalQuestions ?? null,
      startedAt: res?.startedAt || null,
      completedAt: res?.completedAt || null,
      answers: answersData.answers || {},
      correctAnswersDetail: answersData.correctAnswersDetail || {},
      content: exam.content,
    }
  })

  const completed = history.filter((h) => h.status === 'completed')
  const scores = completed.map((c) => c.score ?? 0)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0

  return {
    student,
    summary: {
      totalExams: history.length,
      completedCount: completed.length,
      inProgressCount: history.filter((h) => h.status === 'in_progress').length,
      notStartedCount: history.filter((h) => h.status === 'not_started').length,
      avgScore,
      highestScore,
    },
    history,
  }
}

/**
 * Detailed statistical analysis of questions in an exam:
 * Accuracy rates, common mistakes, and detection of hard questions.
 */
export async function getExamQuestionAnalytics(examId: string) {
  const me = await getMe()
  if (!me || (me.role !== 'teacher' && me.role !== 'TEACHER')) {
    throw new Error('Unauthorized')
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      class: true,
      unit: { include: { class: true } },
      results: {
        where: { completedAt: { not: null } },
        include: {
          student: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
      },
    },
  })

  if (!exam) throw new Error('Bài kiểm tra không tồn tại')

  const teacherId = exam.class?.teacherId || exam.unit?.class?.teacherId
  if (teacherId !== me.id) throw new Error('Unauthorized')

  const totalSubmissions = exam.results.length
  const blocks = ((exam.content as unknown as TestBlock[]) || [])

  const scores = exam.results.map((r) => r.score ?? 0)
  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

  type QuestionStat = {
    id: string
    blockId: string
    blockTitle: string
    type: string
    questionText: string
    correctAnswerText: string
    totalAttempts: number
    correctCount: number
    incorrectCount: number
    accuracyRate: number
    isHardQuestion: boolean
    difficultyLevel: 'hard' | 'medium' | 'easy'
    mistakes: Array<{ answer: string; count: number; percentage: number }>
  }

  const questionStats: QuestionStat[] = []

  blocks.forEach((block, bIdx) => {
    const blockTitle = block.title || `Phần ${bIdx + 1}`

    if (block.type === 'multiple_choice') {
      block.content?.questions?.forEach((q, qIdx) => {
        const correctIndex = q.correctIndex ?? 0
        const correctOpt = q.options?.[correctIndex] || `Đáp án ${correctIndex + 1}`
        let correctCount = 0
        const optionChoiceCounts: Record<number, number> = {}

        exam.results.forEach((r) => {
          const payload = (r.answers as any) || {}
          const studentAnswers = payload.answers || {}
          const chosen = studentAnswers[q.id]
          if (chosen !== undefined && chosen !== null) {
            optionChoiceCounts[chosen] = (optionChoiceCounts[chosen] || 0) + 1
            if (chosen === correctIndex) correctCount++
          }
        })

        const totalAttempts = totalSubmissions
        const incorrectCount = totalAttempts - correctCount
        const accuracyRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

        const mistakes: Array<{ answer: string; count: number; percentage: number }> = []
        Object.entries(optionChoiceCounts).forEach(([optIdxStr, count]) => {
          const optIdx = Number(optIdxStr)
          if (optIdx !== correctIndex) {
            const optText = q.options?.[optIdx] || `Lựa chọn ${optIdx + 1}`
            mistakes.push({
              answer: optText,
              count,
              percentage: totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0,
            })
          }
        })
        mistakes.sort((a, b) => b.count - a.count)

        questionStats.push({
          id: q.id,
          blockId: block.id,
          blockTitle,
          type: 'multiple_choice',
          questionText: q.text || `Câu hỏi ${qIdx + 1}`,
          correctAnswerText: correctOpt,
          totalAttempts,
          correctCount,
          incorrectCount,
          accuracyRate,
          isHardQuestion: accuracyRate < 50,
          difficultyLevel: accuracyRate < 50 ? 'hard' : accuracyRate < 80 ? 'medium' : 'easy',
          mistakes,
        })
      })
    } else if (block.type === 'fill_blank') {
      const questions = (block.content as any)?.questions && (block.content as any).questions.length > 0
        ? (block.content as any).questions
        : [{ id: block.id, text: (block.content as any)?.text || '', answer: (block.content as any)?.answer || '' }]

      questions.forEach((q: any, qIdx: number) => {
        const correctAns = String(q.answer || '').trim().toLowerCase()
        let correctCount = 0
        const wrongAnswersMap: Record<string, number> = {}

        exam.results.forEach((r) => {
          const payload = (r.answers as any) || {}
          const studentAnswers = payload.answers || {}
          const studentAns = String(studentAnswers[q.id] || '').trim().toLowerCase()
          if (studentAns === correctAns && correctAns !== '') {
            correctCount++
          } else {
            const displayAns = studentAnswers[q.id] ? String(studentAnswers[q.id]).trim() : '(Bỏ trống)'
            wrongAnswersMap[displayAns] = (wrongAnswersMap[displayAns] || 0) + 1
          }
        })

        const totalAttempts = totalSubmissions
        const incorrectCount = totalAttempts - correctCount
        const accuracyRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

        const mistakes = Object.entries(wrongAnswersMap).map(([ans, count]) => ({
          answer: ans,
          count,
          percentage: totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0,
        })).sort((a, b) => b.count - a.count).slice(0, 5)

        questionStats.push({
          id: q.id,
          blockId: block.id,
          blockTitle,
          type: 'fill_blank',
          questionText: q.text || `Điền từ câu ${qIdx + 1}`,
          correctAnswerText: q.answer || '',
          totalAttempts,
          correctCount,
          incorrectCount,
          accuracyRate,
          isHardQuestion: accuracyRate < 50,
          difficultyLevel: accuracyRate < 50 ? 'hard' : accuracyRate < 80 ? 'medium' : 'easy',
          mistakes,
        })
      })
    } else if (block.type === 'matching') {
      const pairs = (block.content as any)?.pairs || []
      pairs.forEach((p: any, pIdx: number) => {
        const key = `${block.id}_${p.id}`
        let correctCount = 0
        const wrongPairsMap: Record<string, number> = {}

        exam.results.forEach((r) => {
          const payload = (r.answers as any) || {}
          const studentAnswers = payload.answers || {}
          const studentAns = studentAnswers[key]
          const isCorrect = studentAns === p.id || (p.right && String(studentAns).trim().toLowerCase() === String(p.right).trim().toLowerCase())
          if (isCorrect) {
            correctCount++
          } else {
            const wrongMatch = pairs.find((o: any) => o.id === studentAns)?.right || studentAns || '(Chưa ghép)'
            wrongPairsMap[wrongMatch] = (wrongPairsMap[wrongMatch] || 0) + 1
          }
        })

        const totalAttempts = totalSubmissions
        const incorrectCount = totalAttempts - correctCount
        const accuracyRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

        const mistakes = Object.entries(wrongPairsMap).map(([ans, count]) => ({
          answer: ans,
          count,
          percentage: totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0,
        })).sort((a, b) => b.count - a.count).slice(0, 5)

        questionStats.push({
          id: key,
          blockId: block.id,
          blockTitle,
          type: 'matching',
          questionText: `Ghép cặp: "${p.left}"`,
          correctAnswerText: p.right || '',
          totalAttempts,
          correctCount,
          incorrectCount,
          accuracyRate,
          isHardQuestion: accuracyRate < 50,
          difficultyLevel: accuracyRate < 50 ? 'hard' : accuracyRate < 80 ? 'medium' : 'easy',
          mistakes,
        })
      })
    } else if (block.type === 'reorder') {
      const questions = (block.content as any)?.questions || []
      const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim()

      questions.forEach((q: any, qIdx: number) => {
        const correctSentence = String(q.sentence || '').trim()
        let correctCount = 0
        const wrongAttemptsMap: Record<string, number> = {}

        exam.results.forEach((r) => {
          const payload = (r.answers as any) || {}
          const studentAnswers = payload.answers || {}
          const studentAns = String(studentAnswers[q.id] || '').trim()
          if (normalize(studentAns) === normalize(correctSentence) && correctSentence !== '') {
            correctCount++
          } else {
            const displayAns = studentAns || '(Chưa sắp xếp)'
            wrongAttemptsMap[displayAns] = (wrongAttemptsMap[displayAns] || 0) + 1
          }
        })

        const totalAttempts = totalSubmissions
        const incorrectCount = totalAttempts - correctCount
        const accuracyRate = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0

        const mistakes = Object.entries(wrongAttemptsMap).map(([ans, count]) => ({
          answer: ans,
          count,
          percentage: totalAttempts > 0 ? Math.round((count / totalAttempts) * 100) : 0,
        })).sort((a, b) => b.count - a.count).slice(0, 5)

        questionStats.push({
          id: q.id,
          blockId: block.id,
          blockTitle,
          type: 'reorder',
          questionText: q.text || `Sắp xếp câu ${qIdx + 1}`,
          correctAnswerText: correctSentence,
          totalAttempts,
          correctCount,
          incorrectCount,
          accuracyRate,
          isHardQuestion: accuracyRate < 50,
          difficultyLevel: accuracyRate < 50 ? 'hard' : accuracyRate < 80 ? 'medium' : 'easy',
          mistakes,
        })
      })
    }
  })

  const hardQuestionsCount = questionStats.filter((q) => q.isHardQuestion).length

  return {
    examId: exam.id,
    title: exam.title,
    duration: exam.duration,
    totalSubmissions,
    averageScore,
    highestScore,
    lowestScore,
    hardQuestionsCount,
    questionStats,
  }
}
