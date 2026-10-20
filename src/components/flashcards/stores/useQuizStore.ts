'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VocabItem } from '@/types/vocab'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type QuizMode = 'scored' | 'endless'

export interface QuizOption {
  text: string
  id: string
}

export interface QuizAnswerRecord {
  wordId: string
  correct: boolean
  selectedWordId: string
}

export interface QuizHistoryEntry {
  id: string
  date: string // ISO string
  durationMs: number
  score: number // 0–100
  correct: number
  total: number
  mode: QuizMode
  answers: QuizAnswerRecord[]
}

interface QuizState {
  quizMode: QuizMode

  currentWordId: string | null
  options: QuizOption[]
  answered: boolean
  selectedOptionIndex: number | null
  correctOptionIndex: number

  sessionQueue: string[]
  sessionTotal: number
  sessionCorrect: number
  sessionStartMs: number
  sessionDone: boolean
  sessionAnswers: QuizAnswerRecord[]

  recentIds: string[]
  recentDistractorIds: string[]
  streak: number

  history: QuizHistoryEntry[]

  setMode: (mode: QuizMode) => void
  startSession: (vocabItems: VocabItem[], wordPoolIds?: string[]) => void
  submitAnswer: (optionIdx: number) => boolean
  nextQuestion: (vocabItems: VocabItem[]) => void
  clearHistory: () => void
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function pickWeightedDistractor(
  source: string[],
  exclude: Set<string>,
  recentDistractors: string[],
): string | null {
  const candidates = source.filter((id) => !exclude.has(id))
  if (candidates.length === 0) return null
  const DECAY = 0.12
  const weights = candidates.map((id) => {
    const pos = recentDistractors.lastIndexOf(id)
    if (pos === -1) return 1
    const age = recentDistractors.length - pos
    return Math.pow(DECAY, 1 / age)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (let i = 0; i < candidates.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return candidates[i]
  }
  return candidates[candidates.length - 1]
}

function buildOptions(
  wordId: string,
  pool: string[],
  vocabItems: VocabItem[],
  recentDistractors: string[] = [],
): {
  options: QuizOption[]
  correctOptionIndex: number
  usedDistractors: string[]
} {
  const correctWord = vocabItems.find((v) => v.id === wordId)!
  const source = pool.length >= 4 ? pool : vocabItems.map((v) => v.id)
  const exclude = new Set<string>([wordId])
  const usedDistractors: string[] = []

  while (usedDistractors.length < 3) {
    const d = pickWeightedDistractor(source, exclude, [...recentDistractors, ...usedDistractors])
    if (d === null) break
    exclude.add(d)
    usedDistractors.push(d)
  }

  const options: QuizOption[] = [
    { text: correctWord.vi, id: wordId },
    ...usedDistractors.map((id) => ({ text: vocabItems.find((v) => v.id === id)!.vi, id })),
  ]
  shuffle(options)
  return {
    options,
    correctOptionIndex: options.findIndex((o) => o.id === wordId),
    usedDistractors,
  }
}

function pickWeightedRandom(pool: string[], recentIds: string[]): string {
  if (pool.length === 1) return pool[0]
  const DECAY = 0.15
  const weights = pool.map((id) => {
    const pos = recentIds.lastIndexOf(id)
    if (pos === -1) return 1
    const age = recentIds.length - pos
    return Math.pow(DECAY, 1 / age)
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return pool[i]
  }
  return pool[pool.length - 1]
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

const RECENT_WINDOW = 8

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      quizMode: 'scored',

      currentWordId: null,
      options: [],
      answered: false,
      selectedOptionIndex: null,
      correctOptionIndex: 0,

      sessionQueue: [],
      sessionTotal: 0,
      sessionCorrect: 0,
      sessionStartMs: 0,
      sessionDone: false,
      sessionAnswers: [],

      recentIds: [],
      recentDistractorIds: [],
      streak: 0,
      history: [],

      setMode: (mode) => set({ quizMode: mode }),

      startSession: (vocabItems, wordPoolIds) => {
        if (vocabItems.length === 0) return

        const defaultPool = vocabItems.map((v) => v.id)
        const pool = wordPoolIds && wordPoolIds.length > 0 ? wordPoolIds : defaultPool
        const { quizMode } = get()

        if (quizMode === 'scored') {
          const queue = shuffle(pool.slice())
          const firstId = queue.pop()!
          const { options, correctOptionIndex, usedDistractors } = buildOptions(
            firstId,
            pool,
            vocabItems,
            [],
          )
          set({
            sessionQueue: queue,
            sessionTotal: pool.length,
            sessionCorrect: 0,
            sessionStartMs: Date.now(),
            sessionDone: false,
            sessionAnswers: [],
            currentWordId: firstId,
            options,
            correctOptionIndex,
            answered: false,
            selectedOptionIndex: null,
            streak: 0,
            recentDistractorIds: usedDistractors,
          })
        } else {
          const firstId = pickWeightedRandom(pool, [])
          const { options, correctOptionIndex, usedDistractors } = buildOptions(
            firstId,
            pool,
            vocabItems,
            [],
          )
          set({
            currentWordId: firstId,
            options,
            correctOptionIndex,
            answered: false,
            selectedOptionIndex: null,
            recentIds: [firstId],
            recentDistractorIds: usedDistractors,
            streak: 0,
            sessionDone: false,
            sessionTotal: pool.length,
            sessionCorrect: 0,
            sessionStartMs: Date.now(),
            sessionQueue: [],
            sessionAnswers: [],
          })
        }
      },

      submitAnswer: (optionIdx) => {
        const state = get()
        if (state.answered || !state.currentWordId) return false

        const isCorrect = optionIdx === state.correctOptionIndex
        const newCorrect = state.sessionCorrect + (isCorrect ? 1 : 0)
        const newStreak = isCorrect ? state.streak + 1 : 0

        const selectedWordId = state.options[optionIdx]?.id ?? ''
        const answerRecord: QuizAnswerRecord = {
          wordId: state.currentWordId,
          correct: isCorrect,
          selectedWordId,
        }
        const newAnswers = [...state.sessionAnswers, answerRecord]

        const scoredDone = state.quizMode === 'scored' && state.sessionQueue.length === 0

        if (scoredDone) {
          const durationMs = Date.now() - state.sessionStartMs
          const score = Math.round((newCorrect / state.sessionTotal) * 100)
          const entry: QuizHistoryEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            date: new Date().toISOString(),
            durationMs,
            score,
            correct: newCorrect,
            total: state.sessionTotal,
            mode: 'scored',
            answers: newAnswers,
          }
          set({
            answered: true,
            selectedOptionIndex: optionIdx,
            sessionCorrect: newCorrect,
            sessionAnswers: newAnswers,
            streak: newStreak,
            sessionDone: true,
            history: [entry, ...state.history].slice(0, 50),
          })
        } else {
          set({
            answered: true,
            selectedOptionIndex: optionIdx,
            sessionCorrect: newCorrect,
            sessionAnswers: newAnswers,
            streak: newStreak,
          })
        }

        return isCorrect
      },

      nextQuestion: (vocabItems) => {
        const state = get()
        if (vocabItems.length === 0) return

        const pool = vocabItems.map((v) => v.id)
        const recentDist = state.recentDistractorIds
        const DIST_WINDOW = 12

        if (state.quizMode === 'scored') {
          if (state.sessionQueue.length === 0) return
          const queue = [...state.sessionQueue]
          const nextId = queue.pop()!
          const { options, correctOptionIndex, usedDistractors } = buildOptions(
            nextId,
            pool,
            vocabItems,
            recentDist,
          )
          set({
            sessionQueue: queue,
            currentWordId: nextId,
            options,
            correctOptionIndex,
            answered: false,
            selectedOptionIndex: null,
            recentDistractorIds: [...recentDist, ...usedDistractors].slice(-DIST_WINDOW),
          })
        } else {
          const recent = state.recentIds
          const nextId = pickWeightedRandom(pool, recent)
          const { options, correctOptionIndex, usedDistractors } = buildOptions(
            nextId,
            pool,
            vocabItems,
            recentDist,
          )
          const newRecent = [...recent, nextId].slice(-RECENT_WINDOW)
          set({
            currentWordId: nextId,
            options,
            correctOptionIndex,
            answered: false,
            selectedOptionIndex: null,
            recentIds: newRecent,
            recentDistractorIds: [...recentDist, ...usedDistractors].slice(-DIST_WINDOW),
          })
        }
      },

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'quiz-storage',
      partialize: (s) => ({ history: s.history }),
    },
  ),
)
