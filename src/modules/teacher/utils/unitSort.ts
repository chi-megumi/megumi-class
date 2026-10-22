/**
 * Utility to sort units strictly by creation order:
 * 1. Oldest createdAt first (earliest created comes first)
 * 2. If createdAt is identical (e.g. batch-created with class): sortOrder ascending
 * 3. Fallback for legacy data where createdAt and sortOrder are identical: natural title order (e.g. "unit 1" < "unit 2")
 * 4. Final tiebreaker: deterministic id comparison
 */
const getTime = (val?: Date | string | null): number => {
  if (!val) return 0
  const d = new Date(val)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}

export function sortUnits<
  T extends {
    id?: string
    title?: string
    createdAt?: Date | string | null
    sortOrder?: number | null
  }
>(units: T[] = []): T[] {
  return [...units].sort((a, b) => {
    const timeA = getTime(a.createdAt)
    const timeB = getTime(b.createdAt)
    if (timeA !== timeB) {
      return timeA - timeB
    }

    const orderA = a.sortOrder ?? 0
    const orderB = b.sortOrder ?? 0
    if (orderA !== orderB) {
      return orderA - orderB
    }

    const titleA = a.title || ''
    const titleB = b.title || ''
    const titleComp = titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: 'base' })
    if (titleComp !== 0) {
      return titleComp
    }

    return (a.id || '').localeCompare(b.id || '')
  })
}
