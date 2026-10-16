'use client'

import { useState } from 'react'
import { AlertOctagon, Trash2 } from 'lucide-react'
import { DangerZoneCardProps } from './types'
import DeleteClassModal from './DeleteClassModal'

export default function DangerZoneCard({ classData }: DangerZoneCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  return (
    <>
      <div className="bg-red-50/40 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-red-200/80 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertOctagon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-red-900">Vùng nguy hiểm</h2>
              <p className="text-sm text-red-700/70">
                Các thao tác có tác động vĩnh viễn và không thể khôi phục
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base">Xóa lớp học này</h3>
            <p className="text-sm text-gray-500 max-w-xl mt-0.5">
              Sau khi xóa, toàn bộ danh sách bài học, dữ liệu từ vựng, bài kiểm tra và tiến độ học
              tập của học sinh thuộc lớp này sẽ biến mất vĩnh viễn.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-all active:scale-95"
          >
            <Trash2 size={16} />
            Xóa lớp học
          </button>
        </div>
      </div>

      <DeleteClassModal
        classData={classData}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  )
}
