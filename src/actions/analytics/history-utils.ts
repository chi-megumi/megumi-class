import type { ExamAttemptHistoryEntry } from './types'

/**
 * Calculates duration in seconds between two dates/timestamps
 */
export function calculateExamDuration(
  startedAt?: Date | string | null,
  completedAt?: Date | string | null,
): number {
  if (!startedAt || !completedAt) return 0
  const startMs = new Date(startedAt).getTime()
  const endMs = new Date(completedAt).getTime()
  if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) return 0
  return Math.max(1, Math.round((endMs - startMs) / 1000))
}

/**
 * Formats seconds into human readable Vietnamese string, e.g. "45s", "12p 30s", "1h 15p"
 */
export function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return '0s'
  const hours = Math.floor(seconds / 3600)
  const remainder = seconds % 3600
  const minutes = Math.floor(remainder / 60)
  const secs = remainder % 60

  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? `${minutes}p` : ''}`.trim()
  }
  if (minutes === 0) {
    return `${secs}s`
  }
  return `${minutes}p ${secs > 0 ? `${secs}s` : ''}`.trim()
}

type StoredPayloadLike = {
  score?: number | null
  correctAnswers?: number | null
  totalQuestions?: number | null
  answers?: Record<string, unknown> | null
  correctAnswersDetail?: Record<string, string | number> | null
  startedAt?: string | Date | null
  completedAt?: string | Date | null
  durationSeconds?: number | null
  attemptCount?: number | null
  bestScore?: number | null
  isInterrupted?: boolean
  history?: Array<unknown> | null
}

type ExamResultLike = {
  score?: number | null
  startedAt?: Date | string | null
  completedAt?: Date | string | null
  answers?: unknown
}

/**
 * Normalizes exam attempts into a clean, sequential ExamAttemptHistoryEntry[]
 * Handles legacy entries, deduplication, missing fields, and synthesizes attempt 1 if missing.
 */
export function normalizeExamHistory(
  payload?: StoredPayloadLike | null,
  examResult?: ExamResultLike | null,
): ExamAttemptHistoryEntry[] {
  const rawPayload = payload || {}
  const rawList = Array.isArray(rawPayload.history) ? rawPayload.history : []
  const hasDbCompleted = !!examResult?.completedAt || !!rawPayload.completedAt

  const normalizedList: ExamAttemptHistoryEntry[] = []

  for (let idx = 0; idx < rawList.length; idx++) {
    const item = rawList[idx] as Partial<ExamAttemptHistoryEntry> | null
    if (!item) continue

    const startedAt = item.startedAt
      ? new Date(item.startedAt).toISOString()
      : (examResult?.startedAt ? new Date(examResult.startedAt).toISOString() : new Date().toISOString())

    const completedAt = item.completedAt
      ? new Date(item.completedAt).toISOString()
      : (examResult?.completedAt ? new Date(examResult.completedAt).toISOString() : new Date().toISOString())

    const calcDuration = item.durationSeconds && item.durationSeconds > 0
      ? item.durationSeconds
      : calculateExamDuration(startedAt, completedAt)

    const isLatest = idx === rawList.length - 1

    normalizedList.push({
      attempt: item.attempt || idx + 1,
      score: typeof item.score === 'number' ? item.score : (examResult?.score ?? rawPayload.score ?? 0),
      correctAnswers: item.correctAnswers ?? (isLatest ? rawPayload.correctAnswers ?? null : null),
      totalQuestions: item.totalQuestions ?? (isLatest ? rawPayload.totalQuestions ?? null : null),
      durationSeconds: calcDuration > 0 ? calcDuration : (isLatest ? rawPayload.durationSeconds ?? null : null),
      startedAt,
      completedAt,
      isInterrupted: !!item.isInterrupted,
      answers: (item.answers as Record<string, unknown>) || (isLatest ? (rawPayload.answers as Record<string, unknown>) || {} : {}),
      correctAnswersDetail: item.correctAnswersDetail || (isLatest ? rawPayload.correctAnswersDetail || {} : {}),
    })
  }

  // If raw history was empty but exam has been completed, synthesize attempt 1
  if (normalizedList.length === 0 && hasDbCompleted) {
    const startedAt = examResult?.startedAt
      ? new Date(examResult.startedAt).toISOString()
      : (rawPayload.startedAt ? new Date(rawPayload.startedAt).toISOString() : new Date().toISOString())

    const completedAt = examResult?.completedAt
      ? new Date(examResult.completedAt).toISOString()
      : (rawPayload.completedAt ? new Date(rawPayload.completedAt).toISOString() : new Date().toISOString())

    const durationSeconds = rawPayload.durationSeconds && rawPayload.durationSeconds > 0
      ? rawPayload.durationSeconds
      : calculateExamDuration(startedAt, completedAt)

    normalizedList.push({
      attempt: 1,
      score: examResult?.score ?? rawPayload.score ?? 0,
      correctAnswers: rawPayload.correctAnswers ?? null,
      totalQuestions: rawPayload.totalQuestions ?? null,
      durationSeconds: durationSeconds > 0 ? durationSeconds : null,
      startedAt,
      completedAt,
      isInterrupted: !!rawPayload.isInterrupted,
      answers: (rawPayload.answers as Record<string, unknown>) || {},
      correctAnswersDetail: rawPayload.correctAnswersDetail || {},
    })
  }

  // Ensure sequential 1-based indexing for attempt numbers
  return normalizedList.map((entry, index) => ({
    ...entry,
    attempt: index + 1,
  }))
}
