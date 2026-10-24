'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UnitsTab from './UnitsTab'
import CreateUnitModal from './CreateUnitModal'
import EditUnitModal from './EditUnitModal'
import UnitDetailModal from './UnitDetailModal'
import { UnitData, ClassData, VocabItemData, EnrollmentData } from '../../types'
import { sortUnits } from '../../utils/unitSort'
import {
  createUnit,
  updateUnitVocab,
  deleteUnit,
  updateUnitSettings,
  updateUnitInfo,
} from '~/actions/class'

type TeacherUnitsClientProps = {
  classData: ClassData
  initialUnitId?: string
  initialTab?: 'vocab' | 'games' | 'analytics'
}

export default function TeacherUnitsClient({
  classData,
  initialUnitId,
  initialTab,
}: TeacherUnitsClientProps) {
  const router = useRouter()

  // Local state for units to allow immediate UI updates and maintain creation order
  const [prevClassUnits, setPrevClassUnits] = useState(classData.units)
  const [units, setUnits] = useState<UnitData[]>(() => sortUnits(classData.units || []))
  const [updatingUnitId, setUpdatingUnitId] = useState<string | null>(null)

  if (classData.units !== prevClassUnits) {
    setPrevClassUnits(classData.units)
    setUnits(sortUnits(classData.units || []))
  }

  const initialUnit = initialUnitId ? units.find((u) => u.id === initialUnitId) || null : null

  // Unit State
  const [showCreateUnitModal, setShowCreateUnitModal] = useState(false)
  const [newUnitTitle, setNewUnitTitle] = useState('')
  const [newUnitDesc, setNewUnitDesc] = useState('')
  const [creatingUnit, setCreatingUnit] = useState(false)

  // Edit unit info state
  const [editingUnitInfo, setEditingUnitInfo] = useState<UnitData | null>(null)
  const [showEditUnitModal, setShowEditUnitModal] = useState(false)
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>(() => {
    if (initialUnitId) {
      return { [initialUnitId]: true }
    }
    return {}
  })

  // Edit Vocab State
  const [prevInitialUnitId, setPrevInitialUnitId] = useState(initialUnitId)
  const [editingUnit, setEditingUnit] = useState<UnitData | null>(initialUnit)
  const [editVocabList, setEditVocabList] = useState<VocabItemData[]>(() => initialUnit?.vocabItems || [])
  const [detailModalTab, setDetailModalTab] = useState<'vocab' | 'games' | 'analytics'>(
    initialTab || 'games'
  )
  const [savingVocab, setSavingVocab] = useState(false)

  if (initialUnitId !== prevInitialUnitId) {
    setPrevInitialUnitId(initialUnitId)
    if (initialUnitId) {
      const found = units.find((u) => u.id === initialUnitId) || null
      setEditingUnit(found)
      setEditVocabList(found?.vocabItems || [])
      setExpandedUnits((prev) => ({ ...prev, [initialUnitId]: true }))
      if (initialTab) {
        setDetailModalTab(initialTab)
      }
    }
  }

  // If unit data refreshes while editingUnit is open, keep editingUnit in sync
  const [prevUnitsForSync, setPrevUnitsForSync] = useState(units)
  if (units !== prevUnitsForSync) {
    setPrevUnitsForSync(units)
    if (editingUnit) {
      const fresh = units.find((u) => u.id === editingUnit.id)
      if (fresh && fresh !== editingUnit) {
        setEditingUnit(fresh)
        if (!savingVocab) {
          setEditVocabList(fresh.vocabItems || [])
        }
      }
    }
  }

  const activeStudents = (classData.students || []).filter(
    (s: EnrollmentData) => s.status === 'active'
  )

  const handleCreateUnit = async () => {
    if (!newUnitTitle.trim()) return
    setCreatingUnit(true)
    try {
      const res = await createUnit(classData.id, newUnitTitle, newUnitDesc)
      if (res?.success && res.unit) {
        setUnits((prev) => sortUnits([...prev, res.unit as unknown as UnitData]))
      }
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
      const res = await updateUnitInfo(unitId, title, desc)
      if (res?.success) {
        setUnits((prev) =>
          prev.map((u) =>
            u.id === unitId ? { ...u, title: title.trim(), description: desc?.trim() || '' } : u
          )
        )
      }
      setShowEditUnitModal(false)
      setEditingUnitInfo(null)
      router.refresh()
    } catch {
      alert('Có lỗi xảy ra khi cập nhật bài học')
    }
  }

  const handleOpenEditVocab = (unit: UnitData, tab: 'vocab' | 'games' | 'analytics' = 'vocab') => {
    setEditingUnit(unit)
    setDetailModalTab(tab)
    const sorted = [...(unit.vocabItems || [])].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        const timeDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (timeDiff !== 0) return timeDiff
      }
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    })
    setEditVocabList(sorted)
  }

  const handleCloseDetailModal = () => {
    setEditingUnit(null)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (url.searchParams.has('unitId') || url.searchParams.has('tab')) {
        url.searchParams.delete('unitId')
        url.searchParams.delete('tab')
        window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''))
      }
    }
  }

  const handleUpdateEditingUnit = (unit: UnitData | null) => {
    if (unit === null) {
      handleCloseDetailModal()
      return
    }
    setEditingUnit(unit)
    setUnits((prev) => prev.map((u) => (u.id === unit.id ? unit : u)))
  }

  const handleSaveVocab = async () => {
    if (!editingUnit) return
    setSavingVocab(true)
    const newlyUploadedPaths: string[] = []

    try {
      // 1. Tải lên các file ảnh mới được chọn (Deferred Upload)
      const preparedList = await Promise.all(
        editVocabList.map(async (item) => {
          if (item.pendingFile) {
            const formData = new FormData()
            formData.append('file', item.pendingFile)

            const res = await fetch('/api/upload/vocab-image', {
              method: 'POST',
              body: formData,
            })

            const json = await res.json()
            if (!res.ok || !json.success) {
              throw new Error(json.error || `Lỗi tải ảnh cho từ "${item.word}"`)
            }

            newlyUploadedPaths.push(json.path)
            return {
              ...item,
              image: json.path,
              pendingFile: undefined,
            }
          }
          return item
        })
      )

      // 2. Chuyển đổi dữ liệu chuẩn gửi cho server action
      const vocabInputData = preparedList.map((item) => ({
        word: item.word,
        vi: item.vi,
        ipa: item.ipa || null,
        pos: item.pos || null,
        emoji: item.emoji || null,
        image: item.image || null,
        example: item.example || null,
        exampleVi: item.exampleVi || null,
        tip: item.tip || null,
      }))

      // 3. Lưu vào Database qua Server Action
      await updateUnitVocab(editingUnit.id, vocabInputData)

      // 4. Cập nhật state cục bộ
      setUnits((prev) =>
        prev.map((u) =>
          u.id === editingUnit.id ? { ...u, vocabItems: preparedList } : u
        )
      )
      setEditingUnit(null)
      router.refresh()
    } catch (error: unknown) {
      console.error('Lỗi khi lưu từ vựng:', error)

      if (newlyUploadedPaths.length > 0) {
        fetch('/api/upload/vocab-image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: newlyUploadedPaths }),
        }).catch((cleanupErr) => console.warn('Lỗi dọn dẹp ảnh tạm:', cleanupErr))
      }

      const msg = error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu từ vựng'
      alert(msg)
    } finally {
      setSavingVocab(false)
    }
  }

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Xóa bài học này sẽ xóa toàn bộ từ vựng bên trong. Bạn chắc chứ?')) return
    try {
      const res = await deleteUnit(unitId)
      if (res?.success) {
        setUnits((prev) => prev.filter((u) => u.id !== unitId))
      }
      router.refresh()
    } catch {
      alert('Lỗi khi xóa bài học')
    }
  }

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }))
  }

  const handleToggleVisibility = async (unitId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus
    setUpdatingUnitId(unitId)
    try {
      const res = await updateUnitSettings(unitId, { isPublished: nextStatus })
      if (res?.success) {
        setUnits((prev) =>
          prev.map((u) => (u.id === unitId ? { ...u, isPublished: nextStatus } : u))
        )
      }
      router.refresh()
    } catch {
      alert('Lỗi khi cập nhật trạng thái hiển thị')
    } finally {
      setUpdatingUnitId(null)
    }
  }

  return (
    <>
      <UnitsTab
        units={units}
        setShowCreateUnitModal={setShowCreateUnitModal}
        expandedUnits={expandedUnits}
        toggleUnit={toggleUnit}
        handleOpenEditVocab={handleOpenEditVocab}
        handleDeleteUnit={handleDeleteUnit}
        handleToggleVisibility={handleToggleVisibility}
        updatingUnitId={updatingUnitId}
        onEditUnitInfo={(unit) => {
          setEditingUnitInfo(unit)
          setShowEditUnitModal(true)
        }}
      />

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
          setEditingUnit={handleUpdateEditingUnit}
          onClose={handleCloseDetailModal}
          setEditVocabList={setEditVocabList}
          handleSaveVocab={handleSaveVocab}
          activeStudents={activeStudents}
          classExams={classData.exams}
          initialTab={detailModalTab}
          onTabChange={setDetailModalTab}
        />
      )}
    </>
  )
}
