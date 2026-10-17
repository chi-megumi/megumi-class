'use client'

import React from 'react'
import { Check, X, CheckCircle2 } from 'lucide-react'
import type { TestBlock, TestQuestion } from '@/modules/teacher/types'
import type { Submission } from './types'

type BlockAnswerReviewProps = {
  block: TestBlock
  index: number
  submission: Submission
}

function normalizeSentence(s: string) {
  return s
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function BlockAnswerReview({ block, index, submission }: BlockAnswerReviewProps) {
  return (
    <div className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm mb-4">
      <div className="font-bold text-indigo-700 mb-4 pb-2 border-b">
        Phần {index + 1}: {block.title}
      </div>

      {/* Multiple Choice */}
      {block.type === 'multiple_choice' && (
        <div className="space-y-6">
          {block.content?.questions?.map((q: TestQuestion, qIndex: number) => {
            const studentAns = submission.result.answers[q.id] as number
            const correctAns =
              (submission.result.correctAnswersDetail?.[q.id] as number) ?? q.correctIndex

            return (
              <div key={q.id} className="space-y-2">
                <p className="font-medium text-gray-800">
                  {qIndex + 1}. {q.text}
                </p>
                <div className="grid grid-cols-1 gap-2 pl-4">
                  {(q.options || []).map((opt, oIdx) => {
                    const isStudentChoice = studentAns === oIdx
                    const isCorrectChoice = correctAns === oIdx

                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-lg border flex items-center gap-2 ${
                          isCorrectChoice
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : isStudentChoice && !isCorrectChoice
                              ? 'bg-red-50 border-red-200 text-red-800'
                              : 'bg-gray-50 border-gray-100 text-gray-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border text-[10px] ${
                            isCorrectChoice
                              ? 'bg-green-500 border-green-500 text-white'
                              : isStudentChoice && !isCorrectChoice
                                ? 'bg-red-500 border-red-500 text-white'
                                : 'border-gray-300'
                          }`}
                        >
                          {isCorrectChoice ? (
                            <Check size={11} strokeWidth={3} />
                          ) : isStudentChoice ? (
                            <X size={11} strokeWidth={3} />
                          ) : null}
                        </div>
                        <span>{opt}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Fill in Blank */}
      {block.type === 'fill_blank' &&
        (() => {
          const questions =
            block.content?.questions && block.content.questions.length > 0
              ? block.content.questions
              : [
                  {
                    id: block.id,
                    text: block.content?.text || '',
                    answer: block.content?.answer || '',
                  },
                ]

          return (
            <div className="space-y-4">
              {questions.map((q: TestQuestion, qIdx: number) => {
                const studentAns = String(submission.result.answers[q.id] || '').trim()
                const correctAns = String(
                  submission.result.correctAnswersDetail?.[q.id] || q.answer || '',
                ).trim()
                const isCorrect = studentAns.toLowerCase() === correctAns.toLowerCase()

                return (
                  <div key={q.id} className="p-4 rounded-xl border bg-gray-50/50 space-y-2">
                    <p className="font-medium text-gray-800">
                      {qIdx + 1}. {q.text}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      {isCorrect ? (
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      ) : (
                        <X size={16} className="text-red-500 shrink-0" />
                      )}
                      <span className="text-sm font-semibold text-gray-600">Học sinh điền:</span>
                      <span
                        className={`text-sm font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {studentAns || '(Bỏ trống)'}
                      </span>
                      {!isCorrect && (
                        <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 ml-2 font-medium">
                          Đáp án đúng: <b>{correctAns}</b>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}

      {/* Matching */}
      {block.type === 'matching' &&
        (() => {
          const pairs = block.content?.pairs || []
          return (
            <div className="space-y-3">
              {pairs.map((p, pIdx) => {
                const answerKey = `${block.id}_${p.id}`
                const studentChoice = submission.result.answers[answerKey]
                const matchedPair = pairs.find((other) => other.id === studentChoice)
                const studentText = matchedPair
                  ? matchedPair.right
                  : studentChoice || '(Chưa ghép)'
                const isCorrect =
                  studentChoice === p.id ||
                  (p.right &&
                    String(studentChoice).trim().toLowerCase() ===
                      String(p.right).trim().toLowerCase())

                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-2 font-medium text-gray-800">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {pIdx + 1}
                      </span>
                      <span>{p.left}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                      ) : (
                        <X size={16} className="text-red-500 shrink-0" />
                      )}
                      <span
                        className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
                      >
                        {studentText}
                      </span>
                      {!isCorrect && (
                        <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 font-medium">
                          Đúng: <b>{p.right}</b>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}

      {/* Reorder */}
      {block.type === 'reorder' &&
        (() => {
          const questions = block.content?.questions || []

          return (
            <div className="space-y-4">
              {questions.map((q, qIdx) => {
                const studentSentence = String(submission.result.answers[q.id] || '').trim()
                const correctSentence = String(
                  submission.result.correctAnswersDetail?.[q.id] || q.sentence || '',
                ).trim()
                const isCorrect =
                  normalizeSentence(studentSentence) === normalizeSentence(correctSentence)

                return (
                  <div key={q.id} className="p-4 rounded-xl border bg-gray-50/50 space-y-2">
                    <p className="font-medium text-gray-800 text-sm">
                      {qIdx + 1}. {q.text || 'Sắp xếp câu:'}
                    </p>
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                        ) : (
                          <X size={16} className="text-red-500 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-gray-500">
                          Học sinh ghép:
                        </span>
                        <span
                          className={`text-sm font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
                        >
                          {studentSentence || '(Chưa làm)'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="text-xs text-green-700 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">
                          Đáp án chuẩn: <b>{correctSentence}</b>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
    </div>
  )
}
