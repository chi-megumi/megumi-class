'use client'

import React from 'react'

type TestBuilderPaperHeaderProps = {
  testTitle: string
  testDuration: number
  isRetakable: boolean
}

export default function TestBuilderPaperHeader({
  testTitle,
  testDuration,
  isRetakable,
}: TestBuilderPaperHeaderProps) {
  const durationNum = Number(testDuration)
  const isMiniChallenge = durationNum <= 15

  if (isMiniChallenge) {
    return (
      <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl shadow-lg border-4 border-white p-8 text-center relative overflow-hidden transform rotate-1">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
        <h1 className="text-3xl font-black text-white uppercase tracking-wide mb-2 drop-shadow-md">
          🚀 {testTitle}
        </h1>
        <p className="text-white/90 font-bold bg-black/20 inline-block px-4 py-1 rounded-full text-sm">
          ⚡ Thử thách chớp nhoáng: {testDuration} phút • {isRetakable ? 'Luyện tập' : 'Làm 1 lần'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-t-2xl rounded-b-lg shadow-sm border border-gray-200 p-8 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
      <h1 className="text-3xl font-black text-gray-900 uppercase tracking-wide mb-2">
        {testTitle}
      </h1>
      <div className="flex items-center justify-center gap-2.5 text-sm font-medium text-gray-500 flex-wrap">
        <span>Thời gian làm bài: {testDuration} phút</span>
        <span>•</span>
        <span
          className={
            isRetakable ? 'text-emerald-600 font-semibold' : 'text-indigo-600 font-semibold'
          }
        >
          {isRetakable ? '🔄 Luyện tập (Làm lại tự do)' : '🔒 Bài thi (Nộp 1 lần)'}
        </span>
        <span>•</span>
        <span>Không sử dụng tài liệu</span>
      </div>
    </div>
  )
}
