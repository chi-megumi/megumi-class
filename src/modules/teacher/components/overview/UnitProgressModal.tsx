'use client'

import { UnitData, EnrollmentData } from '../../types'
import { useState } from 'react'
import UnitProgressToolbar from './UnitProgressToolbar'
import UnitProgressStudentRow from './UnitProgressStudentRow'
import Portal from '@/components/common/Portal'

type UnitProgressModalProps = {
  unit: UnitData
  activeStudents: EnrollmentData[]
  onClose: () => void
}

const UnitProgressModal = ({ unit, activeStudents, onClose }: UnitProgressModalProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const publishedUnitExams = (unit.exams || []).filter((e) => e.isPublished)

  // Map real analytics data from the database
  const studentAnalytics = activeStudents.map((enrollment) => {
    // Find the real progress record for this student in this unit
    const progress = unit.studentProgress?.find((p) => p.userId === enrollment.student.id)

    // Find student exams in this unit
    const studentExams = publishedUnitExams.map((exam) => {
      const res = exam.results?.find((r) => r.studentId === enrollment.student.id)
      return {
        id: exam.id,
        title: exam.title,
        isCompleted: !!res?.completedAt,
        score: res?.score ?? null,
        completedAt: res?.completedAt || null,
      }
    })

    return {
      student: enrollment.student,
      masteryProgress: progress?.masteryProgress || 0, // % vocab mastered
      games: {
        flashcard: {
          played: (progress?.flashcardPlayCount || 0) > 0,
          progress: progress?.masteryProgress || 0,
          timesPlayed: progress?.flashcardPlayCount || 0,
        },
        quiz: {
          played: (progress?.quizPlayCount || 0) > 0,
          score: progress?.bestQuizScore || 0,
          timesPlayed: progress?.quizPlayCount || 0,
        },
        match: {
          played: (progress?.matchPlayCount || 0) > 0,
          bestTime: progress?.bestMatchTime || null,
          timesPlayed: progress?.matchPlayCount || 0,
        },
      },
      exams: studentExams,
    }
  })

  // Also include the completely fake mock students if activeStudents is empty
  const mockFakeStudents = [
    {
      student: { id: '1', name: 'Nguyễn Văn A', avatarUrl: null },
      masteryProgress: 100,
      games: {
        flashcard: { played: true, progress: 100, timesPlayed: 5 },
        quiz: { played: true, score: 95, timesPlayed: 3 },
        match: { played: true, bestTime: 32, timesPlayed: 12 },
      },
      exams: [
        { id: '1', title: 'Bài kiểm tra 15 phút', isCompleted: true, score: 95, completedAt: new Date() },
      ],
    },
    {
      student: { id: '2', name: 'Trần Thị B', avatarUrl: null },
      masteryProgress: 65,
      games: {
        flashcard: { played: true, progress: 80, timesPlayed: 2 },
        quiz: { played: true, score: 85, timesPlayed: 2 },
        match: { played: false, bestTime: null, timesPlayed: 0 },
      },
      exams: [
        { id: '1', title: 'Bài kiểm tra 15 phút', isCompleted: false, score: null, completedAt: null },
      ],
    },
    {
      student: { id: '3', name: 'Lê Hoàng C', avatarUrl: null },
      masteryProgress: 15,
      games: {
        flashcard: { played: true, progress: 40, timesPlayed: 1 },
        quiz: { played: false, score: 0, timesPlayed: 0 },
        match: { played: false, bestTime: null, timesPlayed: 0 },
      },
      exams: [],
    },
  ]

  const displayData = studentAnalytics.length > 0 ? studentAnalytics : mockFakeStudents

  const filteredData = displayData.filter((d) =>
    d.student.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-gray-200/50 relative z-10 animate-in zoom-in-95 duration-300">
          {/* Toolbar & Header */}
          <UnitProgressToolbar
            unitTitle={unit.title}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onClose={onClose}
          />

          {/* Table Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-bold w-1/4">Học sinh</th>
                  <th className="py-4 px-6 font-bold w-1/4">Tiến độ thuộc từ</th>
                  <th className="py-4 px-6 font-bold w-1/4">Hoạt động luyện tập</th>
                  <th className="py-4 px-6 font-bold w-1/4">Bài kiểm tra ({publishedUnitExams.length})</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      Không tìm thấy học sinh nào.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((data) => (
                    <UnitProgressStudentRow key={data.student.id} data={data} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Portal>
  )
}

export default UnitProgressModal
