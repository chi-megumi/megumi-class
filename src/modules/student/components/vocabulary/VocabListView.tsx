import React from 'react'
import { VocabListViewProps } from './types'
import VocabListItem from './VocabListItem'

export const VocabListView: React.FC<VocabListViewProps> = ({
  items,
  masteredSet,
  toggleMasteredById,
  speak,
  onPreviewImage,
}) => {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-gray-50 print:border-gray-200 print:shadow-none">
      {items.map((item) => {
        const isMastered = masteredSet.includes(item.id)
        return (
          <VocabListItem
            key={item.id}
            item={item}
            isMastered={isMastered}
            onToggleMastered={() => toggleMasteredById(item.id)}
            onSpeak={() => speak(item.word)}
            onPreviewImage={onPreviewImage}
          />
        )
      })}
    </div>
  )
}

export default VocabListView
