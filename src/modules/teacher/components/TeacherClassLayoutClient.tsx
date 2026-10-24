'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Copy, Check, Users, BookOpen, Settings, LayoutDashboard } from 'lucide-react'
import { ClassData, EnrollmentData } from '../types'

type TeacherClassLayoutClientProps = {
  classData: ClassData
  children: React.ReactNode
}

export default function TeacherClassLayoutClient({
  classData,
  children,
}: TeacherClassLayoutClientProps) {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)

  const pendingStudents = (classData.students || []).filter(
    (s: EnrollmentData) => s.status === 'pending'
  )

  const handleCopyCode = () => {
    if (classData.inviteCode) {
      navigator.clipboard.writeText(classData.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const basePath = `/teacher/classes/${classData.id}`

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard, href: basePath },
    {
      id: 'students',
      label: 'Quản lý học sinh',
      icon: Users,
      badge: pendingStudents.length,
      href: `${basePath}/students`,
    },
    { id: 'units', label: 'Bài học & Từ vựng', icon: BookOpen, href: `${basePath}/units` },
    { id: 'settings', label: 'Cài đặt', icon: Settings, href: `${basePath}/settings` },
  ]

  const isTabActive = (tab: (typeof tabs)[0]) => {
    if (tab.id === 'overview') {
      return pathname === basePath || pathname === `${basePath}/`
    }
    return pathname.startsWith(tab.href)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500" style={{ zoom: 0.8 }}>
      {/* Header Card */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl -z-10 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{classData.name}</h1>
            <p className="text-gray-500 line-clamp-2 max-w-2xl">
              {classData.description || 'Chưa có mô tả'}
            </p>
          </div>

          {classData.inviteCode && (
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 flex flex-col items-center shadow-sm shrink-0">
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
                Mã tham gia
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-indigo-900 tracking-widest">
                  {classData.inviteCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-2 hover:bg-indigo-100 text-indigo-500 rounded-xl transition-colors active:scale-95"
                  title="Copy mã"
                >
                  {copied ? (
                    <Check size={18} className="text-emerald-600" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = isTabActive(tab)
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#6A5EEB] text-white shadow-[0_4px_15px_rgba(106,94,235,0.2)]'
                  : 'bg-white/60 text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100'
              }`}
            >
              <Icon size={18} />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`ml-1.5 px-2 py-0.5 text-xs rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 min-h-[400px]">
        {children}
      </div>
    </div>
  )
}
