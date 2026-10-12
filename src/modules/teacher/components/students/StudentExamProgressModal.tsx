import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  X,
  User,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react'
import { getStudentExamHistory } from '@/actions/analytics'
import { TestBlock, TestQuestion } from '../../types'

type StudentExamHistoryItem = {
  examId: string
  title: string
  type: 'class' | 'unit'
  unitTitle: string | null
  duration: number
  status: 'completed' | 'in_progress' | 'not_started'
  score: number | null
  correctAnswers: number | null
  totalQuestions: number | null
  startedAt: string | Date | null
  completedAt: string | Date | null
  answers: Record<string, any>
  correctAnswersDetail: Record<string, any>
  content: any
}

type StudentExamHistoryResponse = {
  student: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
  summary: {
    totalExams: number
    completedCount: number
    inProgressCount: number
    notStartedCount: number
    avgScore: number
    highestScore: number
  }
  history: StudentExamHistoryItem[]
}

type StudentExamProgressModalProps = {
  classId: string
  studentId: string
  studentName?: string
  onClose: () => void
}

export default function StudentExamProgressModal({
  classId,
  studentId,
  studentName,
  onClose,
}: StudentExamProgressModalProps) {
  const [data, setData] = useState<StudentExamHistoryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        const res = await getStudentExamHistory(classId, studentId)
        setData(res as unknown as StudentExamHistoryResponse)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Lỗi khi tải lịch sử kiểm tra của học sinh')
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [classId, studentId])

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-purple-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg overflow-hidden shadow-md shrink-0">
              {data?.student?.avatarUrl ? (
                <Image src={data.student.avatarUrl} alt={data.student.name} width={48} height={48} className="w-full h-full object-cover" />
              ) : (
                (data?.student?.name || studentName || 'H').charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                  Hồ Sơ Kiểm Tra
                </span>
                <span className="text-xs text-gray-400">{data?.student?.email}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mt-0.5">
                {data?.student?.name || studentName || 'Học sinh'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white text-gray-400 hover:text-gray-700 rounded-full transition-colors shadow-xs"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <div className="text-center py-20 text-gray-400">Đang tải lịch sử thi cử...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : !data ? (
            <div className="text-center py-20 text-gray-400">Không có dữ liệu.</div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Số bài đã nộp</p>
                  <p className="text-2xl font-black text-indigo-950 mt-1">
                    {data.summary.completedCount} <span className="text-sm font-semibold text-gray-400">/ {data.summary.totalExams}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                  <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Điểm trung bình</p>
                  <p className="text-2xl font-black text-purple-950 mt-1">{data.summary.avgScore}đ</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Điểm cao nhất</p>
                  <p className="text-2xl font-black text-emerald-950 mt-1">{data.summary.highestScore}đ</p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Tỷ lệ hoàn thành</p>
                  <p className="text-2xl font-black text-amber-950 mt-1">
                    {data.summary.totalExams > 0
                      ? Math.round((data.summary.completedCount / data.summary.totalExams) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                  <FileText size={16} className="text-indigo-600" /> Danh sách bài kiểm tra ({data.history.length})
                </h3>

                {data.history.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    Chưa có bài kiểm tra nào được phát hành trong lớp học này.
                  </div>
                ) : (
                  data.history.map((item) => {
                    const isExpanded = expandedExamId === item.examId
                    const isCompleted = item.status === 'completed'
                    const isInProgress = item.status === 'in_progress'

                    return (
                      <div
                        key={item.examId}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          isCompleted
                            ? 'bg-white border-gray-100 shadow-xs hover:border-indigo-200'
                            : isInProgress
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-gray-50/60 border-gray-200/80 opacity-75'
                        }`}
                      >
                        <div className="p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                item.type === 'class'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              }`}>
                                {item.type === 'class' ? 'Đề Tổng Hợp' : item.unitTitle || 'Đề Unit'}
                              </span>
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={12} /> {item.duration} phút
                              </span>
                            </div>
                            <h4 className="font-bold text-gray-900 text-base truncate">{item.title}</h4>
                            
                            {isCompleted && item.completedAt && (
                              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                                <Calendar size={12} /> Đã nộp: {new Date(item.completedAt).toLocaleString('vi-VN')}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {isCompleted ? (
                              <div className="text-right">
                                <div className={`font-black text-xl ${
                                  (item.score ?? 0) >= 80 ? 'text-emerald-600' :
                                  (item.score ?? 0) >= 50 ? 'text-indigo-600' : 'text-rose-600'
                                }`}>
                                  {item.score}đ
                                </div>
                                <div className="text-[11px] text-gray-400 font-medium">
                                  {item.correctAnswers !== null ? `Đúng ${item.correctAnswers}/${item.totalQuestions} câu` : 'Hoàn thành'}
                                </div>
                              </div>
                            ) : isInProgress ? (
                              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1">
                                <Clock size={13} /> Đang làm dở
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                                Chưa làm
                              </span>
                            )}

                            {isCompleted && (
                              <button
                                onClick={() => setExpandedExamId(isExpanded ? null : item.examId)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                                  isExpanded
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                }`}
                              >
                                {isExpanded ? (
                                  <>Thu gọn <ChevronUp size={14} /></>
                                ) : (
                                  <>Xem bài làm <ChevronDown size={14} /></>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded details of submission */}
                        {isExpanded && isCompleted && (
                          <div className="p-5 border-t border-gray-100 bg-gray-50/60 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <h5 className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                              Chi tiết câu trả lời của học sinh:
                            </h5>

                            {(((item.content as any)?.content || item.content?.blocks || item.content) as TestBlock[] || []).map((block: TestBlock, bIdx: number) => (
                              <div key={block.id || bIdx} className="p-4 rounded-xl bg-white border border-gray-200/80 shadow-xs space-y-3">
                                <div className="font-bold text-indigo-700 text-xs pb-2 border-b border-gray-100">
                                  Phần {bIdx + 1}: {block.title}
                                </div>

                                {block.type === 'multiple_choice' && (
                                  <div className="space-y-4">
                                    {block.content?.questions?.map((q: TestQuestion, qIdx: number) => {
                                      const studentAns = item.answers[q.id]
                                      const correctAns = item.correctAnswersDetail?.[q.id] ?? q.correctIndex
                                      const isCorrect = studentAns === correctAns

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
                                    {((block.content as any)?.questions || [{ id: block.id, text: (block.content as any)?.text, answer: (block.content as any)?.answer }]).map((q: any, qIdx: number) => {
                                      const studentAns = String(item.answers[q.id] || '').trim()
                                      const correctAns = String(item.correctAnswersDetail?.[q.id] || q.answer || '').trim()
                                      const isCorrect = studentAns.toLowerCase() === correctAns.toLowerCase()

                                      return (
                                        <div key={q.id} className="p-3 rounded-lg border bg-gray-50 space-y-1">
                                          <p className="font-semibold text-gray-800">{qIdx + 1}. {q.text}</p>
                                          <div className="flex items-center gap-2">
                                            {isCorrect ? <CheckCircle2 size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}
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
                                    {((block.content as any)?.pairs || []).map((p: any, pIdx: number) => {
                                      const key = `${block.id}_${p.id}`
                                      const studentChoice = item.answers[key]
                                      const matchedPair = ((block.content as any)?.pairs || []).find((o: any) => o.id === studentChoice)
                                      const studentText = matchedPair ? matchedPair.right : (studentChoice || '(Chưa ghép)')
                                      const isCorrect = studentChoice === p.id || (p.right && String(studentChoice).trim().toLowerCase() === String(p.right).trim().toLowerCase())

                                      return (
                                        <div key={p.id} className="p-2.5 rounded-lg border bg-gray-50 flex items-center justify-between gap-2">
                                          <span className="font-medium text-gray-800">{pIdx + 1}. {p.left}</span>
                                          <div className="flex items-center gap-2">
                                            {isCorrect ? <CheckCircle2 size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}
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
                                    {((block.content as any)?.questions || []).map((q: any, qIdx: number) => {
                                      const studentSentence = String(item.answers[q.id] || '').trim()
                                      const correctSentence = String(item.correctAnswersDetail?.[q.id] || q.sentence || '').trim()
                                      const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:]/g, '').replace(/\s+/g, ' ').trim()
                                      const isCorrect = normalize(studentSentence) === normalize(correctSentence)

                                      return (
                                        <div key={q.id} className="p-3 rounded-lg border bg-gray-50 space-y-1">
                                          <p className="font-semibold text-gray-800">{qIdx + 1}. {q.text || 'Sắp xếp câu:'}</p>
                                          <div className="flex items-center gap-2">
                                            {isCorrect ? <CheckCircle2 size={14} className="text-emerald-500" /> : <X size={14} className="text-rose-500" />}
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
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
