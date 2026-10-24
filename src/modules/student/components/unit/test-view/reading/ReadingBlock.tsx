'use client'

import React, { useState, useMemo } from 'react'
import { BookOpen, FileText } from 'lucide-react'
import ReadingPassageView from './ReadingPassageView'
import ReadingQuestionsView from './ReadingQuestionsView'
import ReadingControlBar from './ReadingControlBar'
import type { ReadingBlockProps, ReadingPassageItemView } from './types'

export default function ReadingBlock({
  blockId,
  text,
  questions = [],
  passages,
  answers = {},
  isMiniChallenge = false,
  isReviewMode = false,
  result = null,
  onAnswer,
  viewMode = 'student',
  onViewModeChange,
  showControls = true,
  defaultLayout = 'split',
}: ReadingBlockProps) {
  // Chuẩn hóa danh sách bài đọc (passages)
  const passagesList: ReadingPassageItemView[] = useMemo(() => {
    if (passages && passages.length > 0) return passages
    if (text || (questions && questions.length > 0)) {
      return [
        {
          id: `${blockId}-passage`,
          title: 'Bài đọc (Reading Passage)',
          text: text || '',
          questions: questions || [],
        },
      ]
    }
    return []
  }, [passages, text, questions, blockId])

  // Trạng thái chọn bài đọc nếu có nhiều bài
  const [activePassageIndex, setActivePassageIndex] = useState<number | 'all'>(0)

  // Bố cục: 'split' (chia 2 cột) vs 'stacked' (xếp chồng dọc)
  const [layoutMode, setLayoutMode] = useState<'split' | 'stacked'>(defaultLayout)

  // Cỡ chữ bài đọc: 'normal' vs 'large'
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal')

  // Trạng thái sao chép văn bản
  const [copiedPassageId, setCopiedPassageId] = useState<string | null>(null)

  const handleCopy = (txt: string, id: string) => {
    try {
      navigator.clipboard.writeText(txt)
      setCopiedPassageId(id)
      setTimeout(() => {
        setCopiedPassageId(null)
      }, 2000)
    } catch {
      // Ignore
    }
  }

  if (passagesList.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50/60 rounded-2xl border border-dashed border-gray-200">
        <BookOpen className="mx-auto text-gray-400 mb-2" size={32} />
        <p className="text-gray-500 font-medium">Chưa có bài đọc nào trong phần này.</p>
      </div>
    )
  }

  // Danh sách các bài đọc đang hiển thị
  const displayPassages =
    activePassageIndex === 'all'
      ? passagesList
      : [passagesList[activePassageIndex] || passagesList[0]]

  const totalQuestionsCount = passagesList.reduce(
    (sum, p) => sum + (p.questions?.length || 0),
    0,
  )

  return (
    <div className="space-y-4">
      {/* THANH ĐIỀU KHIỂN: BỐ CỤC (CHIA 2 CỘT / XẾP CHỒNG) & CỠ CHỮ */}
      {showControls && (
        <ReadingControlBar
          layoutMode={layoutMode}
          setLayoutMode={setLayoutMode}
          fontSize={fontSize}
          setFontSize={setFontSize}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
      )}

      {/* THANH CHỌN BÀI ĐỌC (NẾU CÓ NHIỀU BÀI ĐỌC TRONG PHẦN THI) */}
      {passagesList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <span className="text-xs font-bold text-gray-400 shrink-0 mr-1">
            Chọn bài đọc:
          </span>
          {passagesList.map((p, idx) => {
            const isSelected = activePassageIndex === idx
            return (
              <button
                key={p.id ? `${p.id}_${idx}` : `p-tab-${idx}`}
                type="button"
                onClick={() => setActivePassageIndex(idx)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
                }`}
              >
                <BookOpen
                  size={12}
                  className={isSelected ? 'text-indigo-200' : 'text-gray-400'}
                />
                <span>{p.title || `Bài đọc ${idx + 1}`}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {p.questions?.length || 0} câu
                </span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => setActivePassageIndex('all')}
            className={`px-3 py-1 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 border ${
              activePassageIndex === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
            }`}
          >
            <FileText size={12} />
            <span>Xem tất cả ({totalQuestionsCount} câu)</span>
          </button>
        </div>
      )}

      {/* DANH SÁCH BÀI ĐỌC */}
      <div className="space-y-6">
        {displayPassages.map((passage, pIdx) => {
          const passageActualIndex =
            activePassageIndex === 'all'
              ? pIdx
              : typeof activePassageIndex === 'number'
                ? activePassageIndex
                : pIdx
          const questionsList = passage.questions || []
          const title =
            passage.title ||
            (passagesList.length > 1 ? `Bài đọc ${passageActualIndex + 1}` : undefined)

          return (
            <div
              key={passage.id ? `${passage.id}_${pIdx}` : `passage-${pIdx}`}
              className="space-y-4"
            >
              {layoutMode === 'split' ? (
                /* BỐ CỤC CHIA 2 CỘT (SPLIT) */
                <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-12 items-start">
                  {/* CỘT TRÁI: NỘI DUNG VĂN BẢN (STICKY KHI CUỘN) */}
                  <div className="lg:col-span-6 xl:col-span-7 lg:sticky lg:top-3 self-start max-h-none lg:max-h-[calc(100vh-140px)] overflow-y-auto pr-0 lg:pr-1 custom-scrollbar">
                    <ReadingPassageView
                      text={passage.text}
                      title={title}
                      isMiniChallenge={isMiniChallenge}
                      fontSize={fontSize}
                      passageId={passage.id}
                      copiedPassageId={copiedPassageId}
                      onCopy={handleCopy}
                    />
                  </div>

                  {/* CỘT PHẢI: CÂU HỎI */}
                  <div className="lg:col-span-6 xl:col-span-5">
                    <ReadingQuestionsView
                      questions={questionsList}
                      answers={answers}
                      isMiniChallenge={isMiniChallenge}
                      isReviewMode={isReviewMode}
                      result={result}
                      onAnswer={onAnswer}
                      viewMode={viewMode}
                    />
                  </div>
                </div>
              ) : (
                /* BỐ CỤC XẾP CHỒNG (STACKED) */
                <div className="space-y-4">
                  <ReadingPassageView
                    text={passage.text}
                    title={title}
                    isMiniChallenge={isMiniChallenge}
                    fontSize={fontSize}
                    passageId={passage.id}
                    copiedPassageId={copiedPassageId}
                    onCopy={handleCopy}
                  />

                  <ReadingQuestionsView
                    questions={questionsList}
                    answers={answers}
                    isMiniChallenge={isMiniChallenge}
                    isReviewMode={isReviewMode}
                    result={result}
                    onAnswer={onAnswer}
                    viewMode={viewMode}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
