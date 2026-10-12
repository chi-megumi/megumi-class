import React from 'react'
import { BookOpen } from 'lucide-react'
import { VocabEmptyStateProps } from './types'

export const VocabEmptyState: React.FC<VocabEmptyStateProps> = ({
  message = 'Chưa có từ vựng nào trong bài học này.',
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
        <BookOpen size={30} />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  )
}

export default VocabEmptyState
