'use client'

import React, { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import UnitProgressStudentRow from '../../overview/UnitProgressStudentRow'
import type { StudentAnalyticsData, StudentExamDetail } from '@/modules/teacher/types'
import type { StudentStatusFilterType, StudentSortType } from './types'

type StudentAnalyticsViewProps = {
  students: StudentAnalyticsData[]
  examCount: number
}

export default function StudentAnalyticsView({ students, examCount }: StudentAnalyticsViewProps) {
  const [studentSearch, setStudentSearch] = useState('')
  const [studentStatusFilter, setStudentStatusFilter] = useState<StudentStatusFilterType>('all')
  const [studentSort, setStudentSort] = useState<StudentSortType>('mastery_desc')

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
          (s.student.email && s.student.email.toLowerCase().includes(studentSearch.toLowerCase()))
        if (!matchesSearch) return false

        const isCompleted = s.masteryProgress === 100
        const isNotStarted =
          s.masteryProgress === 0 &&
          !s.games.flashcard.played &&
          !s.games.quiz.played &&
          !s.games.match.played &&
          !(s.exams || []).some((e: StudentExamDetail) => e.isCompleted)
        const isInProgress = !isCompleted && !isNotStarted

        if (studentStatusFilter === 'completed') return isCompleted
        if (studentStatusFilter === 'in_progress') return isInProgress
        if (studentStatusFilter === 'not_started') return isNotStarted
        return true
      })
      .sort((a, b) => {
        if (studentSort === 'mastery_desc') return b.masteryProgress - a.masteryProgress
        if (studentSort === 'mastery_asc') return a.masteryProgress - b.masteryProgress
        return a.student.name.localeCompare(b.student.name)
      })
  }, [students, studentSearch, studentStatusFilter, studentSort])

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tên hoặc email học sinh..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setStudentStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                studentStatusFilter === 'all'
                  ? 'bg-white text-gray-800 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Tất cả ({students.length})
            </button>
            <button
              onClick={() => setStudentStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                studentStatusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              Đã thuộc 100%
            </button>
            <button
              onClick={() => setStudentStatusFilter('in_progress')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                studentStatusFilter === 'in_progress'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Đang học
            </button>
            <button
              onClick={() => setStudentStatusFilter('not_started')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                studentStatusFilter === 'not_started'
                  ? 'bg-gray-700 text-white shadow-2xs'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              Chưa bắt đầu
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Sắp xếp:</span>
          <select
            value={studentSort}
            onChange={(e) => setStudentSort(e.target.value as StudentSortType)}
            className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="mastery_desc">Tiến độ thuộc từ (Cao → Thấp)</option>
            <option value="mastery_asc">Tiến độ thuộc từ (Thấp → Cao)</option>
            <option value="name">Tên học sinh (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="py-4 px-6 font-bold w-1/4">Học sinh</th>
                <th className="py-4 px-6 font-bold w-1/4">Tiến độ thuộc từ</th>
                <th className="py-4 px-6 font-bold w-1/4">Hoạt động luyện tập</th>
                <th className="py-4 px-6 font-bold w-1/4">Bài kiểm tra ({examCount})</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((data) => (
                  <UnitProgressStudentRow key={data.student.id} data={data} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
