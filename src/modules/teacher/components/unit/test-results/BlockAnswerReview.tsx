'use client'

import React from 'react'
import { Check, X, CheckCircle2, BookOpen, HelpCircle } from 'lucide-react'
import type { TestBlock, TestQuestion } from '@/modules/teacher/types'
import { getActiveQuestionOptions } from '@/modules/teacher/utils/questionUtils'
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
                  {getActiveQuestionOptions(q.options).map((opt) => {
                    const oIdx = opt.index
                    const isStudentChoice = studentAns === oIdx
                    const isCorrectChoice = correctAns === oIdx

                    return (
                      <div
                        key={opt.label}
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
                        <span className="font-bold text-gray-400 text-xs">{opt.label}.</span>
                        <span>{opt.text}</span>
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
                      <span className="text-xs font-semibold text-gray-500">Học sinh điền:</span>
                      <span
                        className={`text-sm font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
                      >
                        {studentAns || '(Chưa điền)'}
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

      {/* Reading Comprehension */}
      {block.type === 'reading' &&
        (() => {
          const passages =
            block.content?.passages && block.content.passages.length > 0
              ? block.content.passages
              : [
                  {
                    id: 'default',
                    title: block.title,
                    text: block.content?.text || '',
                    questions: block.content?.questions || [],
                  },
                ]

          return (
            <div className="space-y-6">
              {passages.map((p, pIdx) => (
                <div key={p.id || pIdx} className="space-y-4">
                  {p.text && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-gray-800 leading-relaxed max-h-56 overflow-y-auto space-y-2">
                      <div className="font-bold text-indigo-900 border-b pb-1 mb-2 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen size={14} className="text-indigo-600" />
                        <span>{p.title || `Bài đọc ${pIdx + 1}`}</span>
                      </div>
                      {p.text.split(/\n\s*\n/).map((para, idx) => (
                        <p key={idx} className="indent-2">
                          {para}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    {(p.questions || []).map((q: TestQuestion, qIndex: number) => {
                      const studentAns = submission.result.answers[q.id]
                      const isOptionBased = Array.isArray(q.options) && q.options.length > 0

                      if (isOptionBased) {
                        const correctIdx =
                          typeof submission.result.correctAnswersDetail?.[q.id] === 'number'
                            ? (submission.result.correctAnswersDetail[q.id] as number)
                            : (q.correctIndex ?? 0)
                        const isStudentCorrect = studentAns === correctIdx

                        return (
                          <div key={q.id ? `${q.id}_${qIndex}` : `q-${qIndex}`} className="space-y-2 p-3.5 rounded-xl border bg-gray-50/50">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-gray-800 text-sm">
                                {qIndex + 1}. {q.text}
                              </p>
                              {isStudentCorrect ? (
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1 shrink-0">
                                  <Check size={12} strokeWidth={3} /> Đúng
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1 shrink-0">
                                  <X size={12} strokeWidth={3} /> Sai
                                </span>
                              )}
                            </div>

                            {q.sentence && (
                              <div className="p-2 rounded bg-amber-50 text-xs text-amber-900 border border-amber-200 italic">
                                &ldquo;{q.sentence}&rdquo;
                              </div>
                            )}

                            <div className="grid grid-cols-1 gap-1.5 pl-2 pt-1">
                              {getActiveQuestionOptions(q.options).map((opt) => {
                                const oIdx = opt.index
                                const isStudentChoice = studentAns === oIdx
                                const isCorrectChoice = correctIdx === oIdx

                                return (
                                  <div
                                    key={opt.label}
                                    className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs ${
                                      isCorrectChoice
                                        ? 'bg-green-50 border-green-200 text-green-900 font-semibold'
                                        : isStudentChoice && !isCorrectChoice
                                          ? 'bg-red-50 border-red-200 text-red-900'
                                          : 'bg-white border-gray-100 text-gray-600'
                                    }`}
                                  >
                                    <div
                                      className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] ${
                                        isCorrectChoice
                                          ? 'bg-green-500 border-green-500 text-white'
                                          : isStudentChoice && !isCorrectChoice
                                            ? 'bg-red-500 border-red-500 text-white'
                                            : 'border-gray-300'
                                      }`}
                                    >
                                      {isCorrectChoice ? (
                                        <Check size={10} strokeWidth={3} />
                                      ) : isStudentChoice ? (
                                        <X size={10} strokeWidth={3} />
                                      ) : null}
                                    </div>
                                    <span className="font-bold text-gray-400">{opt.label}.</span>
                                    <span>{opt.text}</span>
                                  </div>
                                )
                              })}
                            </div>

                            {q.explanation && (
                              <div className="mt-1.5 p-2 rounded-lg bg-gray-100/70 text-[11px] text-gray-600 flex items-start gap-1.5">
                                <HelpCircle size={13} className="text-gray-400 mt-0.5 shrink-0" />
                                <span>{q.explanation}</span>
                              </div>
                            )}
                          </div>
                        )
                      }

                      // Short Answer / Cloze text
                      const rawCorrect = String(
                        submission.result.correctAnswersDetail?.[q.id] || q.answer || '',
                      )
                      const acceptable = rawCorrect
                        .split('|')
                        .map((s) => normalizeSentence(s))
                        .filter(Boolean)
                      const studentText = normalizeSentence(String(studentAns || ''))
                      const isCorrect = acceptable.includes(studentText)

                      return (
                        <div key={q.id ? `${q.id}_${qIndex}` : `q-${qIndex}`} className="p-3.5 rounded-xl border bg-gray-50/50 space-y-2">
                          <p className="font-semibold text-gray-800 text-sm">
                            {qIndex + 1}. {q.text}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            {isCorrect ? (
                              <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                            ) : (
                              <X size={16} className="text-red-500 shrink-0" />
                            )}
                            <span className="font-semibold text-gray-500">Học sinh trả lời:</span>
                            <span
                              className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
                            >
                              {String(studentAns || '') || '(Chưa làm)'}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div className="text-xs text-green-700 bg-green-50 p-2 rounded-lg border border-green-200 font-medium">
                              Đáp án chuẩn: <b>{rawCorrect.replace(/\|/g, ' hoặc ')}</b>
                            </div>
                          )}
                          {q.explanation && (
                            <div className="p-2 rounded-lg bg-gray-100/70 text-[11px] text-gray-600 flex items-start gap-1.5">
                              <HelpCircle size={13} className="text-gray-400 mt-0.5 shrink-0" />
                              <span>{q.explanation}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
    </div>
  )
}
