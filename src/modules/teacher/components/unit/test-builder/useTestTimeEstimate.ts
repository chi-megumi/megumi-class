import { useMemo } from 'react'
import type { TestBlock } from '@/modules/teacher/types'

export function useTestTimeEstimate(blocks: TestBlock[], testDuration: number) {
  return useMemo(() => {
    let mins = 0
    blocks.forEach((b) => {
      if (b.type === 'multiple_choice') {
        mins += (b.content?.questions?.length || 0) * 1.5
      } else if (b.type === 'fill_blank') {
        mins += (b.content?.questions?.length || (b.content?.text ? 1 : 0)) * 2
      } else if (b.type === 'matching') {
        mins += (b.content?.pairs?.length || 0) * 0.8
      } else if (b.type === 'reorder') {
        mins += (b.content?.questions?.length || 0) * 2
      } else {
        mins += 2
      }
    })

    const estimatedMins = Math.ceil(mins)
    const durationNum = Number(testDuration)

    let timeWarning: string | null = null
    if (estimatedMins > durationNum * 1.3) {
      timeWarning = '⚠️ Nội dung hơi dài so với thời gian thi, học sinh có thể không làm kịp.'
    } else if (durationNum >= 45 && estimatedMins < durationNum * 0.4) {
      timeWarning = '⚠️ Thời gian thi khá dài nhưng nội dung lại quá ngắn.'
    }

    return {
      estimatedMins,
      timeWarning,
    }
  }, [blocks, testDuration])
}
