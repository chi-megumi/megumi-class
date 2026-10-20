'use client'

import { UserPlus, Search, X, CheckCircle2, Loader2 } from 'lucide-react'
import { StudentData } from '../../types'
import Portal from '@/components/common/Portal'
import AddStudentSearchSkeleton from './loading/AddStudentSearchSkeleton'

type AddStudentModalProps = {
  setShowAddModal: (show: boolean) => void
  handleSearchToInvite: () => Promise<void>
  searchQuery: string
  setSearchQuery: (query: string) => void
  searching: boolean
  searchResults: StudentData[]
  selectedToAdd: StudentData[]
  setSelectedToAdd: (students: StudentData[]) => void
  handleAddStudents: () => Promise<void>
  adding: boolean
}

const AddStudentModal = ({
  setShowAddModal,
  handleSearchToInvite,
  searchQuery,
  setSearchQuery,
  searching,
  searchResults,
  selectedToAdd,
  setSelectedToAdd,
  handleAddStudents,
  adding,
}: AddStudentModalProps) => {
  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="bg-[#6A5EEB]/10 p-1.5 rounded-lg text-[#6A5EEB]">
              <UserPlus size={20} />
            </span>
            Thêm học sinh mới
          </h2>
          <button
            onClick={() => setShowAddModal(false)}
            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchToInvite()}
              placeholder="Nhập tên hoặc email..."
              className="flex-1 pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#6A5EEB] focus:ring-2 focus:ring-[#6A5EEB]/10 outline-none transition-all"
            />
            <button
              onClick={handleSearchToInvite}
              disabled={searching}
              className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
            >
              {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Tìm
            </button>
          </div>

          {/* Search Results / Loading Skeleton */}
          {searching ? (
            <AddStudentSearchSkeleton count={3} />
          ) : searchResults.length > 0 ? (
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-inner bg-gray-50 max-h-60 overflow-y-auto custom-scrollbar">
              {searchResults.map((student) => {
                const isSelected = selectedToAdd.some((s) => s.id === student.id)
                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      if (isSelected)
                        setSelectedToAdd(selectedToAdd.filter((s) => s.id !== student.id))
                      else setSelectedToAdd([...selectedToAdd, student])
                    }}
                    className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                      isSelected ? 'bg-indigo-50/50' : 'hover:bg-white'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#6A5EEB] border-[#6A5EEB]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-medium text-xs uppercase shadow-sm shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}

          {/* Selected List Tags */}
          {selectedToAdd.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedToAdd.map((student) => (
                <span
                  key={student.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-100"
                >
                  {student.name}
                  <button
                    onClick={() =>
                      setSelectedToAdd(selectedToAdd.filter((s) => s.id !== student.id))
                    }
                    className="hover:bg-indigo-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={() => setShowAddModal(false)}
            className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleAddStudents}
            disabled={selectedToAdd.length === 0 || adding}
            className="px-6 py-2.5 bg-[#6A5EEB] hover:bg-[#5b51d8] text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {adding && <Loader2 size={16} className="animate-spin" />}
            Thêm {selectedToAdd.length > 0 ? `(${selectedToAdd.length})` : ''}
          </button>
        </div>
      </div>
      </div>
    </Portal>
  )
}

export default AddStudentModal
