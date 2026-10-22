'use client'

import { useEffect, useState } from 'react'
import Tabs from '~/components/tabs'
import { BookOpen, ChevronDown, ChevronRight, Folder, PlusCircle, Settings, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useUserStore } from '~/providers/UserProvider'
import { getTeacherClasses, getStudentClasses } from '~/actions/class'
import { usePathname } from 'next/navigation'
import ClassesSkeleton from './loading/ClassesSkeleton'
import { sortUnits } from '~/modules/teacher/utils/unitSort'

// Type inference from Prisma output or simple type
type ClassData = Awaited<ReturnType<typeof getTeacherClasses>>[0]

interface MenuTabsProps {
  onNavigate?: () => void
  initialClasses?: ClassData[]
}

const MenuTabs = ({ onNavigate, initialClasses }: MenuTabsProps = {}) => {
  const pathname = usePathname()
  const isTeacherOrAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/teacher')
  const [selectedSidebar, setSelectedSidebar] = useState<'class' | 'teacher' | null>(null)
  const activeSidebar = selectedSidebar ?? (isTeacherOrAdminPath ? 'teacher' : 'class')

  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({})
  const user = useUserStore((s) => s.user)
  const isTeacher = user?.role === 'teacher' || user?.role === 'TEACHER'
  const isAdmin = user?.systemRole === 'admin' || user?.role === 'admin'
  const canSeeTeacherTab = isTeacher || isAdmin

  const [fetchedClasses, setFetchedClasses] = useState<ClassData[] | null>(null)
  const [loading, setLoading] = useState(initialClasses === undefined)

  const classes = initialClasses ?? fetchedClasses ?? []

  // Extract classId and unitId from pathname if they exist
  // e.g., /student/classes/123/units/456 or /teacher/classes/123
  const activeClassIdMatch = pathname.match(/\/classes\/([^/]+)/)
  const activeClassId = activeClassIdMatch ? activeClassIdMatch[1] : null
  const activeUnitIdMatch = pathname.match(/\/units\/([^/]+)/)
  const activeUnitId = activeUnitIdMatch ? activeUnitIdMatch[1] : null

  useEffect(() => {
    if (initialClasses !== undefined) {
      return
    }

    let isMounted = true

    const fetchClasses = async () => {
      try {
        const data = isTeacher ? await getTeacherClasses() : await getStudentClasses()
        if (isMounted) {
          setFetchedClasses(data)
        }
      } catch (err) {
        console.error('Failed to load classes', err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchClasses()

    return () => {
      isMounted = false
    }
  }, [isTeacher, initialClasses])

  const isClassExpanded = (classId: string) => {
    return expandedClasses[classId] ?? (classId === activeClassId)
  }

  const toggleClass = (classId: string) => {
    setExpandedClasses((prev) => {
      const current = prev[classId] ?? (classId === activeClassId)
      return {
        ...prev,
        [classId]: !current,
      }
    })
  }

  return (
    <div>
      <Tabs
        tabs={[
          {
            label: '👩‍🎓 Lớp học',
            value: 'class',
          },
          ...(canSeeTeacherTab
            ? [
                {
                  label: '👩‍🏫 Giáo viên',
                  value: 'teacher',
                },
              ]
            : []),
        ]}
        classNames={{ root: 'mb-3' }}
        active={activeSidebar}
        onChange={(val) => setSelectedSidebar(val as 'class' | 'teacher')}
      />

      <>
        {activeSidebar === 'class' && (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <ClassesSkeleton count={5} />
            ) : classes.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-4">Chưa có lớp học nào</div>
            ) : (
              classes.map((cls) => {
                const isClassActive = activeClassId === cls.id && !activeUnitId
                const isExpanded = isClassExpanded(cls.id)
                const publishedUnits = sortUnits(
                  (cls.units || []).filter((unit) => unit.isPublished)
                )

                return (
                  <div key={cls.id} className="mb-2">
                    {/* Cấp Cha (Lớp học) */}
                    <div
                      className={[
                        'group flex items-center justify-between py-1 px-2 rounded-xl transition-all border border-transparent hover:bg-white hover:border-gray-100',
                        (isExpanded || isClassActive) && 'bg-white',
                        isClassActive && 'border-indigo-100 shadow-xs',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <Link
                        href={`/student/classes/${cls.id}`}
                        onClick={() => {
                          setExpandedClasses((prev) => ({ ...prev, [cls.id]: true }))
                          onNavigate?.()
                        }}
                        className={[
                          'flex items-center gap-2 flex-1 min-w-0 py-1.5 px-1 rounded-lg text-sm transition-colors',
                          isClassActive
                            ? 'font-bold text-indigo-600'
                            : 'font-medium text-gray-700 hover:text-indigo-600',
                        ].join(' ')}
                        title={cls.name}
                      >
                        <Folder
                          size={16}
                          className={
                            isClassActive ? 'text-indigo-600 shrink-0' : 'text-indigo-500 shrink-0'
                          }
                        />
                        <span className="truncate">{cls.name}</span>
                      </Link>

                      <div className="flex items-center gap-0.5 shrink-0 ml-1">
                        {isTeacher && (
                          <Link
                            href={`/teacher/classes/${cls.id}`}
                            className="min-w-7 min-h-7 p-1 flex items-center justify-center hover:bg-indigo-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              onNavigate?.()
                            }}
                            title="Quản lý lớp học"
                          >
                            <Settings size={15} />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleClass(cls.id)
                          }}
                          className="min-w-7 min-h-7 p-1 flex items-center justify-center hover:bg-indigo-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          title={isExpanded ? 'Thu gọn bài học' : 'Mở rộng bài học'}
                          aria-label={isExpanded ? 'Thu gọn bài học' : 'Mở rộng bài học'}
                        >
                          {isExpanded ? (
                            <ChevronDown size={17} className="transition-transform duration-200" />
                          ) : (
                            <ChevronRight size={17} className="transition-transform duration-200" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Cấp Con (Units) - Chỉ hiển thị khi được mở rộng */}
                    {isExpanded && (
                      <div className="mt-2 ml-5 flex flex-col gap-1 border-l-2 border-[#E5D9F2] pl-3 py-1 animate-in slide-in-from-top-2 fade-in duration-200">
                        {publishedUnits.length === 0 ? (
                          <span className="text-xs text-gray-400 py-1 pl-1 italic">
                            Chưa có bài học
                          </span>
                        ) : (
                          publishedUnits.map((unit) => {
                            const isActiveUnit = activeUnitId === unit.id
                            return (
                              <Link
                                key={unit.id}
                                href={`/student/classes/${cls.id}/units/${unit.id}`}
                                onClick={() => onNavigate?.()}
                                className={[
                                  'flex items-center gap-2 p-2.5 text-sm cursor-pointer rounded-xl transition-all font-medium',
                                  isActiveUnit
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50'
                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-white',
                                ].join(' ')}
                                title={unit.title}
                              >
                                <BookOpen
                                  size={16}
                                  className={
                                    isActiveUnit ? 'text-indigo-500 shrink-0' : 'opacity-70 shrink-0'
                                  }
                                />
                                <span className="truncate">{unit.title}</span>
                              </Link>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </>
      <>
        {activeSidebar === 'teacher' && (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mt-2 space-y-2">
            <Link
              href="/teacher/classes/create"
              onClick={() => onNavigate?.()}
              className="flex items-center gap-3 py-3 px-3 bg-white/60 hover:bg-white rounded-xl shadow-[0_2px_10px_rgba(106,94,235,0.05)] hover:shadow-[0_4px_15px_rgba(106,94,235,0.15)] cursor-pointer transition-all duration-300 border border-[#E5D9F2] hover:border-[#6A5EEB]/40 group"
            >
              <div className="bg-[#6A5EEB]/10 p-1.5 rounded-lg group-hover:bg-[#6A5EEB]/20 group-hover:scale-110 transition-all duration-300">
                <PlusCircle size={18} className="text-[#6A5EEB]" />
              </div>
              <span className="font-semibold text-gray-700 text-sm group-hover:text-[#6A5EEB] transition-colors">
                Tạo lớp học mới
              </span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => onNavigate?.()}
                className={`flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer transition-all duration-300 border group ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-50/90 border-purple-300 shadow-[0_2px_12px_rgba(147,51,234,0.15)] text-purple-700'
                    : 'bg-white/60 hover:bg-white border-[#E5D9F2] hover:border-purple-300 shadow-[0_2px_10px_rgba(147,51,234,0.05)] hover:shadow-[0_4px_15px_rgba(147,51,234,0.12)]'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-all duration-300 ${
                    pathname.startsWith('/admin')
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/30'
                      : 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white group-hover:scale-110'
                  }`}
                >
                  <ShieldCheck size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-semibold text-sm transition-colors truncate ${
                      pathname.startsWith('/admin')
                        ? 'text-purple-700 font-bold'
                        : 'text-gray-700 group-hover:text-purple-700'
                    }`}
                  >
                    Quản trị hệ thống
                  </span>
                  <span className="text-[10px] text-purple-600 font-bold tracking-wide uppercase">
                    Admin
                  </span>
                </div>
              </Link>
            )}
          </div>
        )}
      </>
    </div>
  )
}

export default MenuTabs
