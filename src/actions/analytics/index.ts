'use server'

import * as gameProgressModule from './game-progress'
import * as examSessionModule from './exam-session'
import * as examAnalyticsModule from './exam-analytics'
import * as classAnalyticsModule from './class-analytics'
import * as unitAnalyticsModule from './unit-analytics'

/**
 * Game progress action
 */
export async function recordGameCompletion(
  ...args: Parameters<typeof gameProgressModule.recordGameCompletion>
) {
  return gameProgressModule.recordGameCompletion(...args)
}

/**
 * Exam session actions
 */
export async function startTest(...args: Parameters<typeof examSessionModule.startTest>) {
  return examSessionModule.startTest(...args)
}

export async function submitTestResult(
  ...args: Parameters<typeof examSessionModule.submitTestResult>
) {
  return examSessionModule.submitTestResult(...args)
}

/**
 * Exam analytics actions
 */
export async function getTestSubmissions(
  ...args: Parameters<typeof examAnalyticsModule.getTestSubmissions>
) {
  return examAnalyticsModule.getTestSubmissions(...args)
}

export async function getExamQuestionAnalytics(
  ...args: Parameters<typeof examAnalyticsModule.getExamQuestionAnalytics>
) {
  return examAnalyticsModule.getExamQuestionAnalytics(...args)
}

/**
 * Class analytics actions
 */
export async function getClassLeaderboard(
  ...args: Parameters<typeof classAnalyticsModule.getClassLeaderboard>
) {
  return classAnalyticsModule.getClassLeaderboard(...args)
}

export async function getStudentExamHistory(
  ...args: Parameters<typeof classAnalyticsModule.getStudentExamHistory>
) {
  return classAnalyticsModule.getStudentExamHistory(...args)
}

/**
 * Unit analytics action
 */
export async function getUnitAnalytics(
  ...args: Parameters<typeof unitAnalyticsModule.getUnitAnalytics>
) {
  return unitAnalyticsModule.getUnitAnalytics(...args)
}

export type * from './types'
export type { ExamGradingResult } from './grading'
