'use client'

import React from 'react'
import { AlertTriangle } from 'lucide-react'

type HardQuestionsAlertProps = {
  hardQuestionsCount: number
}

export default function HardQuestionsAlert({ hardQuestionsCount }: HardQuestionsAlertProps) {
  if (hardQuestionsCount <= 0) return null

  return (
    <div className="p-4 bg-gradient-to-r from-rose-50 via-red-50/60 to-orange-50 border border-rose-200 rounded-2xl flex items-start gap-3.5">
      <div className="p-2 bg-rose-500 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
        <AlertTriangle size={18} />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-rose-900 text-sm">
          Lỗ hổng kiến thức: Phát hiện {hardQuestionsCount} câu hỏi có tỷ lệ sai trên 50%!
        </h4>
        <p className="text-xs text-rose-700/90 mt-1 leading-relaxed">
          Phần lớn học sinh trong lớp đang làm sai hoặc bị bẫy ở những câu này. Thầy/cô nên lọc mục{' '}
          <b>&quot;Câu hỏi khó&quot;</b> bên dưới để xem chi tiết các đáp án sai phổ biến và củng cố
          lại kiến thức cho các em trong buổi học tiếp theo.
        </p>
      </div>
    </div>
  )
}
