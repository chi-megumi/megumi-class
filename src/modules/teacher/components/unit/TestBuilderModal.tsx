import React, { useState } from 'react'
import { X, GripVertical, Plus, Type, CheckSquare, AlignLeft, ListOrdered, Headphones, Trash2, Sparkles, ArrowRightLeft } from 'lucide-react'
import { ExamData, TestBlock, TestQuestion, VocabItemData } from '../../types'
import ExamGeneratorModal from './ExamGeneratorModal'
import { GeneratedExamResult } from '../../utils/examGenerator'

type TemplateType = 'multiple_choice' | 'fill_blank' | 'reading' | 'matching' | 'reorder' | 'listening'

const TEMPLATES = [
  { type: 'multiple_choice', title: 'Trắc nghiệm (Multiple Choice)', icon: CheckSquare, desc: 'Chọn 1 đáp án đúng A, B, C, D' },
  { type: 'fill_blank', title: 'Điền khuyết (Fill in the Blanks)', icon: Type, desc: 'Tự gõ đáp án (Không phân biệt hoa thường)' },
  { type: 'reading', title: 'Đọc hiểu (Reading Comprehension)', icon: AlignLeft, desc: 'Đoạn văn kèm câu hỏi T/F hoặc chọn đáp án' },
  { type: 'matching', title: 'Ghép nối (Matching)', icon: GripVertical, desc: 'Nối cột A với cột B' },
  { type: 'reorder', title: 'Sắp xếp câu (Sentence Reordering)', icon: ListOrdered, desc: 'Sắp xếp các từ bị xáo trộn thành câu hoàn chỉnh' },
  { type: 'listening', title: 'Nghe hiểu (Listening)', icon: Headphones, desc: 'File Audio nghe và trả lời câu hỏi' },
]

export default function TestBuilderModal({ 
  unitId, 
  classId,
  isClassExam,
  editingTestId, 
  existingTests,
  vocabItems,
  unitTitle,
  initialExam,
  onClose,
  onSaveSuccess
}: { 
  unitId?: string, 
  classId?: string,
  isClassExam?: boolean,
  editingTestId: string,
  existingTests: ExamData[],
  vocabItems?: VocabItemData[],
  unitTitle?: string,
  initialExam?: GeneratedExamResult,
  onClose: () => void,
  onSaveSuccess?: (newTests: ExamData[]) => void
}) {
  const [isPreview, setIsPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null)
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null)
  
  const existingTest = existingTests.find((t) => t.id === editingTestId)
  const [testTitle, setTestTitle] = useState(initialExam?.title || existingTest?.title || 'Bài kiểm tra mới')
  const [testDuration, setTestDuration] = useState(initialExam?.duration || existingTest?.duration || 45)
  
  const [blocks, setBlocks] = useState<TestBlock[]>(
    initialExam?.blocks || existingTest?.content || [
      { 
        id: 'b1', 
        type: 'multiple_choice', 
        title: 'Part 1: Choose the correct answer', 
        content: {
          questions: [
            { id: 'q1', text: '', options: ['', '', '', ''], correctIndex: 0 }
          ]
        } 
      }
    ]
  )

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      let newTests = [...existingTests]
      const currentTest: ExamData = {
        id: existingTest?.id || 'temp-' + crypto.randomUUID(),
        title: testTitle,
        duration: Number(testDuration),
        isEnabled: existingTest?.isEnabled ?? false,
        isPublished: existingTest?.isPublished ?? false,
        content: blocks,
        classId: classId || null,
        unitId: isClassExam ? null : (unitId || null)
      }
      
      if (editingTestId === 'new') {
        newTests.unshift(currentTest)
      } else {
        newTests = newTests.map(t => t.id === editingTestId ? currentTest : t)
      }
      
      let res: { success: boolean; exams?: any[] }
      if (isClassExam && classId) {
        const { updateClassExams } = await import('~/actions/class')
        res = await updateClassExams(classId, newTests)
      } else if (unitId) {
        const { updateUnitExams } = await import('~/actions/class')
        res = await updateUnitExams(unitId, newTests)
      } else {
        throw new Error('Thiếu thông tin unitId hoặc classId')
      }

      if (res.success && res.exams) {
        if (onSaveSuccess) onSaveSuccess(res.exams as unknown as ExamData[])
      } else {
        if (onSaveSuccess) onSaveSuccess(newTests)
      }
      onClose()
    } catch (e) {
      console.error(e)
      alert('Lỗi lưu đề thi')
    } finally {
      setIsSaving(false)
    }
  }

  const addBlock = (type: TemplateType, title: string) => {
    let content = {}
    if (type === 'multiple_choice') {
      content = { questions: [{ id: crypto.randomUUID(), text: '', options: ['', '', '', ''], correctIndex: 0 }] }
    } else if (type === 'fill_blank') {
      content = { questions: [{ id: crypto.randomUUID(), text: '', answer: '' }] }
    } else if (type === 'matching') {
      content = {
        pairs: [
          { id: crypto.randomUUID(), left: '', right: '' },
          { id: crypto.randomUUID(), left: '', right: '' },
          { id: crypto.randomUUID(), left: '', right: '' },
        ]
      }
    } else if (type === 'reorder') {
      content = {
        questions: [
          { id: crypto.randomUUID(), text: '', sentence: '' }
        ]
      }
    }
    setBlocks([...blocks, { id: crypto.randomUUID(), type, title, content }])
  }

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id))
  }

  // --- DRAG AND DROP ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragItemIndex(index)
    // Make the drag transparent
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      // Set some ghost image or just let default
    }
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverItemIndex(index)
  }

  const handleDragEnd = () => {
    if (dragItemIndex !== null && dragOverItemIndex !== null && dragItemIndex !== dragOverItemIndex) {
      const newBlocks = [...blocks]
      const draggedItem = newBlocks.splice(dragItemIndex, 1)[0]
      newBlocks.splice(dragOverItemIndex, 0, draggedItem)
      setBlocks(newBlocks)
    }
    setDragItemIndex(null)
    setDragOverItemIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessary to allow dropping
  }
  
  const addQuestionToBlock = (blockId: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        if (b.type === 'multiple_choice') {
          return {
            ...b,
            content: {
              ...b.content,
              questions: [...(b.content?.questions || []), { id: crypto.randomUUID(), text: '', options: ['', '', '', ''], correctIndex: 0 }]
            }
          }
        } else if (b.type === 'fill_blank') {
          const currentQs = (b.content?.questions && b.content.questions.length > 0)
            ? b.content.questions
            : (b.content?.text ? [{ id: b.id, text: b.content.text, answer: b.content.answer || '' }] : [])
          return {
            ...b,
            content: {
              ...b.content,
              questions: [...currentQs, { id: crypto.randomUUID(), text: '', answer: '' }]
            }
          }
        } else if (b.type === 'matching') {
          const currentPairs = b.content?.pairs || []
          return {
            ...b,
            content: {
              ...b.content,
              pairs: [...currentPairs, { id: crypto.randomUUID(), left: '', right: '' }]
            }
          }
        } else if (b.type === 'reorder') {
          const currentQs = b.content?.questions || []
          return {
            ...b,
            content: {
              ...b.content,
              questions: [...currentQs, { id: crypto.randomUUID(), text: '', sentence: '' }]
            }
          }
        }
      }
      return b
    }))
  }

  const updateBlockContent = (blockId: string, newContent: TestBlock['content']) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, content: newContent } : b))
  }

  const getEstimatedTime = () => {
    let mins = 0
    blocks.forEach(b => {
      if (b.type === 'multiple_choice') mins += (b.content?.questions?.length || 0) * 1.5
      else if (b.type === 'fill_blank') mins += ((b.content?.questions?.length || (b.content?.text ? 1 : 0))) * 2
      else if (b.type === 'matching') mins += (b.content?.pairs?.length || 0) * 0.8
      else if (b.type === 'reorder') mins += (b.content?.questions?.length || 0) * 2
      else mins += 2
    })
    return Math.ceil(mins)
  }

  const estimatedMins = getEstimatedTime()
  const durationNum = Number(testDuration)
  const isMiniChallenge = durationNum <= 15
  
  let timeWarning = null
  if (estimatedMins > durationNum * 1.3) {
    timeWarning = '⚠️ Nội dung hơi dài so với thời gian thi, học sinh có thể không làm kịp.'
  } else if (durationNum >= 45 && estimatedMins < durationNum * 0.4) {
    timeWarning = '⚠️ Thời gian thi khá dài nhưng nội dung lại quá ngắn.'
  }

  return (
    <div className="fixed inset-0 z-[70] flex bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full h-full bg-[#f8f9fa] flex flex-col md:flex-row">
        
        {/* SIDEBAR: TEMPLATES (Hidden in Preview) */}
        {!isPreview && (
          <div className="w-full md:w-80 bg-white border-r border-gray-200 h-full flex flex-col shrink-0 shadow-lg z-10 transition-all">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Kho Template</h2>
                <p className="text-sm text-gray-500 mt-1">Từ lớp 3 đến lớp 12</p>
              </div>
              <button onClick={onClose} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-3">
              {TEMPLATES.map((tpl) => (
                <div 
                  key={tpl.type}
                  onClick={() => addBlock(tpl.type as TemplateType, tpl.title)}
                  className="group relative bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={18} />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <tpl.icon size={20} />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{tpl.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAIN CANVAS: TEST BUILDER */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
          {/* Header */}
          <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="hidden md:flex p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
              <input 
                type="text" 
                value={testTitle} 
                onChange={(e) => setTestTitle(e.target.value)} 
                className="text-lg font-bold text-gray-800 bg-white border border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none px-3 py-1.5 rounded-lg w-72 transition-all shadow-sm"
                placeholder="Nhập tên bài kiểm tra..."
              />
              <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <span className="text-sm font-medium">Thời gian:</span>
                <input 
                  type="number" 
                  value={testDuration} 
                  onChange={(e) => setTestDuration(Number(e.target.value))} 
                  className="w-12 bg-transparent font-bold text-gray-800 focus:outline-none text-center"
                />
                <span className="text-sm font-medium">phút</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {vocabItems && vocabItems.length > 0 && !isPreview && (
                <button
                  type="button"
                  onClick={() => setIsGeneratorOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 text-sm hover:-translate-y-0.5"
                >
                  <Sparkles size={16} className="text-amber-300" />
                  Sinh Đề Từ Vựng
                </button>
              )}
              <button 
                onClick={() => setIsPreview(!isPreview)}
                className="px-5 py-2 text-indigo-600 font-semibold bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors text-sm"
              >
                {isPreview ? 'Quay lại chỉnh sửa' : 'Xem thử (Preview)'}
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 text-sm"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu Đề Thi'}
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6 pb-32">
              
              {/* Time Warning */}
              {timeWarning && (
                <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl shadow-sm text-sm font-semibold flex items-center gap-2">
                  <span className="text-xl">⏱️</span> {timeWarning} (Ước tính cần {estimatedMins} phút)
                </div>
              )}

              {/* Paper Header */}
              {durationNum <= 15 ? (
                <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl shadow-lg border-4 border-white p-8 text-center relative overflow-hidden transform rotate-1">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                  <h1 className="text-3xl font-black text-white uppercase tracking-wide mb-2 drop-shadow-md">🚀 {testTitle}</h1>
                  <p className="text-white/90 font-bold bg-black/20 inline-block px-4 py-1 rounded-full text-sm">
                    ⚡ Thử thách chớp nhoáng: {testDuration} phút
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-t-2xl rounded-b-lg shadow-sm border border-gray-200 p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
                  <h1 className="text-3xl font-black text-gray-900 uppercase tracking-wide mb-2">{testTitle}</h1>
                  <p className="text-gray-500 font-medium">Thời gian làm bài: {testDuration} phút | Không sử dụng tài liệu</p>
                </div>
              )}

              {/* Blocks */}
              {blocks.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50/50">
                  <p className="text-gray-500 font-medium text-lg">Chưa có phần nào trong đề thi.</p>
                  <p className="text-gray-400 text-sm mt-2">Hãy click vào các Template bên trái để thêm vào bài kiểm tra.</p>
                </div>
              ) : (
                blocks.map((block, index) => {
                  if (isPreview) {
                    return (
                      <div key={block.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                        <div className="bg-indigo-50/50 px-6 py-4 border-b border-gray-100">
                          <h2 className="text-lg font-bold text-indigo-900">Phần {index + 1}: {block.title}</h2>
                        </div>
                        <div className="p-6">
                          {block.type === 'multiple_choice' && (
                            <div className={`grid gap-8 ${(block.content?.questions?.length ?? 0) > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                              {block.content?.questions?.map((q: TestQuestion, qIndex: number) => (
                                <div key={q.id} className="flex gap-4 items-start">
                                  <span className="font-bold text-lg text-indigo-600 shrink-0">{qIndex + 1}.</span>
                                  <div className="flex-1 space-y-4">
                                    <p className="text-lg font-medium text-gray-800">{q.text || '...'}</p>
                                    <div className="grid grid-cols-1 gap-3">
                                      {['A', 'B', 'C', 'D'].map((opt, oIdx) => (
                                        <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-colors">
                                          <input type="radio" name={`preview-${q.id}`} className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" />
                                          <span className="font-bold text-gray-500 w-5">{opt}.</span>
                                          <span className="text-gray-700">{q.options?.[oIdx] || '...'}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {block.type === 'fill_blank' && (
                            <div className="space-y-6">
                              {((block.content?.questions && block.content.questions.length > 0)
                                ? block.content.questions
                                : (block.content?.text ? [{ id: block.id, text: block.content.text, answer: block.content.answer || '' }] : [])
                              ).map((q: TestQuestion, qIdx: number) => (
                                <div key={q.id} className="flex gap-4 items-start">
                                  <span className="font-bold text-lg text-indigo-600 shrink-0">{qIdx + 1}.</span>
                                  <div className="flex-1 space-y-3">
                                    <p className="text-lg font-medium text-gray-800 leading-relaxed">
                                      {(q.text || '...').split('___').map((part: string, i: number, arr: string[]) => (
                                        <React.Fragment key={i}>
                                          {part}
                                          {i < arr.length - 1 && (
                                            <input type="text" className="mx-2 w-32 border-b-2 border-indigo-200 focus:border-indigo-500 bg-transparent text-center font-bold text-indigo-600 focus:outline-none transition-colors" />
                                          )}
                                        </React.Fragment>
                                      ))}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {block.type === 'matching' && (
                            <div className="space-y-4">
                              <p className="text-sm text-gray-500 font-medium">Học sinh sẽ ghép nối từng mục ở Cột A với đáp án tương ứng ở Cột B:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-gray-50/70 border border-gray-200">
                                <div className="space-y-2.5">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                                    <span>Cột A (Từ / Khái niệm)</span>
                                  </h4>
                                  {(block.content?.pairs || []).map((p, pIdx) => (
                                    <div key={p.id} className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                                      <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0">
                                        {pIdx + 1}
                                      </span>
                                      <span className="font-medium text-gray-800">{p.left || `(Mục ${pIdx + 1})`}</span>
                                    </div>
                                  ))}
                                </div>
                                <div className="space-y-2.5">
                                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                                    <span>Cột B (Nghĩa / Định nghĩa)</span>
                                  </h4>
                                  {(block.content?.pairs || []).map((p, pIdx) => (
                                    <div key={p.id} className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                                      <span className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 font-bold text-xs flex items-center justify-center shrink-0">
                                        {String.fromCharCode(65 + pIdx)}
                                      </span>
                                      <span className="font-medium text-gray-700">{p.right || `(Nghĩa ${pIdx + 1})`}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {block.type === 'reorder' && (
                            <div className="space-y-6">
                              {(block.content?.questions || []).map((q, qIdx) => {
                                const words = (q.sentence || '').trim().split(/\s+/).filter(Boolean)
                                return (
                                  <div key={q.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-3">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-indigo-600 text-sm">Câu {qIdx + 1}:</span>
                                      <span className="text-gray-700 font-medium">{q.text || 'Sắp xếp các từ sau thành câu hoàn chỉnh:'}</span>
                                    </div>
                                    <div className="p-4 bg-white rounded-xl border border-dashed border-gray-300 min-h-[50px] flex items-center text-gray-400 text-sm italic">
                                      (Vị trí học sinh ghép câu...)
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                      {words.length > 0 ? (
                                        words.map((w, wIdx) => (
                                          <span key={wIdx} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-semibold border border-indigo-100 shadow-2xs">
                                            {w}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-xs text-gray-400 italic">Chưa nhập câu</span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                          
                          {['reading', 'listening'].includes(block.type) && (
                            <p className="text-gray-400 italic">Dạng bài này sẽ được hiển thị khi học sinh làm bài.</p>
                          )}
                        </div>
                      </div>
                    )
                  }

                  return (
                  <div 
                    key={block.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnter={(e) => handleDragEnter(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    className={`bg-white rounded-2xl shadow-sm border ${
                      dragOverItemIndex === index ? 'border-indigo-500 border-t-4' : (isMiniChallenge ? 'border-orange-200 shadow-orange-100/50' : 'border-gray-200')
                    } overflow-hidden group transition-all ${isMiniChallenge ? 'hover:scale-[1.01]' : ''}`}
                  >
                    {/* Block Toolbar */}
                    <div className={`${isMiniChallenge ? 'bg-orange-50/50 border-orange-100' : 'bg-gray-50 border-gray-100'} border-b px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing`}>
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical size={18} className={`${isMiniChallenge ? 'text-orange-300' : 'text-gray-400'} shrink-0`} />
                        <span className={`font-bold shrink-0 ${isMiniChallenge ? 'text-orange-600' : 'text-gray-700'}`}>Phần {index + 1}:</span>
                        <input
                          type="text"
                          value={block.title}
                          onChange={(e) => {
                            const newBlocks = [...blocks];
                            newBlocks[index].title = e.target.value;
                            setBlocks(newBlocks);
                          }}
                          className={`font-bold bg-transparent border-b border-transparent focus:outline-none flex-1 py-1 px-2 transition-colors cursor-text ${
                            isMiniChallenge ? 'text-orange-700 focus:border-orange-400' : 'text-gray-700 focus:border-indigo-400'
                          }`}
                          onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking input
                        />
                      </div>
                      <button 
                        onClick={() => removeBlock(block.id)}
                        className={`p-1.5 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-4 ${
                          isMiniChallenge ? 'text-orange-300' : 'text-gray-400'
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Block Content Editor */}
                    <div className="p-6">
                      {block.type === 'multiple_choice' && (
                        <div className="space-y-6">
                          <div className={`grid gap-6 ${isMiniChallenge || (block.content?.questions?.length ?? 0) > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                            {block.content?.questions?.map((q: TestQuestion, qIndex: number) => (
                              <div key={q.id} className={`flex gap-4 items-start p-4 rounded-xl border relative group/q ${
                                isMiniChallenge 
                                  ? 'bg-gradient-to-br from-orange-50/30 to-pink-50/30 border-orange-100 shadow-sm hover:shadow-md transition-shadow' 
                                  : 'bg-gray-50/50 border-gray-100'
                              }`}>
                                <div className={`font-bold text-lg mt-2 flex items-center justify-center shrink-0 ${
                                  isMiniChallenge 
                                    ? 'w-10 h-10 rounded-full bg-orange-100 text-orange-600 shadow-sm border border-orange-200' 
                                    : 'text-indigo-600'
                                }`}>
                                  {qIndex + 1}{!isMiniChallenge && '.'}
                                </div>
                                <div className="flex-1 space-y-4">
                                  <input 
                                    type="text" 
                                    value={q.text}
                                    onChange={(e) => {
                                      const newQs = [...(block.content?.questions || [])]
                                      newQs[qIndex].text = e.target.value
                                      updateBlockContent(block.id, { ...block.content, questions: newQs })
                                    }}
                                    placeholder="Nhập câu hỏi (VD: What ___ your name?)" 
                                    className={`w-full text-lg font-medium border-b-2 focus:outline-none pb-2 bg-transparent transition-colors ${
                                      isMiniChallenge ? 'text-orange-900 border-orange-100 focus:border-orange-400 placeholder:text-orange-300' : 'text-gray-800 border-gray-100 focus:border-indigo-400'
                                    }`} 
                                  />
                                  <div className="grid grid-cols-1 gap-3">
                                    {['A', 'B', 'C', 'D'].map((opt, oIdx) => (
                                      <div key={opt} className={`flex items-center gap-3 bg-white rounded-xl p-2.5 border focus-within:shadow-sm transition-all ${
                                        q.correctIndex === oIdx 
                                          ? (isMiniChallenge ? 'border-orange-400 bg-orange-50' : 'border-green-300 bg-green-50/30')
                                          : (isMiniChallenge ? 'border-orange-100 hover:border-orange-300 focus-within:border-orange-400' : 'border-gray-100 focus-within:border-indigo-300')
                                      }`}>
                                        <input 
                                          type="radio" 
                                          name={`correct-${q.id}`}
                                          checked={q.correctIndex === oIdx}
                                          onChange={() => {
                                            const newQs = [...(block.content?.questions || [])]
                                            newQs[qIndex].correctIndex = oIdx
                                            updateBlockContent(block.id, { ...block.content, questions: newQs })
                                          }}
                                          className={`w-5 h-5 ${isMiniChallenge ? 'text-orange-500 focus:ring-orange-500' : 'text-indigo-600 focus:ring-indigo-500'}`} 
                                        />
                                        <span className={`font-bold w-5 ${isMiniChallenge ? 'text-orange-400' : 'text-gray-500'}`}>{opt}.</span>
                                        <input 
                                          type="text" 
                                          value={q.options?.[oIdx] || ''}
                                          onChange={(e) => {
                                            const newQs = [...(block.content?.questions || [])]
                                            if (newQs[qIndex].options) newQs[qIndex].options[oIdx] = e.target.value
                                            updateBlockContent(block.id, { ...block.content, questions: newQs })
                                          }}
                                          placeholder={`Lựa chọn ${opt}`} 
                                          className={`flex-1 bg-transparent focus:outline-none ${isMiniChallenge ? 'text-orange-800' : 'text-gray-700'}`} 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                {(block.content?.questions?.length ?? 0) > 1 && (
                                  <button 
                                    className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/q:opacity-100"
                                    onClick={() => {
                                      const newQuestions = [...(block.content?.questions || [])];
                                      newQuestions.splice(qIndex, 1);
                                      updateBlockContent(block.id, { ...block.content, questions: newQuestions });
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-center pt-2">
                            <button 
                              onClick={() => addQuestionToBlock(block.id)}
                              className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors border border-dashed ${
                                isMiniChallenge 
                                  ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 shadow-sm'
                                  : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
                              }`}
                            >
                              <Plus size={18} /> Thêm câu hỏi
                            </button>
                          </div>
                        </div>
                      )}

                      {block.type === 'fill_blank' && (() => {
                        const questions = (block.content?.questions && block.content.questions.length > 0)
                          ? block.content.questions
                          : [{ id: block.id, text: block.content?.text || '', answer: block.content?.answer || '' }]

                        return (
                          <div className="space-y-6">
                            <div className="space-y-6">
                              {questions.map((q: TestQuestion, qIndex: number) => (
                                <div key={q.id} className={`flex gap-4 items-start p-5 rounded-2xl border relative group/q ${
                                  isMiniChallenge 
                                    ? 'bg-gradient-to-br from-orange-50/30 to-pink-50/30 border-orange-100 shadow-sm hover:shadow-md transition-shadow' 
                                    : 'bg-gray-50/50 border-gray-100 shadow-sm hover:border-gray-200 transition-all'
                                }`}>
                                  <div className={`font-bold text-lg mt-2 flex items-center justify-center shrink-0 ${
                                    isMiniChallenge 
                                      ? 'w-10 h-10 rounded-full bg-orange-100 text-orange-600 shadow-sm border border-orange-200' 
                                      : 'w-8 h-8 rounded-full bg-indigo-50 text-indigo-600'
                                  }`}>
                                    {qIndex + 1}
                                  </div>
                                  <div className="flex-1 space-y-3">
                                    <div className={`p-4 border rounded-xl ${isMiniChallenge ? 'bg-white border-orange-200 shadow-inner' : 'bg-white border-gray-200 shadow-sm'}`}>
                                      <p className={`text-xs font-semibold mb-2 ${isMiniChallenge ? 'text-orange-500' : 'text-gray-500'}`}>
                                        Gõ câu hỏi, dùng dấu <code className={`${isMiniChallenge ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'} px-1.5 py-0.5 rounded font-bold`}>___</code> để tạo ô trống
                                      </p>
                                      <textarea 
                                        rows={2} 
                                        value={q.text || ''}
                                        onChange={(e) => {
                                          const newQs = [...questions]
                                          newQs[qIndex] = { ...newQs[qIndex], text: e.target.value }
                                          updateBlockContent(block.id, { ...block.content, questions: newQs })
                                        }}
                                        placeholder="VD: Could you bring me an extra ___? (Bạn có thể mang cho tôi thêm một chiếc chăn không?)" 
                                        className={`w-full text-base font-medium bg-transparent resize-none focus:outline-none ${isMiniChallenge ? 'text-orange-900 placeholder:text-orange-300' : 'text-gray-800'}`} 
                                      />
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={`text-sm font-bold ${isMiniChallenge ? 'text-orange-600' : 'text-gray-600'}`}>Đáp án đúng:</span>
                                      <input 
                                        type="text" 
                                        value={q.answer || ''}
                                        onChange={(e) => {
                                          const newQs = [...questions]
                                          newQs[qIndex] = { ...newQs[qIndex], answer: e.target.value }
                                          updateBlockContent(block.id, { ...block.content, questions: newQs })
                                        }}
                                        placeholder="VD: blanket" 
                                        className={`flex-1 font-bold px-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 ${
                                          isMiniChallenge 
                                            ? 'bg-orange-100 border border-orange-300 text-orange-800 focus:ring-orange-500/30'
                                            : 'bg-green-50 border border-green-200 text-green-700 focus:ring-green-500/20'
                                        }`} 
                                      />
                                    </div>
                                    <p className={`text-[11px] italic ${isMiniChallenge ? 'text-orange-400' : 'text-gray-400'}`}>* Hệ thống chấm điểm tự động không phân biệt chữ hoa/chữ thường.</p>
                                  </div>

                                  {questions.length > 1 && (
                                    <button 
                                      className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/q:opacity-100"
                                      onClick={() => {
                                        const newQuestions = [...questions]
                                        newQuestions.splice(qIndex, 1)
                                        updateBlockContent(block.id, { ...block.content, questions: newQuestions })
                                      }}
                                      title="Xóa câu hỏi này"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-center pt-2">
                              <button 
                                onClick={() => addQuestionToBlock(block.id)}
                                className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors border border-dashed ${
                                  isMiniChallenge 
                                    ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 shadow-sm'
                                    : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
                                }`}
                              >
                                <Plus size={18} /> Thêm câu hỏi điền khuyết
                              </button>
                            </div>
                          </div>
                        )
                      })()}

                      {block.type === 'matching' && (() => {
                        const pairs = block.content?.pairs || []
                        return (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-2">
                              <span>Nhập các cặp từ/khái niệm tương ứng. Hệ thống sẽ tự động xáo trộn Cột B khi học sinh làm bài.</span>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const flipped = pairs.map((p) => ({
                                      ...p,
                                      left: p.right || '',
                                      right: p.left || '',
                                    }))
                                    updateBlockContent(block.id, { ...block.content, pairs: flipped })
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-1 transition-colors"
                                  title="Đổi chiều toàn bộ các cặp: Cột A ⇄ Cột B"
                                >
                                  <ArrowRightLeft size={13} /> Đổi chiều tất cả
                                </button>
                                <span className="font-bold text-indigo-600">{pairs.length} cặp</span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              {pairs.map((p, pIndex) => (
                                <div 
                                  key={p.id}
                                  className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-2xl border relative group/p transition-all ${
                                    isMiniChallenge 
                                      ? 'bg-gradient-to-br from-orange-50/20 to-pink-50/20 border-orange-100 shadow-sm' 
                                      : 'bg-gray-50/60 border-gray-100 shadow-sm hover:border-gray-200'
                                  }`}
                                >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 self-start sm:self-center ${
                                    isMiniChallenge ? 'bg-orange-100 text-orange-700' : 'bg-indigo-50 text-indigo-600'
                                  }`}>
                                    {pIndex + 1}
                                  </div>

                                  {/* Left Item */}
                                  <div className="flex-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">
                                      Cột A (Từ / Khái niệm)
                                    </label>
                                    <input
                                      type="text"
                                      value={p.left || ''}
                                      onChange={(e) => {
                                        const newPairs = [...pairs]
                                        newPairs[pIndex] = { ...newPairs[pIndex], left: e.target.value }
                                        updateBlockContent(block.id, { ...block.content, pairs: newPairs })
                                      }}
                                      placeholder="VD: magnificent"
                                      className={`w-full font-bold px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 ${
                                        isMiniChallenge 
                                          ? 'border-orange-200 text-orange-950 focus:ring-orange-400/30' 
                                          : 'border-gray-200 text-gray-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                                      }`}
                                    />
                                  </div>

                                  {/* Center Swap Button */}
                                  <div className="flex items-center justify-center shrink-0 self-center sm:self-center pt-1 sm:pt-4">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newPairs = [...pairs]
                                        const cur = newPairs[pIndex]
                                        newPairs[pIndex] = {
                                          ...cur,
                                          left: cur.right || '',
                                          right: cur.left || '',
                                        }
                                        updateBlockContent(block.id, { ...block.content, pairs: newPairs })
                                      }}
                                      className={`p-2 rounded-xl border transition-all hover:scale-110 active:scale-95 cursor-pointer shadow-2xs ${
                                        isMiniChallenge
                                          ? 'text-orange-500 bg-orange-50/80 hover:bg-orange-100 border-orange-200 hover:border-orange-300'
                                          : 'text-indigo-500 bg-indigo-50/80 hover:bg-indigo-100 border-indigo-200 hover:border-indigo-300'
                                      }`}
                                      title="Hoán đổi Cột A ⇄ Cột B của cặp này"
                                    >
                                      <ArrowRightLeft size={16} />
                                    </button>
                                  </div>

                                  {/* Right Item */}
                                  <div className="flex-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 block">
                                      Cột B (Nghĩa / Định nghĩa)
                                    </label>
                                    <input
                                      type="text"
                                      value={p.right || ''}
                                      onChange={(e) => {
                                        const newPairs = [...pairs]
                                        newPairs[pIndex] = { ...newPairs[pIndex], right: e.target.value }
                                        updateBlockContent(block.id, { ...block.content, pairs: newPairs })
                                      }}
                                      placeholder="VD: tráng lệ, nguy nga"
                                      className={`w-full font-medium px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 ${
                                        isMiniChallenge 
                                          ? 'border-orange-200 text-orange-950 focus:ring-orange-400/30' 
                                          : 'border-gray-200 text-gray-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                                      }`}
                                    />
                                  </div>

                                  {/* Delete button */}
                                  {pairs.length > 2 && (
                                    <button
                                      className="self-end sm:self-center p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/p:opacity-100"
                                      onClick={() => {
                                        const newPairs = [...pairs]
                                        newPairs.splice(pIndex, 1)
                                        updateBlockContent(block.id, { ...block.content, pairs: newPairs })
                                      }}
                                      title="Xóa cặp này"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-center pt-2">
                              <button
                                onClick={() => addQuestionToBlock(block.id)}
                                className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors border border-dashed ${
                                  isMiniChallenge 
                                    ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 shadow-sm'
                                    : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
                                }`}
                              >
                                <Plus size={18} /> Thêm cặp ghép nối
                              </button>
                            </div>
                          </div>
                        )
                      })()}

                      {block.type === 'reorder' && (() => {
                        const questions = block.content?.questions || []
                        return (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-2">
                              <span>Gõ câu tiếng Anh hoàn chỉnh. Hệ thống sẽ tự động tách các từ và xáo trộn vị trí khi học sinh làm bài.</span>
                              <span className="font-bold text-indigo-600">{questions.length} câu</span>
                            </div>

                            <div className="space-y-6">
                              {questions.map((q, qIndex) => {
                                const words = (q.sentence || '').trim().split(/\s+/).filter(Boolean)
                                return (
                                  <div 
                                    key={q.id}
                                    className={`flex gap-4 items-start p-5 rounded-2xl border relative group/q transition-all ${
                                      isMiniChallenge 
                                        ? 'bg-gradient-to-br from-orange-50/20 to-pink-50/20 border-orange-100 shadow-sm' 
                                        : 'bg-gray-50/60 border-gray-100 shadow-sm hover:border-gray-200'
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-2 ${
                                      isMiniChallenge ? 'bg-orange-100 text-orange-700' : 'bg-indigo-50 text-indigo-600'
                                    }`}>
                                      {qIndex + 1}
                                    </div>

                                    <div className="flex-1 space-y-4">
                                      {/* Prompt / Vietnamese meaning */}
                                      <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">
                                          Gợi ý / Nghĩa tiếng Việt (Tùy chọn)
                                        </label>
                                        <input
                                          type="text"
                                          value={q.text || ''}
                                          onChange={(e) => {
                                            const newQs = [...questions]
                                            newQs[qIndex] = { ...newQs[qIndex], text: e.target.value }
                                            updateBlockContent(block.id, { ...block.content, questions: newQs })
                                          }}
                                          placeholder="VD: Dịch sang tiếng Anh: Anh ấy quyết định từ bỏ chiếc xe cũ."
                                          className={`w-full font-medium px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 ${
                                            isMiniChallenge 
                                              ? 'border-orange-200 text-orange-950 focus:ring-orange-400/30' 
                                              : 'border-gray-200 text-gray-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                                          }`}
                                        />
                                      </div>

                                      {/* English Full Sentence */}
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="text-xs font-bold text-gray-700">
                                            Câu tiếng Anh hoàn chỉnh (Học sinh cần sắp xếp thành câu này) *
                                          </label>
                                          <span className="text-[11px] text-gray-400">
                                            {words.length} từ
                                          </span>
                                        </div>
                                        <textarea
                                          rows={2}
                                          value={q.sentence || ''}
                                          onChange={(e) => {
                                            const newQs = [...questions]
                                            newQs[qIndex] = { ...newQs[qIndex], sentence: e.target.value }
                                            updateBlockContent(block.id, { ...block.content, questions: newQs })
                                          }}
                                          placeholder="VD: He decided to abandon the old car."
                                          className={`w-full font-bold px-3.5 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 resize-none ${
                                            isMiniChallenge 
                                              ? 'border-orange-200 text-orange-950 focus:ring-orange-400/30' 
                                              : 'border-gray-200 text-gray-800 focus:ring-indigo-500/20 focus:border-indigo-500'
                                          }`}
                                        />
                                      </div>

                                      {/* Live chips preview */}
                                      {words.length > 0 && (
                                        <div className="p-3 bg-white/80 rounded-xl border border-gray-200/80">
                                          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-500">
                                            <Sparkles size={14} className="text-amber-500" />
                                            <span>Xem trước các thẻ từ (Word Chips) học sinh sẽ nhận:</span>
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                            {words.map((w, wIdx) => (
                                              <span 
                                                key={wIdx} 
                                                className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 shadow-2xs"
                                              >
                                                {w}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Delete button */}
                                    {questions.length > 1 && (
                                      <button
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover/q:opacity-100 mt-2"
                                        onClick={() => {
                                          const newQs = [...questions]
                                          newQs.splice(qIndex, 1)
                                          updateBlockContent(block.id, { ...block.content, questions: newQs })
                                        }}
                                        title="Xóa câu này"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    )}
                                  </div>
                                )
                              })}
                            </div>

                            <div className="flex justify-center pt-2">
                              <button
                                onClick={() => addQuestionToBlock(block.id)}
                                className={`flex items-center gap-2 font-semibold px-5 py-2.5 rounded-xl transition-colors border border-dashed ${
                                  isMiniChallenge 
                                    ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200 shadow-sm'
                                    : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100'
                                }`}
                              >
                                <Plus size={18} /> Thêm câu sắp xếp
                              </button>
                            </div>
                          </div>
                        )
                      })()}

                      {/* Add placeholders for other types as needed */}
                      {['reading', 'listening'].includes(block.type) && (
                        <div className="h-32 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50">
                          UI đang được hoàn thiện cho dạng bài này...
                        </div>
                      )}
                    </div>
                  </div>
                )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Generator */}
      {isGeneratorOpen && vocabItems && (
        <ExamGeneratorModal
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
          vocabItems={vocabItems}
          unitTitle={unitTitle}
          onGenerated={(generated) => {
            setTestTitle(generated.title)
            setTestDuration(generated.duration)
            setBlocks(generated.blocks)
          }}
        />
      )}
    </div>
  )
}
