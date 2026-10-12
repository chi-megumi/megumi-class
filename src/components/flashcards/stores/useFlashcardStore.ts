'use client'

import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { VocabItem } from '@/types/vocab'
import { playSound } from '../utils/sound'

export type FilterType = string | 'all' | 'starred' | 'memorize' // string is category slug
export type AppMode = 'flashcard' | 'quiz' | 'match'

interface FlashcardState {
  vocabItems: VocabItem[]
  currentId?: string
  isFlipped: boolean
  masteredSet: string[]
  starredSet: string[]
  activeFilter: FilterType
  searchQuery: string
  activeMode: AppMode

  // Actions
  setVocabItems: (items: VocabItem[]) => void
  flipCard: () => void
  nextCard: () => void
  prevCard: () => void
  toggleMastered: () => void
  toggleMasteredById: (id: string) => void
  toggleStar: () => void
  setFilter: (filter: FilterType) => void
  setSearch: (query: string) => void
  setMode: (mode: AppMode) => void
  setCurrentId: (id: string) => void
}

// ─────────────────────────────────────────────────────────────────
// Pure helper: compute filtered ids from a state snapshot.
// ─────────────────────────────────────────────────────────────────
export function computeFilteredIds(
  vocabItems: VocabItem[],
  activeFilter: FilterType,
  starredSet: string[],
  masteredSet: string[],
  searchQuery: string,
): string[] {
  let items = vocabItems

  if (activeFilter === 'starred') {
    items = items.filter((item) => starredSet.includes(item.id))
  } else if (activeFilter === 'memorize') {
    items = items.filter((item) => masteredSet.includes(item.id))
  } else if (activeFilter !== 'all') {
    items = items.filter((item) => item.category?.slug === activeFilter)
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim()
    items = items.filter((item) => {
      return (
        item.word.toLowerCase().includes(q) ||
        item.vi.toLowerCase().includes(q) ||
        (item.example && item.example.toLowerCase().includes(q))
      )
    })
  }

  return items.map((item) => item.id)
}

// ─────────────────────────────────────────────────────────────────
// Hook: use this in components instead of the old getFilteredIndices().
// ─────────────────────────────────────────────────────────────────
export function useFilteredIds(): string[] {
  return useFlashcardStore(
    useShallow((state) =>
      computeFilteredIds(
        state.vocabItems,
        state.activeFilter,
        state.starredSet,
        state.masteredSet,
        state.searchQuery,
      ),
    ),
  )
}

export const createFlashcardStore = (storageName: string) =>
  createStore<FlashcardState>()(
    persist(
      (set, get) => ({
        vocabItems: [],
        currentId: undefined,
        isFlipped: false,
        masteredSet: [],
        starredSet: [],
        activeFilter: 'all',
        searchQuery: '',
        activeMode: 'flashcard',

        setVocabItems: (items) => {
          set({ vocabItems: items })
          const { activeFilter, starredSet, masteredSet, searchQuery, currentId } = get()
          const filtered = computeFilteredIds(
            items,
            activeFilter,
            starredSet,
            masteredSet,
            searchQuery,
          )
          if (filtered.length > 0) {
            if (!currentId || !filtered.includes(currentId)) {
              set({ currentId: filtered[0], isFlipped: false })
            }
          } else {
            set({ currentId: undefined, isFlipped: false })
          }
        },

        flipCard: () => {
          const { vocabItems, activeFilter, masteredSet, starredSet, searchQuery } = get()
          const filtered = computeFilteredIds(
            vocabItems,
            activeFilter,
            starredSet,
            masteredSet,
            searchQuery,
          )
          if (filtered.length === 0) return

          playSound('flip')
          set((s) => ({ isFlipped: !s.isFlipped }))
        },

        nextCard: () => {
          const { vocabItems, activeFilter, starredSet, masteredSet, searchQuery, currentId } = get()
          const filtered = computeFilteredIds(
            vocabItems,
            activeFilter,
            starredSet,
            masteredSet,
            searchQuery,
          )
          if (filtered.length === 0) return

          const currentFiltered = currentId ? filtered.indexOf(currentId) : -1
          if (currentFiltered >= filtered.length - 1) return

          const nextFiltered = currentFiltered === -1 ? 0 : currentFiltered + 1
          set({ currentId: filtered[nextFiltered], isFlipped: false })
        },

        prevCard: () => {
          const { vocabItems, activeFilter, starredSet, masteredSet, searchQuery, currentId } = get()
          const filtered = computeFilteredIds(
            vocabItems,
            activeFilter,
            starredSet,
            masteredSet,
            searchQuery,
          )
          if (filtered.length === 0) return

          const currentFiltered = currentId ? filtered.indexOf(currentId) : -1
          if (currentFiltered <= 0) return

          set({ currentId: filtered[currentFiltered - 1], isFlipped: false })
        },

        toggleMastered: () => {
          const { vocabItems, currentId, activeFilter, masteredSet, starredSet, searchQuery } = get()
          if (!currentId) return

          const isRemoving = masteredSet.includes(currentId)
          const newMasteredSet = isRemoving
            ? masteredSet.filter((id) => id !== currentId)
            : [...masteredSet, currentId]

          if (isRemoving) {
            playSound('incorrect')
          } else {
            playSound('correct')
          }

          if (isRemoving && activeFilter === 'memorize') {
            const remaining = computeFilteredIds(
              vocabItems,
              'memorize',
              starredSet,
              newMasteredSet,
              searchQuery,
            )
            const pos = remaining.indexOf(currentId)
            const nextId =
              remaining.length === 0
                ? undefined
                : (remaining[pos] ?? remaining[pos - 1] ?? remaining[0])
            set({ masteredSet: newMasteredSet, currentId: nextId, isFlipped: false })
          } else {
            set({ masteredSet: newMasteredSet })
          }
        },

        toggleMasteredById: (id: string) => {
          const { masteredSet } = get()
          const isRemoving = masteredSet.includes(id)
          const newMasteredSet = isRemoving
            ? masteredSet.filter((mId) => mId !== id)
            : [...masteredSet, id]

          if (isRemoving) {
            playSound('incorrect')
          } else {
            playSound('correct')
          }
          set({ masteredSet: newMasteredSet })
        },

        toggleStar: () => {
          const { vocabItems, currentId, activeFilter, starredSet, masteredSet, searchQuery } = get()
          if (!currentId) return

          const isRemoving = starredSet.includes(currentId)
          const newStarredSet = isRemoving
            ? starredSet.filter((id) => id !== currentId)
            : [...starredSet, currentId]

          if (isRemoving && activeFilter === 'starred') {
            const remaining = computeFilteredIds(
              vocabItems,
              'starred',
              newStarredSet,
              masteredSet,
              searchQuery,
            )
            const pos = remaining.indexOf(currentId)
            const nextId =
              remaining.length === 0
                ? undefined
                : (remaining[pos] ?? remaining[pos - 1] ?? remaining[0])
            set({ starredSet: newStarredSet, currentId: nextId, isFlipped: false })
          } else {
            set({ starredSet: newStarredSet })
          }
        },

        setFilter: (filter) => {
          const { vocabItems, searchQuery, starredSet, masteredSet } = get()
          const filtered = computeFilteredIds(
            vocabItems,
            filter,
            starredSet,
            masteredSet,
            searchQuery,
          )
          set({ activeFilter: filter, currentId: filtered[0], isFlipped: false })
        },

        setSearch: (query) => {
          const { vocabItems, activeFilter, starredSet, masteredSet } = get()
          const filtered = computeFilteredIds(
            vocabItems,
            activeFilter,
            starredSet,
            masteredSet,
            query,
          )
          set({ searchQuery: query, currentId: filtered[0], isFlipped: false })
        },

        setMode: (mode) => set({ activeMode: mode, isFlipped: false }),

        setCurrentId: (id) => set({ currentId: id, isFlipped: false }),
      }),
      {
        name: storageName,
        partialize: (state) => ({
          masteredSet: state.masteredSet,
          starredSet: state.starredSet,
        }),
      },
    ),
  )

import React, { createContext, useContext, useState } from 'react'
import { useStore, StoreApi } from 'zustand'

export const FlashcardContext = createContext<StoreApi<FlashcardState> | null>(null)

export function FlashcardProvider({ children, storageName }: { children: React.ReactNode, storageName: string }) {
  const [store] = useState(() => createFlashcardStore(storageName))
  
  return React.createElement(
    FlashcardContext.Provider,
    { value: store },
    children
  )
}

export function useFlashcardStore<T>(selector: (state: FlashcardState) => T): T {
  const store = useContext(FlashcardContext)
  if (!store) {
    throw new Error('useFlashcardStore must be used within a FlashcardProvider')
  }
  return useStore(store, selector)
}
