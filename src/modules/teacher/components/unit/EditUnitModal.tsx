'use client'

import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { UnitData } from '../../types'
import Portal from '@/components/common/Portal'

type EditUnitModalProps = {
  unit: UnitData | null
  setShowEditUnitModal: (show: boolean) => void
  handleUpdateUnitInfo: (unitId: string, title: string, desc: string) => Promise<void>
}

const EditUnitModal = ({
  unit,
  setShowEditUnitModal,
  handleUpdateUnitInfo,
}: EditUnitModalProps) => {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (unit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(unit.title)
      setDesc(unit.description || '')
    }
  }, [unit])

  const onUpdate = async () => {
    if (!unit || !title.trim()) return
    setUpdating(true)
    await handleUpdateUnitInfo(unit.id, title, desc)
    setUpdating(false)
  }

  if (!unit) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Sửa thông tin bài học</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài học *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Unit 1 - Hello"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#6A5EEB] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả (Không bắt buộc)
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Mô tả ngắn gọn về bài học..."
              className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-[#6A5EEB] resize-none"
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={() => setShowEditUnitModal(false)}
            className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onUpdate}
            disabled={!title.trim() || updating}
            className="px-6 py-2.5 bg-[#6A5EEB] hover:bg-[#5b51d8] text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {updating && <Loader2 size={16} className="animate-spin" />}
            Lưu thay đổi
          </button>
        </div>
      </div>
      </div>
    </Portal>
  )
}

export default EditUnitModal
