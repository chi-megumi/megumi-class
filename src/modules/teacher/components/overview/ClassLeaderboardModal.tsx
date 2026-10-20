'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  X,
  Trophy,
  Search,
  Sparkles,
  Users,
  ChevronRight,
} from 'lucide-react'
import { getClassLeaderboard } from '@/actions/analytics/class-analytics'
import Portal from '@/components/common/Portal'
import LeaderboardModalSkeleton from './loading/LeaderboardModalSkeleton'

type LeaderboardStudent = {
  rank: number
  student: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
  totalPublishedExams: number
  completedExams: number
  completionRate: number
  avgScore: number
  highestScore: number
  lowestScore: number
  avgVocabMastery: number
  xp: number
}

type ClassLeaderboardData = {
  classId: string
  className: string
  totalStudents: number
  totalPublishedExams: number
  totalCompletedResults: number
  classAvgScore: number
  leaderboard: LeaderboardStudent[]
}

type ClassLeaderboardModalProps = {
  classId: string
  className: string
  onClose: () => void
  onSelectStudent?: (studentId: string, studentName: string) => void
}

export default function ClassLeaderboardModal({
  classId,
  className,
  onClose,
  onSelectStudent,
}: ClassLeaderboardModalProps) {
  const [data, setData] = useState<ClassLeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true)
        const res = await getClassLeaderboard(classId)
        setData(res as unknown as ClassLeaderboardData)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Lỗi khi tải bảng xếp hạng lớp học')
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchLeaderboard()
  }, [classId])

  const filteredStudents = data?.leaderboard.filter((s) =>
    s.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const top1 = data?.leaderboard[0]
  const top2 = data?.leaderboard[1]
  const top3 = data?.leaderboard[2]

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-gray-200/50">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-indigo-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                  Bảng Vàng Học Tập
                </span>
                <span className="text-xs text-gray-500">{className}</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mt-0.5">Bảng Xếp Hạng Lớp Học</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <LeaderboardModalSkeleton />
          ) : error ? (
            <div className="text-center py-20 text-red-500">{error}</div>
          ) : !data || data.leaderboard.length === 0 ? (
            <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              Chưa có học sinh nào trong lớp học.
            </div>
          ) : (
            <>
              {/* Quick Summary Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-amber-50/70 border border-amber-200/60 p-4 rounded-2xl">
                  <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Tổng học sinh</p>
                  <p className="text-2xl font-black text-amber-950 mt-1">{data.totalStudents} em</p>
                </div>
                <div className="bg-indigo-50/70 border border-indigo-200/60 p-4 rounded-2xl">
                  <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Đề thi đã mở</p>
                  <p className="text-2xl font-black text-indigo-950 mt-1">{data.totalPublishedExams} bài</p>
                </div>
                <div className="bg-purple-50/70 border border-purple-200/60 p-4 rounded-2xl">
                  <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Tổng bài đã nộp</p>
                  <p className="text-2xl font-black text-purple-950 mt-1">{data.totalCompletedResults} lượt</p>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200/60 p-4 rounded-2xl">
                  <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Điểm TB cả lớp</p>
                  <p className="text-2xl font-black text-emerald-950 mt-1">{data.classAvgScore}đ</p>
                </div>
              </div>

              {/* Podium Top 3 */}
              {data.leaderboard.length >= 3 && (
                <div className="bg-gradient-to-b from-indigo-900/5 to-purple-900/5 rounded-3xl p-6 border border-indigo-100/80">
                  <h3 className="text-center font-black text-gray-800 text-lg mb-6 flex items-center justify-center gap-2">
                    <Sparkles className="text-amber-500" size={20} /> Vinh Danh Top 3 Thủ Khoa Lớp
                  </h3>

                  <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-2xl mx-auto">
                    {/* Top 2 - Silver */}
                    {top2 && (
                      <div className="flex flex-col items-center">
                        <div className="relative mb-3">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-slate-300 bg-slate-100 flex items-center justify-center overflow-hidden shadow-md font-black text-slate-700 text-lg">
                            {top2.student.avatarUrl ? (
                              <Image src={top2.student.avatarUrl} alt={top2.student.name} width={80} height={80} className="w-full h-full object-cover" />
                            ) : (
                              top2.student.name.charAt(0)
                            )}
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-400 text-white rounded-full text-[11px] font-black shadow-xs">
                            🥈 #2
                          </div>
                        </div>
                        <p className="font-bold text-gray-800 text-xs md:text-sm text-center truncate w-full">{top2.student.name}</p>
                        <p className="font-black text-indigo-600 text-sm md:text-base">{top2.avgScore}đ</p>
                        <div className="w-full h-24 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl mt-2 flex items-center justify-center text-slate-500 font-bold text-xs shadow-inner">
                          {top2.completedExams} bài thi
                        </div>
                      </div>
                    )}

                    {/* Top 1 - Gold */}
                    {top1 && (
                      <div className="flex flex-col items-center -mt-4">
                        <div className="text-amber-500 mb-1 animate-bounce">👑</div>
                        <div className="relative mb-3">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-amber-400 bg-amber-50 flex items-center justify-center overflow-hidden shadow-xl shadow-amber-500/20 font-black text-amber-700 text-2xl">
                            {top1.student.avatarUrl ? (
                              <Image src={top1.student.avatarUrl} alt={top1.student.name} width={96} height={96} className="w-full h-full object-cover" />
                            ) : (
                              top1.student.name.charAt(0)
                            )}
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-xs font-black shadow-md">
                            🥇 #1
                          </div>
                        </div>
                        <p className="font-extrabold text-gray-900 text-sm md:text-base text-center truncate w-full">{top1.student.name}</p>
                        <p className="font-black text-amber-600 text-base md:text-lg">{top1.avgScore}đ</p>
                        <div className="w-full h-32 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-2xl mt-2 flex flex-col items-center justify-center text-amber-800 font-black text-xs shadow-inner">
                          <span>{top1.completedExams} bài thi</span>
                          <span className="text-[10px] text-amber-700 font-semibold">{top1.xp} XP</span>
                        </div>
                      </div>
                    )}

                    {/* Top 3 - Bronze */}
                    {top3 && (
                      <div className="flex flex-col items-center">
                        <div className="relative mb-3">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-amber-600/70 bg-orange-50 flex items-center justify-center overflow-hidden shadow-md font-black text-amber-900 text-lg">
                            {top3.student.avatarUrl ? (
                              <Image src={top3.student.avatarUrl} alt={top3.student.name} width={80} height={80} className="w-full h-full object-cover" />
                            ) : (
                              top3.student.name.charAt(0)
                            )}
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-700 text-white rounded-full text-[11px] font-black shadow-xs">
                            🥉 #3
                          </div>
                        </div>
                        <p className="font-bold text-gray-800 text-xs md:text-sm text-center truncate w-full">{top3.student.name}</p>
                        <p className="font-black text-indigo-600 text-sm md:text-base">{top3.avgScore}đ</p>
                        <div className="w-full h-20 bg-gradient-to-t from-amber-100 to-orange-50 rounded-t-2xl mt-2 flex items-center justify-center text-amber-800 font-bold text-xs shadow-inner">
                          {top3.completedExams} bài thi
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Search & List */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" /> Bảng điểm chi tiết toàn bộ học sinh ({filteredStudents.length})
                  </h4>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Tìm tên hoặc email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider">
                          <th className="py-3.5 px-4 w-14 text-center">Hạng</th>
                          <th className="py-3.5 px-4">Học sinh</th>
                          <th className="py-3.5 px-4">Số bài thi đã làm</th>
                          <th className="py-3.5 px-4">Điểm trung bình</th>
                          <th className="py-3.5 px-4">Điểm cao nhất</th>
                          <th className="py-3.5 px-4">Thuộc từ vựng</th>
                          <th className="py-3.5 px-4 text-right">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredStudents.map((item) => {
                          const isTop1 = item.rank === 1
                          const isTop2 = item.rank === 2
                          const isTop3 = item.rank === 3

                          return (
                            <tr
                              key={item.student.id}
                              className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                              onClick={() => onSelectStudent?.(item.student.id, item.student.name)}
                            >
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                                    isTop1
                                      ? 'bg-amber-400 text-white shadow-xs'
                                      : isTop2
                                      ? 'bg-slate-300 text-slate-800'
                                      : isTop3
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : item.rank}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs overflow-hidden shrink-0">
                                    {item.student.avatarUrl ? (
                                      <Image src={item.student.avatarUrl} alt={item.student.name} width={32} height={32} className="w-full h-full object-cover" />
                                    ) : (
                                      item.student.name.charAt(0)
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                      {item.student.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400">{item.student.email}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-700">
                                    {item.completedExams}/{item.totalPublishedExams} bài
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-semibold">
                                    ({item.completionRate}%)
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex px-2.5 py-1 rounded-lg font-black text-xs ${
                                    item.avgScore >= 80
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : item.avgScore >= 50
                                      ? 'bg-indigo-100 text-indigo-700'
                                      : 'bg-rose-100 text-rose-700'
                                  }`}
                                >
                                  {item.avgScore}đ
                                </span>
                              </td>

                              <td className="py-3 px-4 font-bold text-gray-700">
                                {item.highestScore > 0 ? `${item.highestScore}đ` : '-'}
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 rounded-full"
                                      style={{ width: `${item.avgVocabMastery}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[11px] font-semibold text-gray-500">
                                    {item.avgVocabMastery}%
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  title="Xem tiến độ bài thi chi tiết"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </Portal>
  )
}
