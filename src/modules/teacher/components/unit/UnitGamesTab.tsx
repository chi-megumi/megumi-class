'use client'

import {
  Plus,
  Edit2,
  Eye,
  FileText,
  ToggleLeft,
  ToggleRight,
  Globe,
  Trash2,
  Sparkles,
  ClipboardList,
  RotateCcw,
  Lock,
  Gamepad2,
  Layers,
  HelpCircle,
  Puzzle,
} from 'lucide-react'
import { UnitData, TestContent, ExamData } from '../../types'

interface UnitGamesTabProps {
  editingUnit: UnitData
  settings: {
    isFlashcardEnabled: boolean
    isQuizEnabled: boolean
    isMatchEnabled: boolean
  }
  isPending: boolean
  toggleSetting: (key: 'isFlashcardEnabled' | 'isQuizEnabled' | 'isMatchEnabled') => void
  setEditingTestId: (id: string | null) => void
  setViewingResultsTest: (test: ExamData | TestContent | null) => void
  setEditingUnit: (unit: UnitData) => void
  onOpenGenerator?: () => void
}

export default function UnitGamesTab({
  editingUnit,
  settings,
  isPending,
  toggleSetting,
  setEditingTestId,
  setViewingResultsTest,
  setEditingUnit,
  onOpenGenerator,
}: UnitGamesTabProps) {
  return (
    <div className="p-8 flex flex-col">
      {/* KHU VỰC BÀI KIỂM TRA */}
      <div className="mb-6 shrink-0 mt-2 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600 shrink-0" /> Danh Sách Bài Kiểm Tra
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý các bài kiểm tra 15 phút, 45 phút, hoặc thi cuối khóa.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {onOpenGenerator && (
            <button
              onClick={onOpenGenerator}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 text-sm hover:-translate-y-0.5"
            >
              <Sparkles size={16} className="text-amber-300" /> Sinh Đề Tự Động
            </button>
          )}
          <button
            onClick={() => setEditingTestId('new')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> Tạo Đề Thủ Công
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {Array.isArray(editingUnit.exams) && editingUnit.exams.length > 0 ? (
          editingUnit.exams.map((test: ExamData) => (
            <div
              key={test.id}
              className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-rose-400"></div>
              <div className="flex items-start justify-between mb-2 gap-1">
                <h4 className="text-xl font-bold text-gray-800 truncate">
                  {test.title || 'Bài kiểm tra'}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const newExams = (editingUnit.exams || []).map((t: ExamData) =>
                        t.id === test.id ? { ...t, isEnabled: !t.isEnabled } : t,
                      )
                      setEditingUnit({ ...editingUnit, exams: newExams })
                      const { updateUnitExams } = await import('~/actions/class')
                      const res = await updateUnitExams(editingUnit.id, newExams)
                      if (res.success && res.exams) {
                        setEditingUnit({
                          ...editingUnit,
                          exams: res.exams as unknown as ExamData[],
                        })
                      }
                    }}
                    className={`flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
                      test.isEnabled
                        ? 'bg-green-50 border-green-200 text-green-600'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {test.isEnabled ? (
                      <>
                        <ToggleRight size={16} /> Hiển thị
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={16} /> Đang ẩn
                      </>
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      if (
                        window.confirm(
                          'Bạn có chắc chắn muốn xóa bài kiểm tra này? Mọi dữ liệu làm bài của học sinh sẽ bị mất!',
                        )
                      ) {
                        const { deleteUnitExam } = await import('~/actions/class')
                        const res = await deleteUnitExam(test.id, editingUnit.id)
                        if (res.success) {
                          setEditingUnit({
                            ...editingUnit,
                            exams: res.exams as unknown as ExamData[],
                          })
                        } else {
                          alert('Có lỗi xảy ra khi xóa bài kiểm tra.')
                        }
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    title="Xóa đề thi"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                    test.isRetakable
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
                >
                  {test.isRetakable ? (
                    <>
                      <RotateCcw size={12} className="shrink-0" /> Luyện tập
                    </>
                  ) : (
                    <>
                      <Lock size={12} className="shrink-0" /> Làm 1 lần
                    </>
                  )}
                </span>
                <span className="text-xs text-gray-500">
                  {test.duration || 45} phút • {test.content?.length || 0} phần thi
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewingResultsTest(test)}
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold rounded-xl transition-colors text-sm border border-indigo-100"
                  >
                    <FileText size={16} /> Kết quả
                  </button>
                  <button
                    onClick={() => setEditingTestId(test.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 font-semibold rounded-xl transition-colors text-sm border ${
                      test.isPublished
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100'
                    }`}
                    title={test.isPublished ? 'Xem lại cấu trúc đề thi (Chỉ đọc)' : 'Chỉnh sửa đề thi'}
                  >
                    {test.isPublished ? (
                      <>
                        <Eye size={16} /> Xem đề
                      </>
                    ) : (
                      <>
                        <Edit2 size={16} /> Sửa đề
                      </>
                    )}
                  </button>
                </div>
                {!test.isPublished ? (
                  <button
                    onClick={async () => {
                      if (
                        window.confirm(
                          'Sau khi public bạn sẽ không thể sửa đề nữa. Bạn có chắc chắn?',
                        )
                      ) {
                        const newExams = (editingUnit.exams || []).map((t: ExamData) =>
                          t.id === test.id ? { ...t, isPublished: true } : t,
                        )
                        setEditingUnit({ ...editingUnit, exams: newExams })
                        const { updateUnitExams } = await import('~/actions/class')
                        const res = await updateUnitExams(editingUnit.id, newExams)
                        if (res.success && res.exams) {
                          setEditingUnit({
                            ...editingUnit,
                            exams: res.exams as unknown as ExamData[],
                          })
                        }
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 font-semibold rounded-xl transition-colors text-sm border border-green-100"
                  >
                    <Globe size={16} /> Public Bài
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-1 px-4 py-2 bg-green-50 text-green-600 font-semibold rounded-xl text-sm border border-green-200 cursor-default">
                    <Globe size={16} /> Đã Public
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
            <p className="text-gray-500">Chưa có bài kiểm tra nào.</p>
          </div>
        )}
      </div>

      {/* KHU VỰC TRÒ CHƠI */}
      <div className="mb-6 shrink-0 pt-6 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-purple-600 shrink-0" /> Hoạt động & Trò chơi
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Danh sách các hoạt động học tập luyện tập tự do dành cho học sinh trong bài học này.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
        {/* Lật thẻ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
            <Layers className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-2">Lật thẻ (Flashcards)</h4>
          <p className="text-sm text-gray-500 mb-4 flex-1">
            Ôn tập từ vựng cơ bản thông qua flashcard 3D hai mặt kèm phát âm và ví dụ thực tế.
          </p>
          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={() => toggleSetting('isFlashcardEnabled')}
              disabled={isPending}
              className="flex items-center gap-2 outline-none"
            >
              {settings.isFlashcardEnabled ? (
                <>
                  <ToggleRight size={28} className="text-green-500" />
                  <span className="text-sm font-semibold text-green-700">Đang bật</span>
                </>
              ) : (
                <>
                  <ToggleLeft size={28} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-500">Đã tắt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Trắc nghiệm */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
            <HelpCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-2">Đố vui (Quiz)</h4>
          <p className="text-sm text-gray-500 mb-4 flex-1">
            Bài tập trắc nghiệm 4 lựa chọn giúp học sinh củng cố nghĩa của từ vựng vừa học.
          </p>
          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={() => toggleSetting('isQuizEnabled')}
              disabled={isPending}
              className="flex items-center gap-2 outline-none"
            >
              {settings.isQuizEnabled ? (
                <>
                  <ToggleRight size={28} className="text-green-500" />
                  <span className="text-sm font-semibold text-green-700">Đang bật</span>
                </>
              ) : (
                <>
                  <ToggleLeft size={28} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-500">Đã tắt</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ghép thẻ */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
            <Puzzle className="w-6 h-6 text-orange-600" />
          </div>
          <h4 className="text-lg font-bold text-gray-800 mb-2">Ghép thẻ (Match Game)</h4>
          <p className="text-sm text-gray-500 mb-4 flex-1">
            Trò chơi tìm cặp từ vựng - nghĩa với thời gian giới hạn để luyện phản xạ.
          </p>
          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={() => toggleSetting('isMatchEnabled')}
              disabled={isPending}
              className="flex items-center gap-2 outline-none"
            >
              {settings.isMatchEnabled ? (
                <>
                  <ToggleRight size={28} className="text-green-500" />
                  <span className="text-sm font-semibold text-green-700">Đang bật</span>
                </>
              ) : (
                <>
                  <ToggleLeft size={28} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-500">Đã tắt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
