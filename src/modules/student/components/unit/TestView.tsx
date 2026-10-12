import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CheckCircle2, AlertCircle, Clock, Send, X, ArrowRight, RotateCcw, Link2, Sparkles, Check } from 'lucide-react'
import { submitTestResult } from '@/actions/analytics'
import { useParams, useRouter } from 'next/navigation'
import { ExamData, TestBlock, TestQuestion } from '~/modules/teacher/types'

const MATCH_COLORS = [
  { border: 'border-blue-400', bg: 'bg-blue-50/80', text: 'text-blue-700', badge: 'bg-blue-500' },
  { border: 'border-emerald-400', bg: 'bg-emerald-50/80', text: 'text-emerald-700', badge: 'bg-emerald-500' },
  { border: 'border-purple-400', bg: 'bg-purple-50/80', text: 'text-purple-700', badge: 'bg-purple-500' },
  { border: 'border-amber-400', bg: 'bg-amber-50/80', text: 'text-amber-700', badge: 'bg-amber-500' },
  { border: 'border-rose-400', bg: 'bg-rose-50/80', text: 'text-rose-700', badge: 'bg-rose-500' },
  { border: 'border-cyan-400', bg: 'bg-cyan-50/80', text: 'text-cyan-700', badge: 'bg-cyan-500' },
  { border: 'border-indigo-400', bg: 'bg-indigo-50/80', text: 'text-indigo-700', badge: 'bg-indigo-500' },
  { border: 'border-teal-400', bg: 'bg-teal-50/80', text: 'text-teal-700', badge: 'bg-teal-500' },
]

const normalizeSentence = (str?: string | number) => {
  return String(str || '')
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

type TestViewProps = {
  testData: ExamData | any
  unitId?: string
  onClose: () => void
  initialResult?: { score?: number; correctAnswers?: number; totalQuestions?: number; answers?: Record<string, string | number>; correctAnswersDetail?: Record<string, string | number>; startedAt?: string; completedAt?: string | Date }
  onTestComplete?: (testId: string, result: any) => void
}

export default function TestView({ testData, unitId, onClose, initialResult, onTestComplete }: TestViewProps) {
  const router = useRouter()
  const params = useParams()
  const classId = params.classId as string

  // Support both old TestContent (blocks) and new ExamData (content) shape
  const testBlocks: TestBlock[] = testData.content || testData.blocks || []

  const isReviewMode = !!initialResult && !!initialResult.completedAt
  const [answers, setAnswers] = useState<Record<string, string | number>>(initialResult?.answers || {})
  
  const [timeLeft, setTimeLeft] = useState(() => {
    if (isReviewMode) return testData.duration * 60
    if (initialResult?.startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(initialResult.startedAt).getTime()) / 1000)
      const remaining = testData.duration * 60 - elapsed
      return remaining > 0 ? remaining : 0
    }
    return testData.duration * 60
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ score?: number; correctAnswers?: number; totalQuestions?: number; answers?: Record<string, string | number>; correctAnswersDetail?: Record<string, string | number> } | null>(initialResult?.completedAt ? initialResult : null)
  const [showSummary, setShowSummary] = useState(!!(initialResult?.completedAt))

  const isMiniChallenge = testData.duration <= 15
  const hasSubmittedRef = useRef(false)

  // Matching states: 2-step click-to-place and Drag & Drop
  const [selectedMatchingRight, setSelectedMatchingRight] = useState<{ blockId: string; rightId: string } | null>(null)
  const [selectedMatchingSlot, setSelectedMatchingSlot] = useState<{ blockId: string; leftId: string } | null>(null)
  const [dragOverMatchingSlot, setDragOverMatchingSlot] = useState<string | null>(null)
  const [draggedMatchingRight, setDraggedMatchingRight] = useState<{ blockId: string; rightId: string } | null>(null)

  // Reorder states: Drag & Drop + Click
  const [reorderSelections, setReorderSelections] = useState<Record<string, number[]>>({})
  const [shuffledWordsMap, setShuffledWordsMap] = useState<Record<string, string[]>>({})
  const [draggedReorderWord, setDraggedReorderWord] = useState<{ questionId: string; wordIdx: number; fromSentence?: boolean; sentencePos?: number } | null>(null)
  const [dragOverReorderZone, setDragOverReorderZone] = useState<string | null>(null)
  const [dragOverReorderPos, setDragOverReorderPos] = useState<number | null>(null)

  // Initialize reorder words (ensuring shuffled word bank) and existing selections
  useEffect(() => {
    const initSelections: Record<string, number[]> = {}
    const wordsMap: Record<string, string[]> = {}

    testBlocks.forEach(block => {
      if (block.type === 'reorder' && block.content?.questions) {
        block.content.questions.forEach(q => {
          let words = (q.words && q.words.length > 0) ? q.words : []
          if (words.length === 0 && q.sentence) {
            const raw = q.sentence.trim().split(/\s+/).filter(Boolean)
            // Fisher-Yates shuffle to ensure word bank is always scrambled
            const shuffled = [...raw]
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
            }
            words = shuffled
          }
          wordsMap[q.id] = words

          const ans = answers[q.id]
          if (typeof ans === 'string' && ans.trim()) {
            const ansWords = ans.trim().split(/\s+/)
            const used = new Set<number>()
            const indices: number[] = []
            ansWords.forEach(aw => {
              const foundIdx = words.findIndex((w, i) => w.toLowerCase() === aw.toLowerCase() && !used.has(i))
              if (foundIdx !== -1) {
                used.add(foundIdx)
                indices.push(foundIdx)
              }
            })
            initSelections[q.id] = indices
          }
        })
      }
    })

    setShuffledWordsMap(wordsMap)
    setReorderSelections(initSelections)
  }, [testBlocks])

  // --- MATCHING HANDLERS ---
  const assignMatchingPair = (blockId: string, leftId: string, rightId: string, pairs: any[]) => {
    if (result || isReviewMode) return
    const updatedAnswers = { ...answers }
    // Enforce 1-to-1 matching: if rightId was already assigned elsewhere in this block, clear that pair
    pairs.forEach(p => {
      const k = `${blockId}_${p.id}`
      if (updatedAnswers[k] === rightId) {
        delete updatedAnswers[k]
      }
    })
    updatedAnswers[`${blockId}_${leftId}`] = rightId
    setAnswers(updatedAnswers)
    setSelectedMatchingRight(null)
    setSelectedMatchingSlot(null)
    setDragOverMatchingSlot(null)
    setDraggedMatchingRight(null)
  }

  const handleMatchingSlotClick = (blockId: string, leftId: string, pairs: any[]) => {
    if (result || isReviewMode) return
    // If a right item was previously clicked from the Answer Bank, assign it immediately
    if (selectedMatchingRight && selectedMatchingRight.blockId === blockId) {
      assignMatchingPair(blockId, leftId, selectedMatchingRight.rightId, pairs)
      return
    }

    const currentMatched = answers[`${blockId}_${leftId}`]
    if (currentMatched) {
      // If already matched, click to unmatch back to the bank
      handleUnmatch(blockId, leftId)
      return
    }

    // Toggle slot selection (wait for bank click)
    if (selectedMatchingSlot?.blockId === blockId && selectedMatchingSlot?.leftId === leftId) {
      setSelectedMatchingSlot(null)
    } else {
      setSelectedMatchingSlot({ blockId, leftId })
    }
  }

  const handleMatchingBankItemClick = (blockId: string, rightItem: { id: string; text: string }, pairs: any[], isUsed: boolean) => {
    if (result || isReviewMode) return
    if (isUsed) {
      // Find pair currently holding this item and unmatch it
      const matchedPair = pairs.find(p => answers[`${blockId}_${p.id}`] === rightItem.id)
      if (matchedPair) {
        handleUnmatch(blockId, matchedPair.id)
      }
      return
    }

    // If a slot was previously selected, assign it immediately
    if (selectedMatchingSlot && selectedMatchingSlot.blockId === blockId) {
      assignMatchingPair(blockId, selectedMatchingSlot.leftId, rightItem.id, pairs)
      return
    }

    // Toggle bank item selection (wait for slot click)
    if (selectedMatchingRight?.blockId === blockId && selectedMatchingRight?.rightId === rightItem.id) {
      setSelectedMatchingRight(null)
    } else {
      setSelectedMatchingRight({ blockId, rightId: rightItem.id })
    }
  }

  const handleUnmatch = (blockId: string, leftId: string) => {
    if (result || isReviewMode) return
    const answerKey = `${blockId}_${leftId}`
    const updatedAnswers = { ...answers }
    delete updatedAnswers[answerKey]
    setAnswers(updatedAnswers)
    if (selectedMatchingSlot?.leftId === leftId) {
      setSelectedMatchingSlot(null)
    }
  }

  const handleDragStartMatchingRight = (e: React.DragEvent, blockId: string, rightId: string) => {
    if (result || isReviewMode) return
    setDraggedMatchingRight({ blockId, rightId })
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'matching_right', blockId, rightId }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropMatchingSlot = (e: React.DragEvent, blockId: string, leftId: string, pairs: any[]) => {
    e.preventDefault()
    setDragOverMatchingSlot(null)
    if (result || isReviewMode) return

    let rightId = draggedMatchingRight?.rightId
    try {
      const dataStr = e.dataTransfer.getData('application/json')
      if (dataStr) {
        const parsed = JSON.parse(dataStr)
        if (parsed.type === 'matching_right' && parsed.blockId === blockId) {
          rightId = parsed.rightId
        }
      }
    } catch (_) {}

    if (rightId) {
      assignMatchingPair(blockId, leftId, rightId, pairs)
    }
  }

  // --- REORDER HANDLERS ---
  const handleSelectWord = (questionId: string, wordIdx: number, words: string[]) => {
    if (result || isReviewMode) return
    const currentIndices = reorderSelections[questionId] || []
    if (currentIndices.includes(wordIdx)) return
    const newIndices = [...currentIndices, wordIdx]
    setReorderSelections(prev => ({ ...prev, [questionId]: newIndices }))
    const assembled = newIndices.map(i => words[i]).join(' ')
    handleAnswer(questionId, assembled)
  }

  const handleRemoveWord = (questionId: string, positionInSentence: number, words: string[]) => {
    if (result || isReviewMode) return
    const currentIndices = reorderSelections[questionId] || []
    const newIndices = [...currentIndices]
    newIndices.splice(positionInSentence, 1)
    setReorderSelections(prev => ({ ...prev, [questionId]: newIndices }))
    const assembled = newIndices.map(i => words[i]).join(' ')
    handleAnswer(questionId, assembled)
  }

  const handleResetReorder = (questionId: string) => {
    if (result || isReviewMode) return
    setReorderSelections(prev => ({ ...prev, [questionId]: [] }))
    handleAnswer(questionId, '')
  }

  const handleDragStartBankWord = (e: React.DragEvent, questionId: string, wordIdx: number) => {
    if (result || isReviewMode) return
    setDraggedReorderWord({ questionId, wordIdx, fromSentence: false })
    e.dataTransfer.setData('application/json', JSON.stringify({ questionId, wordIdx, fromSentence: false }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragStartSentenceWord = (e: React.DragEvent, questionId: string, wordIdx: number, sentencePos: number) => {
    if (result || isReviewMode) return
    setDraggedReorderWord({ questionId, wordIdx, fromSentence: true, sentencePos })
    e.dataTransfer.setData('application/json', JSON.stringify({ questionId, wordIdx, fromSentence: true, sentencePos }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDropOnSentenceSlot = (e: React.DragEvent, questionId: string, words: string[], targetPos?: number) => {
    e.preventDefault()
    setDragOverReorderZone(null)
    setDragOverReorderPos(null)
    if (result || isReviewMode) return

    let dragData = draggedReorderWord
    try {
      const dataStr = e.dataTransfer.getData('application/json')
      if (dataStr) {
        const parsed = JSON.parse(dataStr)
        if (parsed.questionId === questionId) {
          dragData = parsed
        }
      }
    } catch (_) {}

    if (!dragData || dragData.questionId !== questionId) return

    const currentIndices = reorderSelections[questionId] || []

    if (dragData.fromSentence && typeof dragData.sentencePos === 'number') {
      const fromPos = dragData.sentencePos
      const toPos = typeof targetPos === 'number' ? targetPos : currentIndices.length - 1
      if (fromPos === toPos) return
      const newIndices = [...currentIndices]
      const [movedItem] = newIndices.splice(fromPos, 1)
      newIndices.splice(toPos, 0, movedItem)
      setReorderSelections(prev => ({ ...prev, [questionId]: newIndices }))
      const assembled = newIndices.map(i => words[i]).join(' ')
      handleAnswer(questionId, assembled)
    } else {
      const wordIdx = dragData.wordIdx
      if (currentIndices.includes(wordIdx)) return
      const newIndices = [...currentIndices]
      if (typeof targetPos === 'number') {
        newIndices.splice(targetPos, 0, wordIdx)
      } else {
        newIndices.push(wordIdx)
      }
      setReorderSelections(prev => ({ ...prev, [questionId]: newIndices }))
      const assembled = newIndices.map(i => words[i]).join(' ')
      handleAnswer(questionId, assembled)
    }

    setDraggedReorderWord(null)
  }

  const handleSubmit = useCallback(async () => {
    if (hasSubmittedRef.current || isSubmitting || result || isReviewMode) return
    hasSubmittedRef.current = true
    setIsSubmitting(true)

    try {
      const res = await submitTestResult({
        classId,
        unitId,
        testId: testData.id,
        answers
      })

      if (res.resultData) {
        setResult(res.resultData)
        setShowSummary(true)
        if (onTestComplete) {
          onTestComplete(testData.id, res.resultData)
        }
      } else {
        throw new Error('No result data returned')
      }
      
      router.refresh()
    } catch (e) {
      console.error(e)
      alert('Có lỗi xảy ra khi nộp bài.')
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, result, classId, unitId, testData.id, answers, router])

  useEffect(() => {
    if (isReviewMode) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '' // Shows browser's native warning dialog
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    if (timeLeft <= 0) {
      if (!isSubmitting && !result) {
        // Use setTimeout to avoid synchronous setState inside effect
        setTimeout(() => {
          handleSubmit()
        }, 0)
      }
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => {
      clearInterval(timer)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [timeLeft, isSubmitting, result, handleSubmit, isReviewMode])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleAnswer = (questionId: string, value: string | number) => {
    if (result || isReviewMode) return
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  if (result && showSummary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[280px] bg-white rounded-xl p-5 shadow-lg border border-gray-100 max-w-sm mx-auto mt-4 animate-in zoom-in-95 duration-500">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm ${
          (result.score || 0) >= 80 ? 'bg-green-100 text-green-600' : 
          (result.score || 0) >= 50 ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'
        }`}>
          {(result.score || 0) >= 80 ? <CheckCircle2 size={30} /> : <AlertCircle size={30} />}
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-1">Kết Quả Bài Thi</h2>
        <div className="text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          {result.score}/100
        </div>
        <p className="text-gray-600 mb-4 font-medium text-xs sm:text-sm">
          Bạn trả lời đúng {result.correctAnswers}/{result.totalQuestions} câu hỏi.
        </p>
        <div className="flex gap-2.5">
          <button 
            onClick={() => setShowSummary(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition-all hover:-translate-y-0.5 text-xs"
          >
            Xem chi tiết đáp án
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-xs transition-all hover:-translate-y-0.5 text-xs"
          >
            Trở về Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-[620px] mx-auto flex flex-col h-full bg-white rounded-xl shadow-lg overflow-hidden border ${isMiniChallenge ? 'border-orange-200 shadow-orange-100/50' : 'border-gray-200'}`}>
      
      {/* Header */}
      <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
        isMiniChallenge ? 'bg-gradient-to-r from-orange-400 to-pink-500 border-transparent text-white' : 'bg-white border-gray-100'
      }`}>
        <div>
          <h1 className={`text-sm sm:text-base font-bold uppercase tracking-tight ${isMiniChallenge ? 'drop-shadow-sm' : 'text-gray-800'}`}>
            {isMiniChallenge && '🚀 '} {testData.title}
          </h1>
          <p className={`text-[11px] font-medium ${isMiniChallenge ? 'text-white/90' : 'text-gray-500'}`}>
            Hãy đọc kỹ câu hỏi và chọn đáp án đúng nhất.
          </p>
        </div>
        
        {!isReviewMode && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs shadow-inner ${
            isMiniChallenge ? 'bg-white/20 backdrop-blur-md' : 'bg-gray-100 text-gray-800'
          } ${timeLeft < 60 ? 'animate-pulse text-red-500 bg-red-50' : ''}`}>
            <Clock size={14} />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 bg-[#f8f9fa] relative">
        <div className="max-w-xl mx-auto space-y-3.5">
          {testBlocks.map((block: TestBlock, index: number) => (
            <div key={block.id} className={`bg-white rounded-xl shadow-xs border p-3 sm:p-3.5 transition-transform ${
              isMiniChallenge ? 'border-orange-200 hover:shadow-orange-100/50' : 'border-gray-200 hover:shadow-sm'
            }`}>
              <div className="mb-2.5 flex items-center gap-2 border-b border-gray-100 pb-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs shadow-2xs ${
                  isMiniChallenge ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {index + 1}
                </div>
                <h3 className={`text-sm sm:text-base font-bold ${isMiniChallenge ? 'text-orange-900' : 'text-gray-800'}`}>
                  {block.title}
                </h3>
              </div>

              {block.type === 'multiple_choice' && (
                <div className="space-y-3.5">
                  {block.content?.questions?.map((q: TestQuestion, qIndex: number) => (
                    <div key={q.id} className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        <span className="font-bold text-gray-400 mr-1">{qIndex + 1}.</span> {q.text}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 pl-1 md:pl-2">
                        {['A', 'B', 'C', 'D'].map((opt, oIdx) => {
                          const isSelected = answers[q.id] === oIdx
                          const hasCorrectDetail = result?.correctAnswersDetail !== undefined
                          const isCorrect = result?.correctAnswersDetail?.[q.id] === oIdx
                          const showCorrect = isReviewMode && hasCorrectDetail && isCorrect
                          const showIncorrect = isReviewMode && hasCorrectDetail && isSelected && !isCorrect

                          return (
                            <button
                              key={opt}
                              onClick={() => handleAnswer(q.id, oIdx)}
                              disabled={isReviewMode}
                              className={`flex items-center gap-2 py-2 px-2.5 rounded-lg border text-left transition-all min-h-[38px] ${
                                showCorrect
                                  ? 'border-green-500 bg-green-50 ring-1 ring-green-300'
                                  : showIncorrect
                                    ? 'border-red-500 bg-red-50 ring-1 ring-red-300'
                                    : isSelected 
                                      ? (isMiniChallenge ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-300' : 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-300')
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              } ${isReviewMode ? 'cursor-default' : ''}`}
                            >
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                showCorrect
                                  ? 'border-green-500 bg-green-500 text-white'
                                  : showIncorrect
                                    ? 'border-red-500 bg-red-500 text-white'
                                    : isSelected 
                                      ? (isMiniChallenge ? 'border-orange-500' : 'border-indigo-500')
                                      : 'border-gray-300'
                              }`}>
                                {showCorrect ? <CheckCircle2 size={10} /> : showIncorrect ? <X size={10} /> : isSelected && <div className={`w-1.5 h-1.5 rounded-full ${isMiniChallenge ? 'bg-orange-500' : 'bg-indigo-500'}`} />}
                              </div>
                              <span className="font-bold text-gray-500 text-xs">{opt}.</span>
                              <span className={`font-medium text-xs ${showCorrect ? 'text-green-800' : showIncorrect ? 'text-red-800' : 'text-gray-700'}`}>{q.options?.[oIdx] || ''}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {block.type === 'fill_blank' && (
                <div className="space-y-2.5">
                  {((block.content?.questions && block.content.questions.length > 0)
                    ? block.content.questions
                    : [{ id: block.id, text: block.content?.text || '', answer: block.content?.answer || '' }]
                  ).map((q: TestQuestion, qIdx: number) => {
                    const qId = q.id
                    const answerStr = String(answers[qId] || '').trim().toLowerCase()
                    const hasCorrectDetail = result?.correctAnswersDetail !== undefined
                    const correctStr = String(result?.correctAnswersDetail?.[qId] || '').trim().toLowerCase()
                    const isCorrect = answerStr === correctStr
                    const showCorrect = isReviewMode && hasCorrectDetail && isCorrect
                    const showIncorrect = isReviewMode && hasCorrectDetail && !isCorrect && answerStr !== ''

                    return (
                      <div key={qId} className="space-y-1 p-2.5 bg-gray-50/60 rounded-lg border border-gray-100">
                        <p className="text-xs sm:text-sm font-medium text-gray-800 leading-relaxed">
                          <span className="font-bold text-gray-400 mr-1">{qIdx + 1}.</span>
                          {(q.text || '').split('___').map((part: string, i: number, arr: string[]) => (
                            <React.Fragment key={i}>
                              {part}
                              {i < arr.length - 1 && (
                                <span className="relative inline-block mx-1">
                                  <input 
                                    type="text" 
                                    value={answers[qId] || ''}
                                    onChange={(e) => handleAnswer(qId, e.target.value)}
                                    disabled={isReviewMode}
                                    className={`w-24 sm:w-28 border-b-2 bg-white px-1.5 py-0.5 rounded-t text-center font-bold text-xs focus:outline-none transition-colors ${
                                      showCorrect
                                        ? 'border-green-500 text-green-700 bg-green-50'
                                        : showIncorrect
                                          ? 'border-red-500 text-red-700 bg-red-50'
                                          : isMiniChallenge 
                                            ? 'border-orange-300 text-orange-600 focus:border-orange-600 bg-orange-50' 
                                            : 'border-indigo-300 text-indigo-600 focus:border-indigo-600 bg-indigo-50/30'
                                    }`} 
                                  />
                                  {isReviewMode && hasCorrectDetail && !isCorrect && (
                                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-green-600 whitespace-nowrap bg-green-100 px-1 py-0.2 rounded shadow-2xs border border-green-200 z-10">
                                      Đáp án: {String(result?.correctAnswersDetail?.[qId] || '')}
                                    </span>
                                  )}
                                </span>
                              )}
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}

              {block.type === 'matching' && (() => {
                const pairs = block.content?.pairs || []
                const rightItems = block.content?.shuffledRight || pairs.map(p => ({ id: p.id, text: p.right || '' }))
                
                if (isReviewMode) {
                  return (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-gray-500 mb-1">Kết quả ghép nối:</p>
                      <div className="space-y-2">
                        {pairs.map((p, pIdx) => {
                          const answerKey = `${block.id}_${p.id}`
                          const studentMatchedRightId = answers[answerKey]
                          const studentMatchedItem = rightItems.find(r => r.id === studentMatchedRightId)
                          const hasDetail = result?.correctAnswersDetail !== undefined
                          const correctDetail = result?.correctAnswersDetail?.[answerKey]
                          
                          const isCorrect = studentMatchedRightId === p.id || (p.right && String(studentMatchedItem?.text || '').trim().toLowerCase() === String(p.right).trim().toLowerCase())
                          const showCorrect = isReviewMode && hasDetail && isCorrect
                          const showIncorrect = isReviewMode && hasDetail && !isCorrect

                          return (
                            <div 
                              key={p.id}
                              className={`p-2.5 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-2 ${
                                showCorrect 
                                  ? 'border-green-300 bg-green-50/60' 
                                  : showIncorrect 
                                    ? 'border-red-300 bg-red-50/60' 
                                    : 'border-gray-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                  showCorrect ? 'bg-green-100 text-green-700' : showIncorrect ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {pIdx + 1}
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-gray-400 block">Cột A</span>
                                  <span className="font-bold text-gray-800 text-xs sm:text-sm">{p.left}</span>
                                </div>
                              </div>

                              <div className="hidden md:flex items-center text-gray-400">
                                <ArrowRight size={14} />
                              </div>

                              <div className="flex-1 md:max-w-md">
                                <div className="flex items-center gap-1.5">
                                  {showCorrect ? (
                                    <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                                  ) : (
                                    <X size={14} className="text-red-500 shrink-0" />
                                  )}
                                  <div>
                                    <span className="text-[10px] font-semibold text-gray-500 block">Bạn đã ghép:</span>
                                    <span className={`font-bold text-xs ${showCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                      {studentMatchedItem ? studentMatchedItem.text : '(Chưa ghép)'}
                                    </span>
                                  </div>
                                </div>
                                {showIncorrect && (
                                  <div className="mt-0.5 text-[10px] text-green-700 font-semibold bg-green-100/80 px-1.5 py-0.5 rounded inline-block">
                                    Đáp án đúng: {String(correctDetail || p.right || '')}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                }

                const isRightSelected = !!selectedMatchingRight && selectedMatchingRight.blockId === block.id
                const isSlotSelected = !!selectedMatchingSlot && selectedMatchingSlot.blockId === block.id
                const totalMatched = pairs.filter(p => !!answers[`${block.id}_${p.id}`]).length

                return (
                  <div className="space-y-3">
                    {/* Instructions header banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-600 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 p-2 sm:p-2.5 rounded-lg border border-indigo-100 gap-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-medium text-indigo-950 text-[11px]">
                        <Sparkles size={13} className="text-indigo-600 shrink-0" />
                        <span>
                          <b>Cách làm:</b> Kéo thẻ từ <b>Kho đáp án ở dưới</b> vào ô ở <b>Cột bên phải</b>, hoặc <b>chạm 1 đáp án</b> rồi <b>chạm ô kết quả</b>.
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-[10px]">
                          Đã ghép {totalMatched}/{pairs.length} cặp
                        </span>
                      </div>
                    </div>

                    {/* Main matching list: Left Fixed Column A, Right Result Slot */}
                    <div className="space-y-2">
                      {pairs.map((p, pIdx) => {
                        const answerKey = `${block.id}_${p.id}`
                        const matchedRightId = answers[answerKey]
                        const matchedRightItem = rightItems.find(r => r.id === matchedRightId)
                        const isTargetSlotActive = isSlotSelected && selectedMatchingSlot?.leftId === p.id
                        const isDragOver = dragOverMatchingSlot === p.id
                        const color = MATCH_COLORS[pIdx % MATCH_COLORS.length]

                        return (
                          <div
                            key={p.id}
                            className={`p-2.5 sm:p-3 rounded-lg border transition-all ${
                              matchedRightItem
                                ? `${color.border} ${color.bg} shadow-2xs`
                                : isTargetSlotActive || isDragOver
                                  ? 'border-indigo-500 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-200'
                                  : isRightSelected
                                    ? 'border-indigo-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/20'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              {/* Left Column A: Fixed */}
                              <div className="flex items-center gap-2 sm:w-1/2 min-w-0">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                  matchedRightItem ? `${color.badge} text-white` : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {pIdx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">
                                    Cột A
                                  </span>
                                  <span className="font-bold text-gray-900 text-xs sm:text-sm break-words">
                                    {p.left}
                                  </span>
                                </div>
                              </div>

                              <div className="hidden sm:flex items-center text-gray-300 shrink-0">
                                <ArrowRight size={14} />
                              </div>

                              {/* Right Column: Result Drop/Click Zone */}
                              <div
                                onClick={() => handleMatchingSlotClick(block.id, p.id, pairs)}
                                onDragOver={(e) => {
                                  e.preventDefault()
                                  setDragOverMatchingSlot(p.id)
                                }}
                                onDragLeave={() => setDragOverMatchingSlot(null)}
                                onDrop={(e) => handleDropMatchingSlot(e, block.id, p.id, pairs)}
                                className={`flex-1 min-h-[36px] sm:min-h-[38px] rounded-md border-2 transition-all flex items-center justify-between p-1.5 sm:p-2 cursor-pointer ${
                                  matchedRightItem
                                    ? 'border-white/80 bg-white shadow-2xs'
                                    : isDragOver || isTargetSlotActive
                                      ? 'border-dashed border-indigo-500 bg-indigo-100/70 shadow-inner'
                                      : isRightSelected
                                        ? 'border-dashed border-indigo-400 bg-indigo-50/40 animate-pulse hover:bg-indigo-50'
                                        : 'border-dashed border-gray-200 bg-gray-50/80 hover:border-gray-300 hover:bg-gray-100/60'
                                }`}
                              >
                                {matchedRightItem ? (
                                  <div className="flex items-center justify-between w-full gap-1.5">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <Link2 size={12} className={`${color.text} shrink-0`} />
                                      <span className={`font-bold text-xs ${color.text} break-words`}>
                                        {matchedRightItem.text}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleUnmatch(block.id, p.id)
                                      }}
                                      className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded transition-colors shrink-0"
                                      title="Gỡ đáp án này (trả về kho)"
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center w-full text-[11px] text-gray-400 font-medium select-none text-center">
                                    {isDragOver ? (
                                      <span className="text-indigo-600 font-bold">Thả đáp án vào đây...</span>
                                    ) : isTargetSlotActive ? (
                                      <span className="text-indigo-600 font-bold animate-pulse">Chọn 1 đáp án ở kho dưới</span>
                                    ) : isRightSelected ? (
                                      <span className="text-indigo-600 font-bold">Chạm để gán đáp án</span>
                                    ) : (
                                      <span>Kéo thả hoặc chạm để gán</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Answer Bank (Placed at the bottom of the matching block) */}
                    <div className="pt-1">
                      <div className="p-2.5 sm:p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                            <h4 className="font-bold text-[10px] uppercase tracking-wider text-purple-900">
                              Kho đáp án (Cột B xáo trộn)
                            </h4>
                          </div>
                          <span className="text-[11px] text-gray-500 font-medium">
                            Còn <b>{rightItems.length - totalMatched}</b>/{rightItems.length} thẻ
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {rightItems.map((r, rIdx) => {
                            const matchedLeftPair = pairs.find(p => answers[`${block.id}_${p.id}`] === r.id)
                            const isUsed = !!matchedLeftPair
                            const isCurrentSelected = isRightSelected && selectedMatchingRight?.rightId === r.id

                            return (
                              <div
                                key={r.id || rIdx}
                                draggable={!isUsed}
                                onDragStart={(e) => handleDragStartMatchingRight(e, block.id, r.id)}
                                onClick={() => handleMatchingBankItemClick(block.id, r, pairs, isUsed)}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all select-none flex items-center gap-1 ${
                                  isUsed
                                    ? 'bg-gray-200/60 text-gray-400 border border-transparent cursor-pointer line-through opacity-50 hover:opacity-80'
                                    : isCurrentSelected
                                      ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-300 border-indigo-600 scale-105 cursor-pointer'
                                      : isSlotSelected
                                        ? 'bg-white text-indigo-950 border border-indigo-300 shadow-2xs hover:border-indigo-500 hover:bg-indigo-50/60 cursor-pointer animate-pulse'
                                        : 'bg-white text-gray-800 border border-gray-200 shadow-2xs hover:border-indigo-400 hover:text-indigo-600 hover:-translate-y-0.5 cursor-grab active:cursor-grabbing'
                                }`}
                                title={isUsed ? 'Đã ghép (chạm để gỡ về kho)' : 'Kéo thả hoặc chạm để gán vào ô'}
                              >
                                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold ${
                                  isCurrentSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {String.fromCharCode(65 + rIdx)}
                                </span>
                                <span>{r.text}</span>
                                {isUsed && (
                                  <span className="text-[8px] bg-gray-300/80 text-gray-600 px-1 py-0.2 rounded no-underline">
                                    Đã ghép
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {block.type === 'reorder' && (
                <div className="space-y-4">
                  {(block.content?.questions || []).map((q: TestQuestion, qIdx: number) => {
                    const words = shuffledWordsMap[q.id] || (q.words && q.words.length > 0 ? q.words : (q.sentence || '').trim().split(/\s+/).filter(Boolean))
                    const selectedIndices = reorderSelections[q.id] || []
                    const studentSentence = answers[q.id] ? String(answers[q.id]) : ''
                    const hasDetail = result?.correctAnswersDetail !== undefined
                    const correctSentence = String(result?.correctAnswersDetail?.[q.id] || q.sentence || '')
                    const isCorrect = normalizeSentence(studentSentence) === normalizeSentence(correctSentence)
                    const showCorrect = isReviewMode && hasDetail && isCorrect
                    const showIncorrect = isReviewMode && hasDetail && !isCorrect

                    return (
                      <div 
                        key={q.id}
                        className={`p-3 sm:p-3.5 rounded-lg border transition-all ${
                          showCorrect 
                            ? 'border-green-300 bg-green-50/40' 
                            : showIncorrect 
                              ? 'border-red-300 bg-red-50/40' 
                              : 'border-gray-200 bg-white shadow-2xs'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              showCorrect ? 'bg-green-100 text-green-700' : showIncorrect ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-700'
                            }`}>
                              {qIdx + 1}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                {q.text || 'Sắp xếp các từ sau thành câu hoàn chỉnh:'}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Kéo thả từ lên ô câu, hoặc chạm từng từ theo thứ tự để ghép.
                              </p>
                            </div>
                          </div>

                          {!isReviewMode && selectedIndices.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleResetReorder(q.id)}
                              className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 px-1.5 py-0.5 rounded border border-gray-200 transition-colors shrink-0"
                              title="Xóa làm lại câu này"
                            >
                              <RotateCcw size={11} /> Làm lại
                            </button>
                          )}
                        </div>

                        {/* Sentence Drop Zone (Assembled by student) */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault()
                            setDragOverReorderZone(q.id)
                          }}
                          onDragLeave={() => setDragOverReorderZone(null)}
                          onDrop={(e) => handleDropOnSentenceSlot(e, q.id, words)}
                          className={`p-2 rounded-lg border-2 min-h-[42px] flex flex-wrap items-center gap-1.5 transition-all mb-2 ${
                            showCorrect
                              ? 'border-green-400 bg-white'
                              : showIncorrect
                                ? 'border-red-400 bg-white'
                                : dragOverReorderZone === q.id
                                  ? 'border-indigo-500 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-200'
                                  : selectedIndices.length > 0
                                    ? 'border-indigo-300 bg-indigo-50/30'
                                    : 'border-dashed border-gray-300 bg-gray-50/50 hover:border-gray-400'
                          }`}
                        >
                          {isReviewMode ? (
                            <div className="w-full space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                {showCorrect ? (
                                  <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                                ) : (
                                  <X size={14} className="text-red-500 shrink-0" />
                                )}
                                <span className={`font-bold text-xs sm:text-sm ${showCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                  {studentSentence || '(Chưa làm)'}
                                </span>
                              </div>
                              {showIncorrect && (
                                <div className="text-[11px] text-green-700 font-semibold bg-green-100/80 p-1.5 rounded border border-green-200">
                                  Đáp án đúng: <span className="font-bold">{correctSentence}</span>
                                </div>
                              )}
                            </div>
                          ) : selectedIndices.length === 0 ? (
                            <span className="text-gray-400 text-[11px] italic select-none">
                              {dragOverReorderZone === q.id ? 'Thả từ vào đây...' : 'Kéo thả các từ vào đây hoặc chạm từ bên dưới...'}
                            </span>
                          ) : (
                            selectedIndices.map((wordIdx, pos) => (
                              <div
                                key={`${wordIdx}-${pos}`}
                                draggable={true}
                                onDragStart={(e) => handleDragStartSentenceWord(e, q.id, wordIdx, pos)}
                                onDragOver={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setDragOverReorderPos(pos)
                                }}
                                onDrop={(e) => {
                                  e.stopPropagation()
                                  handleDropOnSentenceSlot(e, q.id, words, pos)
                                }}
                                onClick={() => handleRemoveWord(q.id, pos, words)}
                                className={`px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md text-[11px] shadow-2xs transition-all flex items-center gap-1 cursor-grab active:cursor-grabbing group/chip select-none ${
                                  dragOverReorderPos === pos ? 'ring-1 ring-amber-300 scale-105' : ''
                                }`}
                                title="Kéo để đổi vị trí, hoặc chạm để trả về kho từ"
                              >
                                <span>{words[wordIdx]}</span>
                                <X size={11} className="opacity-70 group-hover/chip:opacity-100 shrink-0" />
                              </div>
                            ))
                          )}
                        </div>

                        {/* Word Bank Chips (Only shown in Taking mode) */}
                        {!isReviewMode && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                              Kho từ (Kéo lên hoặc chạm để ghép câu):
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {words.map((w, wIdx) => {
                                const isUsed = selectedIndices.includes(wIdx)
                                return (
                                  <button
                                    key={wIdx}
                                    type="button"
                                    disabled={isUsed}
                                    draggable={!isUsed}
                                    onDragStart={(e) => handleDragStartBankWord(e, q.id, wIdx)}
                                    onClick={() => handleSelectWord(q.id, wIdx, words)}
                                    className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-all select-none ${
                                      isUsed
                                        ? 'bg-gray-100 text-gray-300 border border-transparent cursor-not-allowed scale-95 opacity-40'
                                        : 'bg-white text-gray-800 border border-gray-200 shadow-2xs hover:border-indigo-400 hover:text-indigo-600 hover:-translate-y-0.5 active:translate-y-0 cursor-grab active:cursor-grabbing'
                                    }`}
                                    title={isUsed ? 'Đã dùng' : 'Kéo lên ô hoặc chạm để ghép'}
                                  >
                                    {w}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-3.5 bg-white border-t border-gray-100 flex items-center justify-between shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        {isReviewMode ? (
          <div className="w-full flex justify-between items-center">
            <p className="text-gray-500 font-medium text-xs">Bạn đang xem chi tiết bài làm.</p>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg shadow-sm transition-all hover:-translate-y-0.5 text-xs"
            >
              Trở về Dashboard
            </button>
          </div>
        ) : (
          <>
            <p className="text-gray-500 font-medium text-[11px] hidden md:block">
              Hệ thống sẽ tự động nộp bài khi hết thời gian.
            </p>
            <div className="flex gap-2.5 w-full md:w-auto">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex-1 md:flex-none px-4 py-2 font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-transform hover:-translate-y-0.5 text-xs sm:text-sm ${
                  isMiniChallenge ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                } disabled:opacity-50 disabled:hover:translate-y-0`}
              >
                {isSubmitting ? 'Đang nộp bài...' : (
                  <>
                    Nộp bài ngay <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
