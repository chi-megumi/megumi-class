import React from 'react'
import type { TestQuestion } from '~/modules/teacher/types'
import type { TestResultPayload } from '@/actions/analytics/types'

type FillBlankBlockProps = {
  blockId: string
  questions?: TestQuestion[]
  text?: string
  answer?: string
  answers: Record<string, string | number>
  isMiniChallenge: boolean
  isReviewMode: boolean
  result: TestResultPayload | null
  onAnswer: (questionId: string, value: string | number) => void
}

function FillBlankBlock({ blockId, questions, text, answer, answers, isMiniChallenge, isReviewMode, result, onAnswer }: FillBlankBlockProps) {
  const effectiveQuestions = (questions && questions.length > 0)
    ? questions
    : [{ id: blockId, text: text || '', answer: answer || '' }]

  return (
    <div className="space-y-2.5">
      {effectiveQuestions.map((q: TestQuestion, qIdx: number) => {
        const qId = q.id
        const answerStr = String(answers[qId] || '').trim().toLowerCase()
        const hasCorrectDetail = result?.correctAnswersDetail !== undefined
        const correctStr = String(result?.correctAnswersDetail?.[qId] || '').trim().toLowerCase()
        const isCorrect = answerStr === correctStr
        const showCorrect = isReviewMode && hasCorrectDetail && isCorrect
        const showIncorrect = isReviewMode && hasCorrectDetail && !isCorrect && answerStr !== ''

        return (
          <div key={qId ? `${qId}_${qIdx}` : `fb-${qIdx}`} className="space-y-1 p-2.5 bg-gray-50/60 rounded-lg border border-gray-100">
            <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
              <span className="font-bold text-gray-400 mr-1">{qIdx + 1}.</span>
              {(q.text || '').split('___').map((part: string, i: number, arr: string[]) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="relative inline-block mx-1">
                      <input 
                        type="text" 
                        value={answers[qId] || ''}
                        onChange={(e) => onAnswer(qId, e.target.value)}
                        disabled={isReviewMode}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        autoComplete="off"
                        className={`w-24 sm:w-28 border-b-2 bg-white px-1.5 py-1 sm:py-0.5 rounded-t text-center font-bold text-base sm:text-xs focus:outline-none transition-colors ${
                          showCorrect
                            ? 'border-green-500 text-green-700 bg-green-50'
                            : showIncorrect
                              ? 'border-red-500 text-red-700 bg-red-50'
                              : isMiniChallenge 
                                ? 'border-orange-300 text-orange-600 focus:border-orange-600 bg-orange-50' 
                                : 'border-indigo-300 text-indigo-600 focus:border-indigo-600 bg-indigo-50/30'
                        }`} 
                      />
                      {isReviewMode && hasCorrectDetail && !isCorrect && (
                        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-green-600 whitespace-nowrap bg-green-100 px-1 py-0.2 rounded shadow-2xs border border-green-200 z-10">
                          Đáp án: {String(result?.correctAnswersDetail?.[qId] || '')}
                        </span>
                      )}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default React.memo(FillBlankBlock)
