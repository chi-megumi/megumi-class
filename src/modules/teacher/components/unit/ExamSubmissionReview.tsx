'use client'

import React from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { MatchingPair, TestBlock, TestQuestion } from '../../types'

type ExamSubmissionReviewProps = {
  content: unknown
  answers: Record<string, unknown>
  correctAnswersDetail?: Record<string, string | number> | null
}

export default function ExamSubmissionReview({
  content,
  answers,
  correctAnswersDetail,
}: ExamSubmissionReviewProps) {
  const blocks: TestBlock[] = (Array.isArray(content)
    ? content
    : (content as { content?: TestBlock[]; blocks?: TestBlock[] })?.content ||
      (content as { content?: TestBlock[]; blocks?: TestBlock[] })?.blocks ||
      []) as TestBlock[]

  if (!blocks || blocks.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-gray-400 bg-gray-50 rounded-xl">
        Không tìm thấy nội dung câu hỏi bài thi.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {blocks.map((block: TestBlock, bIdx: number) => (
        <div key={block.id || bIdx} className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs space-y-3">
          <div className="font-bold text-indigo-700 text-xs pb-2 border-b border-gray-100">
            Phần {bIdx + 1}: {block.title}
          </div>

          {block.type === 'multiple_choice' && (
            <div className="space-y-4">
              {block.content?.questions?.map((q: TestQuestion, qIdx: number) => {
                const studentAns = answers?.[q.id]
                const correctAns = correctAnswersDetail?.[q.id] ?? q.correctIndex

                return (
                  <div key={q.id} className="space-y-1.5 text-xs">
                    <p className="font-bold text-gray-800">
                      {qIdx + 1}. {q.text}
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 pl-3">
                      {(q.options || []).map((opt, oIdx) => {
                        const isStudentChoice = studentAns === oIdx
                        const isCorrectChoice = correctAns === oIdx

                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border flex items-center gap-2 ${
                              isCorrectChoice
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                                : isStudentChoice && !isCorrectChoice
                                ? 'bg-rose-50 border-rose-200 text-rose-800 line-through'
                                : 'bg-gray-50 border-gray-100 text-gray-500'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] border">
                              {isCorrectChoice ? '✓' : isStudentChoice ? '✗' : ''}
                            </span>
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

          {block.type === 'fill_blank' && (
            <div className="space-y-3 text-xs">
              {(block.content?.questions && block.content.questions.length > 0
                ? block.content.questions
                : [{ id: block.id, text: block.content?.text, answer: block.content?.answer }]
              ).map((q: TestQuestion, qIdx: number) => {
                const studentAns = String(answers?.[q.id] || '').trim()
                const correctAns = String(correctAnswersDetail?.[q.id] || q.answer || '').trim()
                const isCorrect = studentAns.toLowerCase() === correctAns.toLowerCase()

                return (
                  <div key={q.id} className="p-3 rounded-lg border bg-gray-50 space-y-1">
                    <p className="font-semibold text-gray-800">{qIdx + 1}. {q.text}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {isCorrect ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <X size={14} className="text-rose-500 shrink-0" />}
                      <span className="text-gray-500">Học sinh điền:</span>
                      <span className={`font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {studentAns || '(Bỏ trống)'}
                      </span>
                      {!isCorrect && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold ml-2">
                          Đúng: {correctAns}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {block.type === 'matching' && (
            <div className="space-y-2 text-xs">
              {(block.content?.pairs || []).map((p: MatchingPair, pIdx: number) => {
                const key = `${block.id}_${p.id}`
                const studentChoice = answers?.[key]
                const matchedPair = (block.content?.pairs || []).find((o) => o.id === studentChoice)
                const studentText = matchedPair ? matchedPair.right : (studentChoice !== undefined ? String(studentChoice) : '(Chưa ghép)')
                const isCorrect = studentChoice === p.id || (p.right && String(studentChoice).trim().toLowerCase() === String(p.right).trim().toLowerCase())

                return (
                  <div key={p.id} className="p-2.5 rounded-lg border bg-gray-50 flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{pIdx + 1}. {p.left}</span>
                    <div className="flex items-center gap-2">
                      {isCorrect ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <X size={14} className="text-rose-500 shrink-0" />}
                      <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {studentText}
                      </span>
                      {!isCorrect && (
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                          Đúng: {p.right}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {block.type === 'reorder' && (
            <div className="space-y-3 text-xs">
              {(block.content?.questions || []).map((q: TestQuestion, qIdx: number) => {
                const studentSentence = String(answers?.[q.id] || '').trim()
                const correctSentence = String(correctAnswersDetail?.[q.id] || q.sentence || '').trim()
                const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim()
                const isCorrect = normalize(studentSentence) === normalize(correctSentence)

                return (
                  <div key={q.id} className="p-3 rounded-lg border bg-gray-50 space-y-1">
                    <p className="font-semibold text-gray-800">{qIdx + 1}. {q.text || 'Sắp xếp câu:'}</p>
                    <div className="flex items-center gap-2">
                      {isCorrect ? <CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> : <X size={14} className="text-rose-500 shrink-0" />}
                      <span className={`font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {studentSentence || '(Chưa làm)'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200 font-medium mt-1">
                        Đáp án: {correctSentence}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
