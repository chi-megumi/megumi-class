'use client'

import { useState } from 'react'
import {
  Copy,
  Users,
  BookOpen,
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import {
  updateEnrollmentStatus,
  removeStudentFromClass,
  addStudentsToClass,
  createUnit,
  updateUnitVocab,
  deleteUnit,
  updateUnitSettings,
  updateUnitInfo,
} from '~/actions/class'
import { searchStudents } from '~/actions/student'
import { useRouter } from 'next/navigation'

import UnitDetailModal from '@/modules/teacher/components/unit/UnitDetailModal'

import OverviewTab from './overview/OverviewTab'
import StudentsTab from './students/StudentsTab'
import AddStudentModal from './students/AddStudentModal'
import UnitsTab from './unit/UnitsTab'
import CreateUnitModal from './unit/CreateUnitModal'
import EditUnitModal from './unit/EditUnitModal'
import { StudentData, EnrollmentData, UnitData, ClassData, VocabItemData } from '../types'

type ClassDashboardClientProps = {
  classData: ClassData
}

const ClassDashboardClient = ({ classData }: ClassDashboardClientProps) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [loadingEnrollmentId, setLoadingEnrollmentId] = useState<string | null>(null)

  // Add Students state
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StudentData[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedToAdd, setSelectedToAdd] = useState<StudentData[]>([])
  const [adding, setAdding] = useState(false)

  // Unit State
  const [showCreateUnitModal, setShowCreateUnitModal] = useState(false)
  const [newUnitTitle, setNewUnitTitle] = useState('')
  const [newUnitDesc, setNewUnitDesc] = useState('')
  const [creatingUnit, setCreatingUnit] = useState(false)

  // Edit unit info state
  const [editingUnitInfo, setEditingUnitInfo] = useState<UnitData | null>(null)
  const [showEditUnitModal, setShowEditUnitModal] = useState(false)
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({})

  // Edit Vocab State
  const [editingUnit, setEditingUnit] = useState<UnitData | null>(null)
  const [editVocabList, setEditVocabList] = useState<VocabItemData[]>([])
  const [savingVocab, setSavingVocab] = useState(false)

  const pendingStudents = classData.students.filter((s: EnrollmentData) => s.status === 'pending')
  const activeStudents = classData.students.filter((s: EnrollmentData) => s.status === 'active')

  const handleCopyCode = () => {
    if (classData.inviteCode) {
      navigator.clipboard.writeText(classData.inviteCode)
      // Could add a toast here
    }
  }

  const handleUpdateStatus = async (enrollmentId: string, status: 'active' | 'rejected') => {
    setLoadingEnrollmentId(enrollmentId)
    try {
      await updateEnrollmentStatus(enrollmentId, status)
      // Next.js Server Action with revalidatePath will automatically refresh data,
      // but router.refresh() ensures the client catches up smoothly
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
        selectedToAdd.map((s) => s.id),
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

  const handleCreateUnit = async () => {
    if (!newUnitTitle.trim()) return
    setCreatingUnit(true)
    try {
      await createUnit(classData.id, newUnitTitle, newUnitDesc)
      setShowCreateUnitModal(false)
      setNewUnitTitle('')
      setNewUnitDesc('')
      router.refresh()
    } catch {
      alert('Có lỗi xảy ra')
    } finally {
      setCreatingUnit(false)
    }
  }

  const handleUpdateUnitInfo = async (unitId: string, title: string, desc: string) => {
    try {
      await updateUnitInfo(unitId, title, desc)
      setShowEditUnitModal(false)
      setEditingUnitInfo(null)
      router.refresh()
    } catch {
      alert('Có lỗi xảy ra khi cập nhật bài học')
    }
  }

  const handleOpenEditVocab = (unit: UnitData) => {
    setEditingUnit(unit)
    setEditVocabList(unit.vocabItems || [])
  }

  const handleSaveVocab = async () => {
    if (!editingUnit) return
    setSavingVocab(true)
    try {
      await updateUnitVocab(editingUnit.id, editVocabList)
      setEditingUnit(null)
      router.refresh()
    } catch {
      alert('Có lỗi xảy ra khi lưu')
    } finally {
      setSavingVocab(false)
    }
  }

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Xóa bài học này sẽ xóa toàn bộ từ vựng bên trong. Bạn chắc chứ?')) return
    try {
      await deleteUnit(unitId)
      router.refresh()
    } catch {
      alert('Lỗi khi xóa bài học')
    }
  }

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }))
  }

  const handleToggleVisibility = async (unitId: string, currentStatus: boolean) => {
    try {
      await updateUnitSettings(unitId, { isPublished: !currentStatus })
      router.refresh()
    } catch {
      alert('Lỗi khi cập nhật trạng thái hiển thị')
    }
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'students', label: 'Quản lý học sinh', icon: Users, badge: pendingStudents.length },
    { id: 'units', label: 'Bài học & Từ vựng', icon: BookOpen },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500" style={{ zoom: 0.8 }}>
      {/* Header Card */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{classData.name}</h1>
            <p className="text-gray-500 line-clamp-2 max-w-2xl">
              {classData.description || 'Chưa có mô tả'}
            </p>
          </div>

          {classData.inviteCode && (
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 flex flex-col items-center shadow-sm shrink-0">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                Mã tham gia
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-indigo-900 tracking-widest">
                  {classData.inviteCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-indigo-100 text-indigo-500 rounded-xl transition-colors active:scale-95"
                  title="Copy mã"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#6A5EEB] text-white shadow-[0_4px_15px_rgba(106,94,235,0.2)]'
                  : 'bg-white/60 text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100'
              }`}
            >
              <Icon size={18} />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`ml-1.5 px-2 py-0.5 text-xs rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 min-h-[400px]">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <OverviewTab classData={classData} activeStudents={activeStudents} />
        )}

        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
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
        )}

        {/* UNITS & VOCAB TAB */}
        {activeTab === 'units' && (
          <UnitsTab
            units={classData.units}
            setShowCreateUnitModal={setShowCreateUnitModal}
            expandedUnits={expandedUnits}
            toggleUnit={toggleUnit}
            handleOpenEditVocab={handleOpenEditVocab}
            handleDeleteUnit={handleDeleteUnit}
            handleToggleVisibility={handleToggleVisibility}
            onEditUnitInfo={(unit) => {
              setEditingUnitInfo(unit)
              setShowEditUnitModal(true)
            }}
          />
        )}

        {/* OTHER TABS PLACEHOLDER */}
        {activeTab !== 'overview' && activeTab !== 'students' && activeTab !== 'units' && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-in zoom-in-95 duration-500">
            <Settings size={48} className="mb-4 opacity-20" />
            <p>Tính năng đang được phát triển...</p>
          </div>
        )}
      </div>

      {/* Add Students Modal */}
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

      {/* Create Unit Modal */}
      {showCreateUnitModal && (
        <CreateUnitModal
          setShowCreateUnitModal={setShowCreateUnitModal}
          newUnitTitle={newUnitTitle}
          setNewUnitTitle={setNewUnitTitle}
          newUnitDesc={newUnitDesc}
          setNewUnitDesc={setNewUnitDesc}
          handleCreateUnit={handleCreateUnit}
          creatingUnit={creatingUnit}
        />
      )}

      {/* Edit Unit Modal */}
      {showEditUnitModal && (
        <EditUnitModal
          unit={editingUnitInfo}
          setShowEditUnitModal={setShowEditUnitModal}
          handleUpdateUnitInfo={handleUpdateUnitInfo}
        />
      )}

      {/* Unit Detail Modal (Tabs: Vocab, Games, Analytics) */}
      {editingUnit && (
        <UnitDetailModal
          editVocabList={editVocabList}
          editingUnit={editingUnit}
          savingVocab={savingVocab}
          setEditingUnit={setEditingUnit}
          setEditVocabList={setEditVocabList}
          handleSaveVocab={handleSaveVocab}
        />
      )}
    </div>
  )
}

export default ClassDashboardClient
