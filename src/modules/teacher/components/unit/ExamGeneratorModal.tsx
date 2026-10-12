import React, { useState, useMemo } from 'react'
import { Sparkles, X, Clock, Check, AlertCircle, Layers, BookOpen, CheckSquare, Square, RefreshCw, Plus, Minus } from 'lucide-react'
import { VocabItemData } from '../../types'
import { generateExamFromVocab, QuestionTypeOption, GeneratedExamResult, distributeQuestionCounts } from '../../utils/examGenerator'

export interface UnitVocabSummary {
  id: string
  title: string
  vocabItems?: VocabItemData[]
}

interface ExamGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  vocabItems?: VocabItemData[]
  unitTitle?: string
  availableUnits?: UnitVocabSummary[]
  onGenerated: (result: GeneratedExamResult) => void
}

const QUESTION_TYPE_OPTIONS: { id: QuestionTypeOption; label: string; desc: string }[] = [
  {
    id: 'en_to_vi',
    label: 'Tiếng Anh ➡️ Nghĩa tiếng Việt',
    desc: 'Hiển thị từ tiếng Anh, học sinh chọn 1 trong 4 nghĩa tiếng Việt đúng.',
  },
  {
    id: 'vi_to_en',
    label: 'Nghĩa tiếng Việt ➡️ Tiếng Anh',
    desc: 'Hiển thị nghĩa tiếng Việt, học sinh chọn 1 trong 4 từ tiếng Anh tương ứng.',
  },
  {
    id: 'example_mc',
    label: 'Trắc nghiệm theo ngữ cảnh câu ví dụ',
    desc: 'Ẩn từ vựng trong câu ví dụ, học sinh chọn từ thích hợp để điền vào câu.',
  },
  {
    id: 'fill_blank',
    label: 'Tự gõ từ vào câu (Điền khuyết)',
    desc: 'Học sinh đọc câu ví dụ và tự gõ từ tiếng Anh vào ô trống.',
  },
  {
    id: 'matching',
    label: 'Ghép nối từ vựng (Matching)',
    desc: 'Nối từ tiếng Anh ở Cột A với nghĩa tiếng Việt tương ứng ở Cột B.',
  },
  {
    id: 'reorder',
    label: 'Sắp xếp câu ví dụ (Sentence Reordering)',
    desc: 'Sắp xếp các từ bị xáo trộn thành câu ví dụ hoàn chỉnh chứa từ vựng.',
  },
]

export default function ExamGeneratorModal({
  isOpen,
  onClose,
  vocabItems = [],
  unitTitle,
  availableUnits,
  onGenerated,
}: ExamGeneratorModalProps) {
  // If availableUnits is provided, initialize selected unit IDs
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(() => {
    if (availableUnits && availableUnits.length > 0) {
      return availableUnits
        .filter((u) => (u.vocabItems?.length || 0) > 0)
        .map((u) => u.id)
    }
    return []
  })

  // Compute combined pool of vocab items
  const activeVocabs: VocabItemData[] = useMemo(() => {
    if (availableUnits && availableUnits.length > 0) {
      return availableUnits
        .filter((u) => selectedUnitIds.includes(u.id))
        .flatMap((u) => u.vocabItems || [])
    }
    return vocabItems
  }, [availableUnits, selectedUnitIds, vocabItems])

  const defaultTitle = availableUnits
    ? 'Bài kiểm tra tổng hợp'
    : unitTitle
      ? `Bài kiểm tra từ vựng: ${unitTitle}`
      : 'Bài kiểm tra từ vựng'

  const [title, setTitle] = useState(defaultTitle)
  const [duration, setDuration] = useState(availableUnits ? 45 : 15)
  const initialTotal = Math.min(20, Math.max(6, activeVocabs.length >= 20 ? 20 : (activeVocabs.length >= 10 ? 10 : activeVocabs.length || 10)))
  const [numQuestions, setNumQuestions] = useState(initialTotal)
  const [selectedTypes, setSelectedTypes] = useState<QuestionTypeOption[]>([
    'en_to_vi',
    'vi_to_en',
    'example_mc',
  ])
  const [typeCounts, setTypeCounts] = useState<Record<QuestionTypeOption, number>>(() =>
    distributeQuestionCounts(initialTotal, ['en_to_vi', 'vi_to_en', 'example_mc'])
  )
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const handleTotalQuestionsChange = (newTotal: number) => {
    const val = Math.max(1, newTotal)
    setNumQuestions(val)
    const newCounts = distributeQuestionCounts(val, selectedTypes)
    setTypeCounts(newCounts)
  }

  const handleUpdateTypeCount = (typeId: QuestionTypeOption, newCount: number) => {
    const parsed = isNaN(newCount) ? 2 : newCount
    const safeCount = Math.max(1, Math.min(100, parsed))
    const updated = { ...typeCounts, [typeId]: safeCount }
    setTypeCounts(updated)
    const totalFromParts = selectedTypes.reduce((sum, t) => sum + (updated[t] || 0), 0)
    setNumQuestions(totalFromParts)
  }

  const handleResetToAuto = () => {
    const newCounts = distributeQuestionCounts(numQuestions, selectedTypes)
    setTypeCounts(newCounts)
  }

  const toggleType = (typeId: QuestionTypeOption) => {
    let newSelected: QuestionTypeOption[]
    if (selectedTypes.includes(typeId)) {
      if (selectedTypes.length === 1) {
        setErrorMsg('Bạn cần giữ ít nhất 1 dạng câu hỏi!')
        return
      }
      newSelected = selectedTypes.filter((t) => t !== typeId)
    } else {
      newSelected = [...selectedTypes, typeId]
    }
    setSelectedTypes(newSelected)
    const newCounts = distributeQuestionCounts(numQuestions, newSelected)
    setTypeCounts(newCounts)
    setErrorMsg(null)
  }

  const toggleUnit = (uId: string) => {
    if (selectedUnitIds.includes(uId)) {
      setSelectedUnitIds(selectedUnitIds.filter((id) => id !== uId))
    } else {
      setSelectedUnitIds([...selectedUnitIds, uId])
    }
  }

  const selectAllUnits = () => {
    if (availableUnits) {
      setSelectedUnitIds(availableUnits.map((u) => u.id))
    }
  }

  const deselectAllUnits = () => {
    setSelectedUnitIds([])
  }

  const handleGenerate = () => {
    if (activeVocabs.length === 0) {
      setErrorMsg('Không có từ vựng nào trong các bài học đã chọn!')
      return
    }

    if (selectedTypes.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 dạng câu hỏi.')
      return
    }

    try {
      const result = generateExamFromVocab(activeVocabs, {
        title: title.trim() || defaultTitle,
        duration: Number(duration) || 15,
        numQuestions: Number(numQuestions) || 5,
        questionTypes: selectedTypes,
        typeCounts,
      })

      onGenerated(result)
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi tạo đề.')
    }
  }

  const quickQuestionCounts = [5, 10, 15, 20, 25].filter(
    (n) => n <= Math.max(10, activeVocabs.length * 2)
  )

  const quickDurations = [10, 15, 30, 45, 60]

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide">
                {availableUnits ? 'Tự Động Sinh Đề Tổng Hợp (Lớp Học)' : 'Tự Động Sinh Đề Từ Vựng'}
              </h2>
              <p className="text-indigo-100 text-sm">
                Thuật toán trích xuất và biến đổi từ vựng thành bộ câu hỏi chuẩn hóa
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          {/* Multi-unit selector (if availableUnits is present) */}
          {availableUnits && availableUnits.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-600" /> Chọn các bài học để gộp từ vựng
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllUnits}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={deselectAllUnits}
                    className="text-xs font-bold text-gray-500 hover:underline"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                {availableUnits.map((u) => {
                  const isChecked = selectedUnitIds.includes(u.id)
                  const count = u.vocabItems?.length || 0
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleUnit(u.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-white border-indigo-300 text-indigo-900 shadow-sm font-semibold'
                          : 'bg-indigo-50/30 border-transparent text-gray-500 hover:bg-white/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isChecked ? (
                          <CheckSquare size={16} className="text-indigo-600 shrink-0" />
                        ) : (
                          <Square size={16} className="text-gray-400 shrink-0" />
                        )}
                        <span className="truncate">{u.title}</span>
                      </div>
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-bold ml-2 shrink-0">
                        {count} từ
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Vocab Summary Card */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-indigo-900">Tổng từ vựng khả dụng</p>
                <p className="text-xs text-indigo-600">
                  {availableUnits
                    ? `Đã gom từ ${selectedUnitIds.length}/${availableUnits.length} bài học`
                    : unitTitle
                      ? `Bài học: ${unitTitle}`
                      : 'Toàn bộ từ vựng được chọn'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-indigo-600">{activeVocabs.length}</span>
              <span className="text-xs text-indigo-500 font-bold ml-1">từ</span>
            </div>
          </div>

          {activeVocabs.length < 4 && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <AlertCircle size={20} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold">Lưu ý:</span> Số lượng từ vựng hiện tại đang ít hơn 4 từ.
                Để các câu hỏi trắc nghiệm có đủ 4 phương án gây nhiễu tốt nhất, bạn nên có từ 4 từ
                vựng trở lên.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
              <AlertCircle size={18} />
              {errorMsg}
            </div>
          )}

          {/* Title & Duration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">
                Tên bài kiểm tra
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Kiểm tra giữa kỳ / cuối kỳ"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none font-medium text-gray-800 transition-all text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Number of Questions */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Số lượng câu hỏi
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={numQuestions}
                    onChange={(e) => handleTotalQuestionsChange(Number(e.target.value))}
                    className="w-20 px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none font-bold text-center text-gray-800 text-sm"
                  />
                  <span className="text-sm font-medium text-gray-500">câu</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {quickQuestionCounts.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleTotalQuestionsChange(count)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        numQuestions === count
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {count} câu
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Clock size={16} className="text-gray-400" /> Thời gian làm bài
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-20 px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:outline-none font-bold text-center text-gray-800 text-sm"
                  />
                  <span className="text-sm font-medium text-gray-500">phút</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {quickDurations.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        duration === d
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {d} phút
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Question Types Selection */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <Layers size={16} className="text-indigo-600" /> Các dạng bài cần sinh
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetToAuto}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                  title="Tự động phân chia số câu ưu tiên số chẵn & cơ số 10 từ trên xuống"
                >
                  <RefreshCw size={12} /> Tự động phân chia
                </button>
                <span className="text-xs text-gray-400 font-medium">
                  Đã chọn {selectedTypes.length}/{QUESTION_TYPE_OPTIONS.length} dạng
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {QUESTION_TYPE_OPTIONS.map((item) => {
                const isChecked = selectedTypes.includes(item.id)
                const count = typeCounts[item.id] || 0
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleType(item.id)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isChecked
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-bold ${
                            isChecked ? 'text-indigo-950' : 'text-gray-800'
                          }`}
                        >
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    {/* Quantity control per section if checked */}
                    {isChecked && (
                      <div
                        className="flex items-center gap-1.5 shrink-0 bg-white px-2 py-1 rounded-xl border border-indigo-200 shadow-2xs self-end sm:self-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleUpdateTypeCount(item.id, count - 2)}
                          disabled={count <= 2}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-indigo-100 disabled:opacity-30 disabled:hover:bg-gray-100 text-gray-700 hover:text-indigo-700 flex items-center justify-center font-bold text-sm transition-colors"
                          title="Giảm 2 câu (ưu tiên số chẵn)"
                        >
                          <Minus size={13} />
                        </button>
                        <div className="flex items-center gap-1 px-1">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={count}
                            onChange={(e) => handleUpdateTypeCount(item.id, Number(e.target.value))}
                            className="w-9 text-center font-bold text-indigo-900 text-sm focus:outline-none bg-transparent"
                          />
                          <span className="text-xs font-semibold text-gray-400">câu</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpdateTypeCount(item.id, count + 2)}
                          className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 flex items-center justify-center font-bold text-sm transition-colors"
                          title="Tăng 2 câu (ưu tiên số chẵn)"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors text-sm"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={activeVocabs.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-sm disabled:opacity-50 hover:shadow-indigo-200 hover:-translate-y-0.5"
          >
            <Sparkles size={18} className="text-amber-300" />
            Sinh Đề Thi Ngay
          </button>
        </div>
      </div>
    </div>
  )
}
