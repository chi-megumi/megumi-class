import { useState, useTransition } from 'react'
import { Loader2, BookA, Gamepad2, BarChart3 } from 'lucide-react'
import { UnitData, VocabItemData } from '../../types'
import VocabManager from '@/modules/teacher/components/vocabulary/VocabManager'
import { updateUnitSettings } from '@/actions/class'
import TestBuilderModal from './TestBuilderModal'
import TestResultsModal from './TestResultsModal'
import UnitGamesTab from './UnitGamesTab'
import ExamGeneratorModal from './ExamGeneratorModal'
import { GeneratedExamResult } from '../../utils/examGenerator'
import { TestContent } from '../../types'

interface UnitDetailModalProps {
  editingUnit: UnitData
  editVocabList: VocabItemData[]
  savingVocab: boolean
  setEditingUnit: (unit: UnitData | null) => void
  setEditVocabList: (list: VocabItemData[]) => void
  handleSaveVocab: () => void
}

const UnitDetailModalInner = ({
  editingUnit,
  editVocabList,
  savingVocab,
  setEditingUnit,
  setEditVocabList,
  handleSaveVocab,
}: UnitDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<'vocab' | 'games' | 'analytics'>('vocab')
  const [editingTestId, setEditingTestId] = useState<string | null>(null)
  const [generatedExam, setGeneratedExam] = useState<GeneratedExamResult | null>(null)
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [viewingResultsTest, setViewingResultsTest] = useState<TestContent | null>(null)
  const [isPending, startTransition] = useTransition()

  // Local state for optimistic updates
  const [settings, setSettings] = useState({
    isFlashcardEnabled: editingUnit.isFlashcardEnabled ?? true,
    isQuizEnabled: editingUnit.isQuizEnabled ?? true,
    isMatchEnabled: editingUnit.isMatchEnabled ?? false,
  })

  const toggleSetting = (key: keyof typeof settings) => {
    const newValue = !settings[key]
    setSettings(prev => ({ ...prev, [key]: newValue }))
    
    startTransition(async () => {
      try {
        await updateUnitSettings(editingUnit.id, { [key]: newValue })
      } catch (error) {
        // Revert on error
        setSettings(prev => ({ ...prev, [key]: !newValue }))
        console.error('Failed to update setting', error)
      }
    })
  }

  const tabs = [
    { id: 'vocab', label: '1. Quản lý từ vựng', icon: BookA },
    { id: 'games', label: '2. Hoạt động & Trò chơi', icon: Gamepad2 },
    { id: 'analytics', label: '3. Báo cáo học tập', icon: BarChart3 },
  ] as const

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white w-full max-w-6xl h-full rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-gray-200/50">
        
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Chi tiết bài học</h2>
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
              Lưu thay đổi
            </button>
          </div>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="px-8 pt-4 bg-gray-50/50 border-b border-gray-100 shrink-0 flex gap-4">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 mb-[-1px] ${
                  isActive 
                    ? 'border-[#6A5EEB] text-[#6A5EEB]' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 flex flex-col">
          
          {/* TAB 1: VOCAB */}
          {activeTab === 'vocab' && (
            <div className="p-8 flex-1 flex flex-col">
              <div className="mb-6 shrink-0">
                <h3 className="text-lg font-bold text-gray-800">Danh sách từ vựng</h3>
                <p className="text-gray-500 text-sm">Thêm, sửa, xóa các từ vựng cho bài học này. Bạn cần lưu lại để cập nhật thay đổi.</p>
              </div>
              <div className="flex-1">
                <VocabManager vocabList={editVocabList} onChange={setEditVocabList} />
              </div>
            </div>
          )}

          {/* TAB 2: GAMES PREVIEW */}
          {activeTab === 'games' && (
            <UnitGamesTab
              editingUnit={editingUnit}
              settings={settings}
              isPending={isPending}
              toggleSetting={toggleSetting}
              setEditingTestId={setEditingTestId}
              setViewingResultsTest={setViewingResultsTest}
              setEditingUnit={setEditingUnit}
              onOpenGenerator={() => setIsGeneratorOpen(true)}
            />
          )}

          {/* TAB 3: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="p-8 flex flex-col items-center justify-center flex-1 text-center bg-white rounded-t-3xl border-t border-gray-100">
              <BarChart3 size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">Báo cáo học tập</h3>
              <p className="text-gray-500 max-w-md">
                Tính năng này sẽ hiển thị thống kê học sinh nào đã học, tiến độ hoàn thành, và các từ vựng học sinh thường làm sai nhất. Sẽ được phát triển trong Phase 4.
              </p>
            </div>
          )}

        </div>
      </div>
      
      {editingTestId && (
        <TestBuilderModal 
          unitId={editingUnit.id}
          editingTestId={editingTestId}
          existingTests={Array.isArray(editingUnit.exams) ? editingUnit.exams : []}
          vocabItems={editVocabList}
          unitTitle={editingUnit.title}
          initialExam={generatedExam ?? undefined}
          onClose={() => {
            setEditingTestId(null)
            setGeneratedExam(null)
          }} 
          onSaveSuccess={(newExams) => {
            setEditingUnit({ ...editingUnit, exams: newExams })
            setEditingTestId(null)
            setGeneratedExam(null)
          }}
        />
      )}

      {/* Generator Modal from Unit Games Tab */}
      {isGeneratorOpen && (
        <ExamGeneratorModal
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
          vocabItems={editVocabList}
          unitTitle={editingUnit.title}
          onGenerated={(result) => {
            setGeneratedExam(result)
            setEditingTestId('new')
          }}
        />
      )}

      {/* View Results Modal */}
      {viewingResultsTest && (
        <TestResultsModal
          unitId={editingUnit.id}
          testId={viewingResultsTest.id}
          testTitle={viewingResultsTest.title}
          testData={viewingResultsTest}
          onClose={() => setViewingResultsTest(null)}
        />
      )}
    </div>
  )
}

export default UnitDetailModalInner
