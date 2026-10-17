/**
 * Utility to format Date / timestamp into readable Vietnamese date & time strings
 */

export interface FormattedDateTime {
  /** e.g. "19:21" */
  time: string
  /** e.g. "19:21:05" */
  timeWithSeconds: string
  /** e.g. "17/10/2026" */
  date: string
  /** e.g. "19:21 - 17/10/2026" */
  full: string
  /** e.g. "19:21:05 - 17/10/2026" */
  fullWithSeconds: string
}

export function formatDateTime(dateVal?: Date | string | null): FormattedDateTime | null {
  if (!dateVal) return null
  const d = new Date(dateVal)
  if (isNaN(d.getTime()) || d.getTime() === 0) return null

  const pad = (n: number) => n.toString().padStart(2, '0')
  const hours = pad(d.getHours())
  const minutes = pad(d.getMinutes())
  const seconds = pad(d.getSeconds())
  const day = pad(d.getDate())
  const month = pad(d.getMonth() + 1)
  const year = d.getFullYear()

  const time = `${hours}:${minutes}`
  const timeWithSeconds = `${hours}:${minutes}:${seconds}`
  const date = `${day}/${month}/${year}`

  return {
    time,
    timeWithSeconds,
    date,
    full: `${time} - ${date}`,
    fullWithSeconds: `${timeWithSeconds} - ${date}`,
  }
}
