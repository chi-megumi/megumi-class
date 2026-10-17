'use client'

import { useEffect, useState } from 'react'
import Tabs from '~/components/tabs'
import { BookOpen, ChevronDown, ChevronRight, Folder, PlusCircle, Settings } from 'lucide-react'
import Link from 'next/link'
import { useUserStore } from '~/providers/UserProvider'
import { getTeacherClasses, getStudentClasses } from '~/actions/class'
import { usePathname } from 'next/navigation'

// Type inference from Prisma output or simple type
type ClassData = Awaited<ReturnType<typeof getTeacherClasses>>[0]

const MenuTabs = () => {
  const [activeSidebar, setActiveSidebar] = useState('class')
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({})
  const user = useUserStore((s) => s.user)
  const isTeacher = user?.role === 'teacher' || user?.role === 'TEACHER'

  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Extract classId and unitId from pathname if they exist
  // e.g., /student/classes/123/units/456 or /teacher/classes/123
  const activeClassIdMatch = pathname.match(/\/classes\/([^/]+)/)
  const activeClassId = activeClassIdMatch ? activeClassIdMatch[1] : null
  const activeUnitIdMatch = pathname.match(/\/units\/([^/]+)/)
  const activeUnitId = activeUnitIdMatch ? activeUnitIdMatch[1] : null

  useEffect(() => {
    let isMounted = true

    const fetchClasses = async () => {
      try {
        const data = isTeacher ? await getTeacherClasses() : await getStudentClasses()
        if (isMounted) {
          setClasses(data)
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
  }, [isTeacher])

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
          ...(isTeacher
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
        onChange={setActiveSidebar}
      />

      <>
        {activeSidebar === 'class' && (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-center text-sm text-gray-500 py-4">Đang tải...</div>
            ) : classes.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-4">Chưa có lớp học nào</div>
            ) : (
              classes.map((cls) => (
                <div key={cls.id} className="mb-2">
                  {/* Cấp Cha (Lớp học) */}
                  <div
                    onClick={() => toggleClass(cls.id)}
                    className={[
                      'flex items-center justify-between py-2 px-2 hover:bg-white rounded-xl cursor-pointer transition-all border border-transparent hover:border-gray-100 ',
                      isClassExpanded(cls.id) && 'bg-white',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span
                      className="font-medium text-gray-800 text-sm truncate max-w-30 flex items-center gap-1.5"
                      title={cls.name}
                    >
                      <Folder size={15} className="text-indigo-500 shrink-0" />
                      <span className="truncate">{cls.name}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {isTeacher && (
                        <Link
                          href={`/teacher/classes/${cls.id}`}
                          className="p-1 hover:bg-indigo-50 rounded text-gray-400 hover:text-indigo-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          title="Quản lý lớp học"
                        >
                          <Settings size={14} />
                        </Link>
                      )}
                      {isClassExpanded(cls.id) ? (
                        <ChevronDown size={18} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={18} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Cấp Con (Units) - Chỉ hiển thị khi được mở rộng */}
                  {isClassExpanded(cls.id) && (
                    <div className="mt-2 ml-5 flex flex-col gap-1 border-l-2 border-[#E5D9F2] pl-3 py-1 animate-in slide-in-from-top-2 fade-in duration-200">
                      {cls.units
                        .filter(unit => unit.isPublished)
                        .map((unit) => {
                        const isActiveUnit = activeUnitId === unit.id
                        return (
                          <Link
                            key={unit.id}
                            href={`/student/classes/${cls.id}/units/${unit.id}`}
                            className={[
                              'flex items-center gap-2 p-2.5 text-sm cursor-pointer rounded-xl transition-all font-medium',
                              isActiveUnit 
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                                : 'text-gray-600 hover:text-indigo-600 hover:bg-white'
                            ].join(' ')}
                            title={unit.title}
                          >
                            <BookOpen size={16} className={isActiveUnit ? "text-indigo-500 shrink-0" : "opacity-70 shrink-0"} />
                            <span className="truncate">{unit.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </>
      <>
        {activeSidebar === 'teacher' && (
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mt-2">
            <Link
              href="/teacher/classes/create"
              className="flex items-center gap-3 py-3 px-3 bg-white/60 hover:bg-white rounded-xl shadow-[0_2px_10px_rgba(106,94,235,0.05)] hover:shadow-[0_4px_15px_rgba(106,94,235,0.15)] cursor-pointer transition-all duration-300 border border-[#E5D9F2] hover:border-[#6A5EEB]/40 group"
            >
              <div className="bg-[#6A5EEB]/10 p-1.5 rounded-lg group-hover:bg-[#6A5EEB]/20 group-hover:scale-110 transition-all duration-300">
                <PlusCircle size={18} className="text-[#6A5EEB]" />
              </div>
              <span className="font-semibold text-gray-700 text-sm group-hover:text-[#6A5EEB] transition-colors">
                Tạo lớp học mới
              </span>
            </Link>
          </div>
        )}
      </>
    </div>
  )
}

export default MenuTabs
