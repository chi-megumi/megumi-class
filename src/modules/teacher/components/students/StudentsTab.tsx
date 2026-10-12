import { useState } from 'react'
import { Users, Search, UserPlus, CheckCircle2, XCircle, Trash2, Loader2, Award, FileText } from 'lucide-react'
import { EnrollmentData, ClassData } from '../../types'
import StudentExamProgressModal from './StudentExamProgressModal'

type StudentsTabProps = {
  classId?: string
  classData?: ClassData
  pendingStudents: EnrollmentData[]
  activeStudents: EnrollmentData[]
  loadingEnrollmentId: string | null
  handleUpdateStatus: (enrollmentId: string, status: 'active' | 'rejected') => Promise<void>
  handleRemoveStudent: (enrollmentId: string) => Promise<void>
  setShowAddModal: (show: boolean) => void
}

const StudentsTab = ({
  classId,
  classData,
  pendingStudents,
  activeStudents,
  loadingEnrollmentId,
  handleUpdateStatus,
  handleRemoveStudent,
  setShowAddModal,
}: StudentsTabProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudentForExamProgress, setSelectedStudentForExamProgress] = useState<{
    id: string
    name: string
  } | null>(null)

  // Collect all published exams from class and units
  const allPublishedExams = [
    ...(classData?.exams || []).filter((e) => e.isPublished),
    ...(classData?.units || []).flatMap((u) => (u.exams || []).filter((e) => e.isPublished)),
  ]
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Yêu cầu chờ duyệt */}
      {pendingStudents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="bg-orange-100 p-1.5 rounded-lg text-orange-600">
              <Users size={18} />
            </span>
            Yêu cầu chờ duyệt ({pendingStudents.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingStudents.map((enrollment) => (
              <div
                key={enrollment.id}
                className="bg-white border border-orange-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-white font-bold uppercase shadow-sm">
                    {enrollment.student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{enrollment.student.name}</p>
                    <p className="text-xs text-gray-500">{enrollment.student.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(enrollment.id, 'rejected')}
                    disabled={loadingEnrollmentId === enrollment.id}
                    className="p-2 text-red-400 hover:text-white hover:bg-red-500 bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                    title="Từ chối"
                  >
                    <XCircle size={20} />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(enrollment.id, 'active')}
                    disabled={loadingEnrollmentId === enrollment.id}
                    className="p-2 text-green-500 hover:text-white hover:bg-green-500 bg-green-50 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {loadingEnrollmentId === enrollment.id ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={20} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danh sách học sinh */}
      <div className="space-y-4 pt-4 border-t border-gray-100 border-dashed">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="bg-[#6A5EEB]/10 p-1.5 rounded-lg text-[#6A5EEB]">
              <Users size={18} />
            </span>
            Học sinh trong lớp ({activeStudents.length})
          </h3>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/10 text-sm outline-none w-full md:w-64 transition-all"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#6A5EEB] hover:bg-[#5b51d8] text-white rounded-xl text-sm font-medium transition-colors shadow-sm active:scale-95"
            >
              <UserPlus size={16} />
              Thêm học sinh
            </button>
          </div>
        </div>

        {activeStudents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
            Chưa có học sinh nào trong lớp
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Học sinh</th>
                  <th className="px-6 py-4">Tiến độ bài kiểm tra</th>
                  <th className="px-6 py-4">Ngày tham gia</th>
                  <th className="px-6 py-4 text-right rounded-tr-2xl">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeStudents
                  .filter((enrollment) =>
                    enrollment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    enrollment.student.email.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((enrollment) => {
                    const completedExams = allPublishedExams.filter((e) =>
                      e.results?.some((r) => r.studentId === enrollment.student.id && r.completedAt)
                    )
                    const completedCount = completedExams.length
                    const scores = completedExams
                      .map((e) => e.results?.find((r) => r.studentId === enrollment.student.id)?.score)
                      .filter((s): s is number => s !== null && s !== undefined)
                    const avgScore =
                      scores.length > 0
                        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                        : null

                    return (
                      <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6A5EEB] to-purple-400 flex items-center justify-center text-white font-medium text-xs uppercase shadow-sm">
                              {enrollment.student.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{enrollment.student.name}</p>
                              <p className="text-xs text-gray-500">{enrollment.student.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              setSelectedStudentForExamProgress({
                                id: enrollment.student.id,
                                name: enrollment.student.name,
                              })
                            }
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 transition-all text-xs font-bold"
                            title="Bấm để xem lịch sử làm bài chi tiết"
                          >
                            <Award size={14} className="text-indigo-600 shrink-0" />
                            <span>
                              {completedCount}/{allPublishedExams.length} bài
                            </span>
                            {avgScore !== null && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                  avgScore >= 80
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : avgScore >= 50
                                    ? 'bg-indigo-200/80 text-indigo-900'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {avgScore}đ
                              </span>
                            )}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {new Date(enrollment.joinedAt).toLocaleDateString('vi-VN')}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                setSelectedStudentForExamProgress({
                                  id: enrollment.student.id,
                                  name: enrollment.student.name,
                                })
                              }
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Xem chi tiết bài kiểm tra"
                            >
                              <FileText size={16} />
                            </button>
                            <button
                              onClick={() => handleRemoveStudent(enrollment.id)}
                              disabled={loadingEnrollmentId === enrollment.id}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                              title="Xóa học sinh"
                            >
                              {loadingEnrollmentId === enrollment.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Exam Progress Modal */}
      {selectedStudentForExamProgress && classId && (
        <StudentExamProgressModal
          classId={classId}
          studentId={selectedStudentForExamProgress.id}
          studentName={selectedStudentForExamProgress.name}
          onClose={() => setSelectedStudentForExamProgress(null)}
        />
      )}
    </div>
  )
}

export default StudentsTab
