'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StudentsTab from './StudentsTab'
import AddStudentModal from './AddStudentModal'
import { ClassData, StudentData, EnrollmentData } from '../../types'
import {
  updateEnrollmentStatus,
  removeStudentFromClass,
  addStudentsToClass,
} from '~/actions/class'
import { searchStudents } from '~/actions/student'

type TeacherStudentsClientProps = {
  classData: ClassData
}

export default function TeacherStudentsClient({ classData }: TeacherStudentsClientProps) {
  const router = useRouter()
  const [loadingEnrollmentId, setLoadingEnrollmentId] = useState<string | null>(null)

  // Add Students state
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StudentData[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedToAdd, setSelectedToAdd] = useState<StudentData[]>([])
  const [adding, setAdding] = useState(false)

  const pendingStudents = (classData.students || []).filter(
    (s: EnrollmentData) => s.status === 'pending'
  )
  const activeStudents = (classData.students || []).filter(
    (s: EnrollmentData) => s.status === 'active'
  )

  const handleUpdateStatus = async (enrollmentId: string, status: 'active' | 'rejected') => {
    setLoadingEnrollmentId(enrollmentId)
    try {
      await updateEnrollmentStatus(enrollmentId, status)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Có lỗi xảy ra khi xử lý')
    } finally {
      setLoadingEnrollmentId(null)
    }
  }

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa học sinh này khỏi lớp?')) return
    setLoadingEnrollmentId(enrollmentId)
    try {
      await removeStudentFromClass(enrollmentId)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Có lỗi xảy ra khi xóa học sinh')
    } finally {
      setLoadingEnrollmentId(null)
    }
  }

  const handleSearchToInvite = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await searchStudents({ query: searchQuery, page: 1, limit: 10 })
      setSearchResults(res.students)
    } catch (err) {
      console.error(err)
    } finally {
      setSearching(false)
    }
  }

  const handleAddStudents = async () => {
    if (selectedToAdd.length === 0) return
    setAdding(true)
    try {
      await addStudentsToClass(
        classData.id,
        selectedToAdd.map((s) => s.id)
      )
      setShowAddModal(false)
      setSelectedToAdd([])
      setSearchResults([])
      setSearchQuery('')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Có lỗi xảy ra khi thêm học sinh')
    } finally {
      setAdding(false)
    }
  }

  return (
    <>
      <StudentsTab
        classId={classData.id}
        classData={classData}
        pendingStudents={pendingStudents}
        activeStudents={activeStudents}
        loadingEnrollmentId={loadingEnrollmentId}
        handleUpdateStatus={handleUpdateStatus}
        handleRemoveStudent={handleRemoveStudent}
        setShowAddModal={setShowAddModal}
      />

      {showAddModal && (
        <AddStudentModal
          setShowAddModal={setShowAddModal}
          handleSearchToInvite={handleSearchToInvite}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searching={searching}
          searchResults={searchResults}
          selectedToAdd={selectedToAdd}
          setSelectedToAdd={setSelectedToAdd}
          handleAddStudents={handleAddStudents}
          adding={adding}
        />
      )}
    </>
  )
}
