import { BookOpen, PlusCircle, ChevronDown, ChevronRight, Edit3, Trash2, Eye, EyeOff, Pencil } from 'lucide-react'
import { UnitData } from '../../types'

type UnitsTabProps = {
  units: UnitData[]
  setShowCreateUnitModal: (show: boolean) => void
  expandedUnits: Record<string, boolean>
  toggleUnit: (unitId: string) => void
  handleOpenEditVocab: (unit: UnitData) => void
  handleDeleteUnit: (unitId: string) => Promise<void>
  handleToggleVisibility: (unitId: string, currentStatus: boolean) => void
  onEditUnitInfo: (unit: UnitData) => void
}

const UnitsTab = ({
  units,
  setShowCreateUnitModal,
  expandedUnits,
  toggleUnit,
  handleOpenEditVocab,
  handleDeleteUnit,
  handleToggleVisibility,
  onEditUnitInfo,
}: UnitsTabProps) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="bg-[#6A5EEB]/10 p-1.5 rounded-lg text-[#6A5EEB]">
            <BookOpen size={18} />
          </span>
          Danh sách bài học ({units.length})
        </h3>
        <button
          onClick={() => setShowCreateUnitModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#6A5EEB] hover:bg-[#5b51d8] text-white rounded-xl text-sm font-medium transition-colors shadow-sm active:scale-95"
        >
          <PlusCircle size={16} />
          Tạo bài học mới
        </button>
      </div>

      {units.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
          Lớp này chưa có bài học nào
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <div
                onClick={() => toggleUnit(unit.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors group"
              >
                <div>
                  <h4 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    {unit.title}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditUnitInfo(unit)
                      }}
                      className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Sửa thông tin bài học"
                    >
                      <Pencil size={14} />
                    </button>
                  </h4>
                  {unit.description && (
                    <p className="text-sm text-gray-500 mt-1">{unit.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
                    {unit.vocabItems?.length || 0} từ
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${unit.isPublished ? 'text-green-600 bg-green-50 border-green-100' : 'text-gray-500 bg-gray-100 border-gray-200'}`}>
                    {unit.isPublished ? 'Đang hiện' : 'Đang ẩn'}
                  </span>
                  {expandedUnits[unit.id] ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                </div>
              </div>

              {expandedUnits[unit.id] && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Đã thêm {unit.vocabItems?.length || 0} từ vựng vào bài học này.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleVisibility(unit.id, !!unit.isPublished)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors shadow-sm ${
                        unit.isPublished
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {unit.isPublished ? <><EyeOff size={14} /> Ẩn bài học</> : <><Eye size={14} /> Hiện bài học</>}
                    </button>
                    <button
                      onClick={() => handleOpenEditVocab(unit)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                    >
                      <Edit3 size={14} /> Chi tiết bài học
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="flex items-center justify-center w-9 h-9 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                      title="Xóa bài học"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UnitsTab
