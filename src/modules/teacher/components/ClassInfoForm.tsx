import { useState, useEffect, useRef } from 'react'
import { ImagePlus, Users, Search, X, Check, Loader2 } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { CreateClassFormValues } from '~/app/teacher/classes/create/page'
import { searchStudents } from '~/actions/student'

import { StudentData } from '../types'

const ClassInfoForm = () => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CreateClassFormValues>()

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const [selectedStudents, setSelectedStudents] = useState<StudentData[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadStudents = async (q: string, p: number) => {
    setLoading(true)
    try {
      const res = await searchStudents({ query: q, page: p, limit: 10 })
      if (p === 1) {
        setStudents(res.students)
      } else {
        setStudents((prev) => [...prev, ...res.students])
      }
      setHasMore(res.page < res.totalPages)
      setPage(p)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setIsOpen(true)
    loadStudents(query, 1)
  }

  const loadMore = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!loading && hasMore) {
      loadStudents(query, page + 1)
    }
  }

  const toggleStudent = (student: StudentData) => {
    const isSelected = selectedStudents.some((s) => s.id === student.id)
    let newSelected: StudentData[] = []
    if (isSelected) {
      newSelected = selectedStudents.filter((s) => s.id !== student.id)
    } else {
      newSelected = [...selectedStudents, student]
    }
    setSelectedStudents(newSelected)
    setValue(
      'studentIds',
      newSelected.map((s) => s.id),
    )
  }

  const removeStudent = (id: string) => {
    const newSelected = selectedStudents.filter((s) => s.id !== id)
    setSelectedStudents(newSelected)
    setValue(
      'studentIds',
      newSelected.map((s) => s.id),
    )
  }

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
      <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
        <span className="bg-[#6A5EEB]/10 p-1.5 rounded-lg text-[#6A5EEB]">🎓</span> Thông tin cơ bản
      </h2>

      {/* Cover Image Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa lớp học</label>
        <div className="border-2 border-dashed border-gray-200 hover:border-[#6A5EEB]/50 rounded-2xl h-40 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-[#6A5EEB]/5 transition-all cursor-pointer group">
          <div className="bg-white p-3 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.05)] group-hover:scale-110 transition-transform duration-300 mb-3">
            <ImagePlus className="text-gray-400 group-hover:text-[#6A5EEB]" size={24} />
          </div>
          <p className="text-sm text-gray-500 font-medium">Kéo thả hoặc Click để tải ảnh lên</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG (Tối đa 5MB)</p>
        </div>
      </div>

      {/* Form Inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tên lớp học <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder="VD: Lớp Tiếng Anh Giao Tiếp K20"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6A5EEB] focus:ring-4 focus:ring-[#6A5EEB]/10 transition-all outline-none text-gray-800 placeholder:text-gray-400 bg-white/50 focus:bg-white"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả lớp học</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Mục tiêu, đối tượng, phương pháp giảng dạy..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6A5EEB] focus:ring-4 focus:ring-[#6A5EEB]/10 transition-all outline-none text-gray-800 placeholder:text-gray-400 bg-white/50 focus:bg-white resize-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mã tham gia (Invite Code)
            </label>
            <input
              {...register('inviteCode')}
              type="text"
              placeholder="Để trống tự động tạo"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#6A5EEB] focus:ring-4 focus:ring-[#6A5EEB]/10 transition-all outline-none text-gray-800 placeholder:text-gray-400 bg-white/50 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phí tham gia</label>
            <input
              type="text"
              placeholder="Miễn phí"
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Thêm Học Sinh Section */}
      <div className="mt-8 pt-6 border-t border-gray-100 border-dashed">
        <h3 className="text-md font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <span className="bg-indigo-100 p-1.5 rounded-lg text-indigo-500">
            <Users size={16} />
          </span>
          Thêm học sinh vào lớp
        </h3>
        <p className="text-sm text-gray-500 mb-4 ml-8">
          Tìm kiếm học sinh để thêm vào lớp học ngay.
        </p>

        {/* Search Dropdown */}
        <div className="relative mb-4" ref={dropdownRef}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                onFocus={() => {
                  if (students.length > 0) setIsOpen(true)
                }}
                placeholder="Tìm kiếm theo tên, email... (để trống để tìm tất cả)"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#6A5EEB] focus:ring-4 focus:ring-[#6A5EEB]/10 transition-all outline-none text-gray-800 placeholder:text-gray-400 bg-white/50 focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="px-5 py-3 bg-[#6A5EEB] hover:bg-[#5b4fd6] text-white font-medium rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 shadow-[0_4px_15px_rgba(106,94,235,0.2)]"
            >
              Tìm kiếm
            </button>
          </div>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 max-h-72 overflow-y-auto z-50 py-2 custom-scrollbar animate-in slide-in-from-top-2">
              {loading && page === 1 ? (
                <div className="py-8 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-sm">Đang tìm kiếm...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  Không tìm thấy học sinh nào
                </div>
              ) : (
                <>
                  {students.map((student) => {
                    const isSelected = selectedStudents.some((s) => s.id === student.id)
                    return (
                      <div
                        key={student.id}
                        onClick={() => toggleStudent(student)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors group"
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border transition-colors ${
                            isSelected
                              ? 'bg-[#6A5EEB] border-[#6A5EEB] text-white'
                              : 'border-gray-300 group-hover:border-[#6A5EEB]'
                          }`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6A5EEB] to-purple-500 flex items-center justify-center text-white font-medium text-sm shadow-sm shrink-0 uppercase">
                          {student.name ? student.name.charAt(0) : student.email.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{student.email}</p>
                        </div>
                      </div>
                    )
                  })}

                  {loading && page > 1 && (
                    <div className="py-3 flex justify-center">
                      <Loader2 className="animate-spin text-gray-400" size={20} />
                    </div>
                  )}

                  {hasMore && !loading && (
                    <div className="px-4 py-2 mt-1 border-t border-gray-50">
                      <button
                        onClick={loadMore}
                        className="w-full py-2 text-sm text-[#6A5EEB] font-medium hover:bg-[#6A5EEB]/5 rounded-lg transition-colors"
                      >
                        Tải thêm
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Danh sách học sinh đã chọn */}
        <div className="space-y-2 mt-4">
          {selectedStudents.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-sm">
              Chưa chọn học sinh nào
            </div>
          )}
          {selectedStudents.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm group hover:border-[#6A5EEB]/30 transition-colors animate-in slide-in-from-top-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6A5EEB] to-purple-500 flex items-center justify-center text-white font-medium text-xs shadow-sm shrink-0 uppercase">
                  {student.name ? student.name.charAt(0) : student.email.charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-gray-700 block truncate">
                    {student.name}
                  </span>
                  <span className="text-xs text-gray-500 block truncate">{student.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeStudent(student.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ClassInfoForm
