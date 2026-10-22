import React from 'react'
import { VocabGridViewProps } from './types'
import VocabGridCard from './VocabGridCard'

export const VocabGridView: React.FC<VocabGridViewProps> = ({
  items,
  masteredSet,
  toggleMasteredById,
  speak,
  onPreviewImage,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-4">
      {items.map((item) => {
        const isMastered = masteredSet.includes(item.id)
        return (
          <VocabGridCard
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

export default VocabGridView
