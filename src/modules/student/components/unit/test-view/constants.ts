export const MATCH_COLORS = [
  { border: 'border-blue-400', bg: 'bg-blue-50/80', text: 'text-blue-700', badge: 'bg-blue-500' },
  { border: 'border-emerald-400', bg: 'bg-emerald-50/80', text: 'text-emerald-700', badge: 'bg-emerald-500' },
  { border: 'border-purple-400', bg: 'bg-purple-50/80', text: 'text-purple-700', badge: 'bg-purple-500' },
  { border: 'border-amber-400', bg: 'bg-amber-50/80', text: 'text-amber-700', badge: 'bg-amber-500' },
  { border: 'border-rose-400', bg: 'bg-rose-50/80', text: 'text-rose-700', badge: 'bg-rose-500' },
  { border: 'border-cyan-400', bg: 'bg-cyan-50/80', text: 'text-cyan-700', badge: 'bg-cyan-500' },
  { border: 'border-indigo-400', bg: 'bg-indigo-50/80', text: 'text-indigo-700', badge: 'bg-indigo-500' },
  { border: 'border-teal-400', bg: 'bg-teal-50/80', text: 'text-teal-700', badge: 'bg-teal-500' },
]

export const normalizeSentence = (str?: string | number) => {
  return String(str || '')
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
