import type { TestBlock } from '~/modules/teacher/types'

export type StoredActiveExamSession = {
  testId: string
  classId: string
  unitId?: string
  startedAt: string
  targetEndTime: number
  blocks: TestBlock[]
  answers: Record<string, string | number>
  lastSavedAt: string
}

export function getExamStorageKey(classId: string, testId: string): string {
  return `megumi_exam_active_${classId}_${testId}`
}

export function loadStoredExamSession(
  classId: string,
  testId: string,
): StoredActiveExamSession | null {
  if (typeof window === 'undefined') return null
  try {
    const key = getExamStorageKey(classId, testId)
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredActiveExamSession
    if (!parsed || parsed.testId !== testId) return null
    return parsed
  } catch (e) {
    console.error('Error loading stored exam session:', e)
    return null
  }
}

export function saveStoredExamSession(session: StoredActiveExamSession): void {
  if (typeof window === 'undefined') return
  try {
    const key = getExamStorageKey(session.classId, session.testId)
    localStorage.setItem(key, JSON.stringify(session))
  } catch (e) {
    console.error('Error saving stored exam session:', e)
  }
}

export function clearStoredExamSession(classId: string, testId: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = getExamStorageKey(classId, testId)
    localStorage.removeItem(key)
  } catch (e) {
    console.error('Error clearing stored exam session:', e)
  }
}
