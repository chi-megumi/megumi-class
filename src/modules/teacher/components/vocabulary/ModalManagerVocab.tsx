import VocabManager from '@/modules/teacher/components/vocabulary/VocabManager'
import { Loader2 } from 'lucide-react'
import { UnitData, VocabItemData } from '../../types'
import Portal from '@/components/common/Portal'

interface ModalManagerVocabularyProps {
  editingUnit: UnitData
  editVocabList: VocabItemData[]
  savingVocab: boolean
  setEditingUnit: (unit: UnitData | null) => void
  setEditVocabList: (list: VocabItemData[]) => void
  handleSaveVocab: () => void
}

const ModalManagerVocabulary = ({
  editingUnit,
  editVocabList,
  savingVocab,
  setEditingUnit,
  setEditVocabList,
  handleSaveVocab,
}: ModalManagerVocabularyProps) => {
  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white w-full max-w-6xl h-full rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-gray-200/50">
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Quản lý từ vựng</h2>
            <p className="text-sm text-gray-500">
              Đang chỉnh sửa:{' '}
              <span className="font-semibold text-indigo-600">{editingUnit.title}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEditingUnit(null)}
              className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleSaveVocab}
              disabled={savingVocab}
              className="px-6 py-2.5 bg-[#6A5EEB] hover:bg-[#5b51d8] text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {savingVocab && <Loader2 size={16} className="animate-spin" />}
              Lưu thay đổi ({editVocabList.length} từ)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/30">
          <VocabManager vocabList={editVocabList} onChange={setEditVocabList} />
        </div>
      </div>
    </div>
    </Portal>
  )
}

export default ModalManagerVocabulary
