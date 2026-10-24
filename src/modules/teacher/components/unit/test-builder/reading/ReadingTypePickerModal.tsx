'use client'

import React, { useState, useMemo } from 'react'
import {
  X,
  Sparkles,
  Copy,
  Check,
  FileCode2,
  BookOpen,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Shuffle,
} from 'lucide-react'
import Portal from '@/components/common/Portal'
import type { ReadingInteractionType, ReadingImportJsonData } from './types'
import { getSampleJsonForTypes } from './constants'
import {
  generateReadingPrompt,
  calculateQuestionsFromWords,
  getRandomVocabSample,
} from './promptHelper'
import { validateReadingJson } from './readingJsonValidator'
import ReadingPromptConfigBar from './ReadingPromptConfigBar'
import ReadingTypeGrid from './ReadingTypeGrid'
import type { VocabItemData } from '@/modules/teacher/types'

export type ReadingTypePickerModalProps = {
  isOpen: boolean
  vocabItems?: VocabItemData[]
  unitTitle?: string
  passageIndex?: number
  initialTab?: 'prompt' | 'json' | 'paste'
  onClose: () => void
  onSelectTypeToManual: (types: ReadingInteractionType[]) => void
  onImportJson: (data: ReadingImportJsonData) => void
}

export default function ReadingTypePickerModal({
  isOpen,
  vocabItems = [],
  unitTitle,
  passageIndex,
  initialTab = 'prompt',
  onClose,
  onSelectTypeToManual,
  onImportJson,
}: ReadingTypePickerModalProps) {
  const [selectedTypes, setSelectedTypes] = useState<ReadingInteractionType[]>(['multiple_choice'])
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [activeTab, setActiveTab] = useState<'prompt' | 'json' | 'paste'>(initialTab)

  // Shuffle key để đổi bộ 25 từ ngẫu nhiên khác trong Unit
  const [shuffleKey, setShuffleKey] = useState(0)
  const selectedVocabSample = useMemo(() => {
    return getRandomVocabSample(vocabItems, 25, shuffleKey)
  }, [vocabItems, shuffleKey])

  const handleReshuffleVocab = () => {
    setShuffleKey((prev) => prev + 1)
  }

  // Cấu hình thông số tạo Prompt động
  const [numPassages, setNumPassages] = useState(1)
  const [wordCount, setWordCount] = useState(200)
  const [numQuestions, setNumQuestions] = useState(4)
  const [isQuestionsCustomized, setIsQuestionsCustomized] = useState(false)
  const [targetLevel, setTargetLevel] = useState('THPT & Thi Tốt nghiệp (B1-B2)')

  const handleWordCountChange = (val: number) => {
    setWordCount(val)
    if (!isQuestionsCustomized) {
      setNumQuestions(calculateQuestionsFromWords(val))
    }
  }

  const handleNumQuestionsChange = (val: number) => {
    setNumQuestions(val)
    setIsQuestionsCustomized(true)
  }

  const handleResetQuestionsToAuto = () => {
    setIsQuestionsCustomized(false)
    setNumQuestions(calculateQuestionsFromWords(wordCount))
  }

  // Quản lý chọn 1 dạng hoặc Mix nhiều dạng câu hỏi
  const handleToggleType = (type: ReadingInteractionType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length === 1) return
      setSelectedTypes(selectedTypes.filter((t) => t !== type))
    } else {
      setSelectedTypes([...selectedTypes, type])
    }
  }

  const handleSelectOnlyType = (type: ReadingInteractionType) => {
    setSelectedTypes([type])
  }

  const handleSelectMixPreset = (types: ReadingInteractionType[]) => {
    setSelectedTypes(types)
  }

  // Sinh Prompt tự động dựa trên dạng đã chọn, danh sách từ vựng Unit và thông số cấu hình
  const currentPrompt = useMemo(() => {
    return generateReadingPrompt({
      types: selectedTypes,
      vocabItems: selectedVocabSample,
      unitTitle,
      wordCount,
      numQuestions,
      numPassages,
      targetLevel,
    })
  }, [selectedTypes, selectedVocabSample, unitTitle, wordCount, numQuestions, numPassages, targetLevel])

  const currentSampleJson = useMemo(() => getSampleJsonForTypes(selectedTypes), [selectedTypes])

  // Validation thời gian thực cho mã JSON nhập vào
  const validation = useMemo(() => validateReadingJson(jsonInput), [jsonInput])

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(currentPrompt)
      setCopiedPrompt(true)
      setTimeout(() => setCopiedPrompt(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(currentSampleJson)
      setCopiedJson(true)
      setTimeout(() => setCopiedJson(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handlePasteSampleToInput = () => {
    setJsonInput(currentSampleJson)
  }

  // Thực hiện tạo đề từ JSON
  const handleApplyJson = () => {
    if (!validation.isValid) return
    onImportJson({
      title: validation.title,
      text: validation.text,
      questions: validation.questions,
      passages: validation.passages,
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">
                  {passageIndex !== undefined
                    ? `Thêm Bài Đọc Mới (Bài đọc ${passageIndex + 1})`
                    : 'Thêm Bài Đọc Mới (Reading Passage)'}
                </h3>
                <p className="text-xs text-gray-500">
                  Chọn 1 trong 6 định dạng bài đọc, sao chép Prompt AI hoặc nạp dữ liệu từ JSON
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            {/* 1. Lựa chọn dạng câu hỏi (hỗ trợ Mix nhiều dạng) */}
            <ReadingTypeGrid
              selectedTypes={selectedTypes}
              onToggleType={handleToggleType}
              onSelectOnlyType={handleSelectOnlyType}
              onSelectMixPreset={handleSelectMixPreset}
            />

            {/* Thông báo từ vựng Unit */}
            {vocabItems.length > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2.5 text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    {vocabItems.length > 25 ? (
                      <>
                        Hệ thống đã tự động chọn ngẫu nhiên{' '}
                        <strong>{selectedVocabSample.length}</strong>/{vocabItems.length} từ vựng
                        mục tiêu của Unit vào Prompt của dạng bài này!
                      </>
                    ) : (
                      <>
                        Hệ thống đã tự động đưa <strong>{selectedVocabSample.length}</strong> từ vựng
                        mục tiêu của Unit vào Prompt của dạng bài này!
                      </>
                    )}
                  </span>
                </div>
                {vocabItems.length > 25 && (
                  <button
                    type="button"
                    onClick={handleReshuffleVocab}
                    title="Chọn ngẫu nhiên 25 từ khác trong Unit"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100/70 hover:text-emerald-800 transition-colors shrink-0 shadow-2xs cursor-pointer"
                  >
                    <Shuffle size={13} />
                    <span>Đổi 25 từ khác</span>
                  </button>
                )}
              </div>
            )}

            {/* 2. Tabs: Prompt AI / JSON mẫu / Import JSON */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('prompt')}
                    className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === 'prompt'
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>
                      Prompt AI {selectedTypes.length > 1 ? `(Mix ${selectedTypes.length} dạng)` : 'của dạng này'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('json')}
                    className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === 'json'
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileCode2 size={14} />
                    <span>
                      JSON mẫu {selectedTypes.length > 1 ? `(Mix ${selectedTypes.length} dạng)` : ''}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('paste')}
                    className={`px-3 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === 'paste'
                        ? 'border-indigo-600 text-indigo-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileCode2 size={14} />
                    <span>Import JSON</span>
                  </button>
                </div>

                {activeTab === 'prompt' && (
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all mb-1"
                  >
                    {copiedPrompt ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedPrompt ? 'Đã sao chép!' : 'Copy Prompt'}</span>
                  </button>
                )}

                {activeTab === 'json' && (
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors mb-1"
                  >
                    {copiedJson ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedJson ? 'Đã sao chép' : 'Copy JSON'}</span>
                  </button>
                )}
              </div>

              {/* Tab 1: Prompt AI */}
              {activeTab === 'prompt' && (
                <div className="space-y-3">
                  <ReadingPromptConfigBar
                    numPassages={numPassages}
                    onNumPassagesChange={setNumPassages}
                    wordCount={wordCount}
                    onWordCountChange={handleWordCountChange}
                    numQuestions={numQuestions}
                    onNumQuestionsChange={handleNumQuestionsChange}
                    isQuestionsCustomized={isQuestionsCustomized}
                    onResetQuestionsToAuto={handleResetQuestionsToAuto}
                    targetLevel={targetLevel}
                    onTargetLevelChange={setTargetLevel}
                  />

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <p>
                      Bấm <strong>Copy Prompt</strong> &rarr; Dán vào ChatGPT / Claude / Gemini &rarr; Chuyển sang tab <strong>Import JSON</strong> để tạo đề.
                    </p>
                  </div>

                  <pre className="p-3.5 bg-gray-900 text-gray-100 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-52 overflow-y-auto custom-scrollbar border border-gray-800 leading-relaxed">
                    {currentPrompt}
                  </pre>
                </div>
              )}

              {/* Tab 2: JSON mẫu */}
              {activeTab === 'json' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Cấu trúc mẫu chuẩn cho{' '}
                      {selectedTypes.length > 1 ? `Mix ${selectedTypes.length} dạng` : selectedTypes[0]}:
                    </span>
                    <button
                      type="button"
                      onClick={handlePasteSampleToInput}
                      className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      Dán vào tab Import JSON
                    </button>
                  </div>
                  <pre className="p-3.5 bg-gray-900 text-emerald-400 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-52 overflow-y-auto custom-scrollbar border border-gray-800 leading-relaxed">
                    {currentSampleJson}
                  </pre>
                </div>
              )}

              {/* Tab 3: Import JSON (Dark theme styling giống các template khác) */}
              {activeTab === 'paste' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Dán mã JSON bài đọc vào đây *
                    </label>
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={handlePasteSampleToInput}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
                      >
                        Dán mẫu thử nghiệm
                      </button>
                      {jsonInput && (
                        <>
                          <span className="text-gray-300">•</span>
                          <button
                            type="button"
                            onClick={() => setJsonInput('')}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            Xóa trắng
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Dark theme Textarea giống ImportBlockJsonModal */}
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    rows={8}
                    placeholder={`Dán mã JSON bài đọc và câu hỏi vào đây, ví dụ:\n${currentSampleJson.slice(0, 160)}...`}
                    className="w-full bg-gray-900 text-emerald-400 font-mono text-xs rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y custom-scrollbar leading-relaxed"
                  />

                  {/* Validation Feedback */}
                  {validation.error && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-in fade-in duration-150">
                      <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <span>{validation.error}</span>
                    </div>
                  )}

                  {validation.isValid && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in duration-150">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      <span>
                        Cú pháp JSON hợp lệ!{' '}
                        {validation.passages && validation.passages.length > 1 ? (
                          <>Đã nhận diện <strong>{validation.passages.length} bài đọc</strong>.</>
                        ) : (
                          <>
                            Đã nhận diện {validation.text ? 'bài đọc' : ''}
                            {validation.text && validation.questions.length > 0 ? ' và ' : ''}
                            {validation.questions.length > 0
                              ? `${validation.questions.length} câu hỏi`
                              : ''}
                            .
                          </>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions: Đổi nút tương ứng với tab */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/70 flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>

            <div className="flex items-center gap-2">
              {activeTab === 'paste' ? (
                /* Khi ở tab Import JSON -> Nút biến thành "Tạo đề từ JSON" */
                <button
                  type="button"
                  onClick={handleApplyJson}
                  disabled={!validation.isValid}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-200 transition-all cursor-pointer"
                >
                  <FileCode2 size={15} />
                  <span>
                    Tạo đề từ JSON{' '}
                    {validation.passages && validation.passages.length > 1
                      ? `(${validation.passages.length} bài đọc)`
                      : validation.questions.length > 0
                        ? `(${validation.questions.length} câu)`
                        : ''}
                  </span>
                </button>
              ) : (
                /* Khi ở các tab khác -> Nút là "Tự soạn bài đọc dạng này trên UI" */
                <button
                  type="button"
                  onClick={() => {
                    onSelectTypeToManual(selectedTypes)
                    onClose()
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all cursor-pointer"
                >
                  <span>
                    {selectedTypes.length > 1
                      ? `Tự soạn bài đọc Mix ${selectedTypes.length} dạng trên UI`
                      : 'Tự soạn bài đọc dạng này trên UI'}
                  </span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
