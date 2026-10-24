import React from 'react'
import { CheckCircle2, X } from 'lucide-react'
import type { TestQuestion } from '@/modules/teacher/types'
import type { TestResultPayload } from '@/actions/analytics/types'
import { getActiveQuestionOptions } from '@/modules/teacher/utils/questionUtils'

type MultipleChoiceBlockProps = {
  questions: TestQuestion[]
  answers: Record<string, string | number>
  isMiniChallenge: boolean
  isReviewMode: boolean
  result: TestResultPayload | null
  onAnswer: (questionId: string, value: string | number) => void
}

function MultipleChoiceBlock({ questions, answers, isMiniChallenge, isReviewMode, result, onAnswer }: MultipleChoiceBlockProps) {
  return (
    <div className="space-y-3.5">
      {questions?.map((q: TestQuestion, qIndex: number) => {
        const displayOptions = getActiveQuestionOptions(q.options)
        const isTwoOptions = displayOptions.length <= 2

        return (
          <div key={q.id ? `${q.id}_${qIndex}` : `mc-${qIndex}`} className="space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-gray-800">
              <span className="font-bold text-gray-400 mr-1">{qIndex + 1}.</span> {q.text}
            </p>
            <div
              className={`grid gap-1.5 pl-1 md:pl-2 ${
                isTwoOptions ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'
              }`}
            >
              {displayOptions.map((opt) => {
                const oIdx = opt.index
                const isSelected = answers[q.id] === oIdx
                const hasCorrectDetail = result?.correctAnswersDetail !== undefined
                const isCorrect = result?.correctAnswersDetail?.[q.id] === oIdx
                const showCorrect = isReviewMode && hasCorrectDetail && isCorrect
                const showIncorrect = isReviewMode && hasCorrectDetail && isSelected && !isCorrect

                return (
                  <button
                    key={opt.label}
                    onClick={() => onAnswer(q.id, oIdx)}
                    disabled={isReviewMode}
                    className={`flex items-center gap-2 py-2 px-2.5 rounded-lg border text-left transition-colors duration-150 min-h-[38px] ${
                      showCorrect
                        ? 'border-green-500 bg-green-50 ring-1 ring-green-300'
                        : showIncorrect
                          ? 'border-red-500 bg-red-50 ring-1 ring-red-300'
                          : isSelected 
                            ? (isMiniChallenge ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-300' : 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-300')
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${isReviewMode ? 'cursor-default' : ''}`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      showCorrect
                        ? 'border-green-500 bg-green-500 text-white'
                        : showIncorrect
                          ? 'border-red-500 bg-red-500 text-white'
                          : isSelected 
                            ? (isMiniChallenge ? 'border-orange-500' : 'border-indigo-500')
                            : 'border-gray-300'
                    }`}>
                      {showCorrect ? <CheckCircle2 size={10} /> : showIncorrect ? <X size={10} /> : isSelected && <div className={`w-1.5 h-1.5 rounded-full ${isMiniChallenge ? 'bg-orange-500' : 'bg-indigo-500'}`} />}
                    </div>
                    <span className="font-bold text-gray-500 text-xs">{opt.label}.</span>
                    <span className={`font-medium text-xs ${showCorrect ? 'text-green-800' : showIncorrect ? 'text-red-800' : 'text-gray-700'}`}>{opt.text}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default React.memo(MultipleChoiceBlock)
