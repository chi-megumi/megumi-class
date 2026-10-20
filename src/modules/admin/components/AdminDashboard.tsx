'use client'

import { useState, useCallback } from 'react'
import {
  ShieldCheck,
  Users,
  Search,
  GraduationCap,
  UserCheck,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useUserStore } from '~/providers/UserProvider'
import {
  adminGetUsersAction,
  adminSetUserTypeAction,
  AdminUserItem,
  AdminUserRoleFilter,
  AdminUserStats,
} from '~/actions/admin/users'
import AdminUserRow from './AdminUserRow'
import Skeleton from '~/components/skeleton/Skeleton'

type Feedback = {
  type: 'success' | 'error'
  message: string
} | null

interface AdminDashboardProps {
  initialUsers?: AdminUserItem[]
  initialStats?: AdminUserStats
}

export default function AdminDashboard({
  initialUsers = [],
  initialStats = { total: 0, teachers: 0, students: 0, admins: 0 },
}: AdminDashboardProps) {
  const currentUser = useUserStore((s) => s.user)

  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers)
  const [stats, setStats] = useState<AdminUserStats>(initialStats)
  const [roleFilter, setRoleFilter] = useState<AdminUserRoleFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)

  // Fetch users based on current filter & search
  const loadUsers = useCallback(async (query: string, role: AdminUserRoleFilter) => {
    setIsLoading(true)
    try {
      const res = await adminGetUsersAction({
        query,
        role,
        limit: 100,
      })

      if (res.success && res.data) {
        setUsers(res.data.users)
        setStats(res.data.stats)
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Không thể tải danh sách người dùng',
        })
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Lỗi mạng khi tải danh sách người dùng',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFilterChange = (newRole: AdminUserRoleFilter) => {
    setRoleFilter(newRole)
    loadUsers(submittedQuery, newRole)
  }

  // Handle live / form search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    setSubmittedQuery(trimmed)
    loadUsers(trimmed, roleFilter)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSubmittedQuery('')
    loadUsers('', roleFilter)
  }

  // Handle Role change
  const handleRoleChange = async (targetUserId: string, newRole: 'student' | 'teacher') => {
    setLoadingUserId(targetUserId)
    setFeedback(null)

    try {
      const res = await adminSetUserTypeAction({
        targetUserId,
        newUserType: newRole,
      })

      if (res.success && res.data) {
        setFeedback({
          type: 'success',
          message: res.message || 'Cập nhật vai trò người dùng thành công',
        })

        // Update local user state immediately
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, userType: newRole } : u)),
        )

        // Refresh stats
        setStats((prev) => {
          const wasTeacher = newRole === 'student'
          return {
            ...prev,
            teachers: wasTeacher ? Math.max(0, prev.teachers - 1) : prev.teachers + 1,
            students: wasTeacher ? prev.students + 1 : Math.max(0, prev.students - 1),
          }
        })
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Không thể cập nhật vai trò',
        })
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Lỗi kết nối khi cập nhật vai trò người dùng',
      })
    } finally {
      setLoadingUserId(null)
    }
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Card */}
      <div className="bg-gradient-to-br from-purple-50/90 via-white/95 to-indigo-50/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-200/80 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-600/25 shrink-0">
              <ShieldCheck size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  Quản trị Hệ thống
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-xs shadow-purple-600/30">
                  Độc quyền Admin
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Phân quyền và chuyển đổi loại người dùng (Student ⇌ Teacher), quản lý thành viên toàn hệ thống.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadUsers(submittedQuery, roleFilter)}
            disabled={isLoading}
            className="self-start sm:self-center flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-gray-700 hover:text-purple-600 border border-purple-100 shadow-2xs text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-purple-600' : ''} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Tất cả tài khoản</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              {stats.total}
            </span>
            <span className="text-xs text-gray-400">người dùng</span>
          </div>
        </div>

        {/* Teachers */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-purple-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Giáo viên</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center">
              <GraduationCap size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700">
              {stats.teachers}
            </span>
            <span className="text-xs text-purple-500/80">tài khoản</span>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-blue-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Học sinh</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-700">
              {stats.students}
            </span>
            <span className="text-xs text-blue-500/80">tài khoản</span>
          </div>
        </div>

        {/* Admins */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Quản trị viên</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700">
              {stats.admins}
            </span>
            <span className="text-xs text-rose-500/80">quản trị</span>
          </div>
        </div>
      </div>

      {/* 3. Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium flex items-center justify-between gap-3 shadow-xs transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* 4. Filter Toolbar & Search */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-purple-100/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => handleFilterChange('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                roleFilter === 'all'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Tất cả</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 text-[10px]">
                {stats.total}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('teacher')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                roleFilter === 'teacher'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap size={13} />
              <span>Giáo viên</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  roleFilter === 'teacher' ? 'bg-purple-700 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {stats.teachers}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                roleFilter === 'student'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCheck size={13} />
              <span>Học sinh</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  roleFilter === 'student' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {stats.students}
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                roleFilter === 'admin'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ShieldCheck size={13} />
              <span>Admin</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  roleFilter === 'admin' ? 'bg-rose-700 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {stats.admins}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full pl-10 pr-9 py-2 bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-200 focus:border-purple-400 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-md"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-2xl shadow-xs transition-all active:scale-95 shrink-0"
            >
              Tìm
            </button>
          </form>
        </div>

        {/* 5. User List Table / Rows */}
        <div className="pt-2">
          {isLoading ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-white border border-gray-100 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-11 h-11 rounded-2xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-48 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-32 rounded-xl" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-400 space-y-2">
              <Users size={32} className="mx-auto text-gray-300" />
              <p className="text-sm font-medium text-gray-600">
                {submittedQuery
                  ? `Không tìm thấy người dùng nào phù hợp với từ khóa "${submittedQuery}"`
                  : 'Không có người dùng nào trong danh mục này'}
              </p>
              {submittedQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1 pb-1">
                <span>
                  Danh sách người dùng{' '}
                  {submittedQuery ? (
                    <span>
                      với từ khóa &quot;<strong>{submittedQuery}</strong>&quot;
                    </span>
                  ) : (
                    ''
                  )}
                </span>
                <span>Hiển thị: {users.length} người dùng</span>
              </div>

              {users.map((user) => (
                <AdminUserRow
                  key={user.id}
                  user={user}
                  isCurrentAdmin={user.id === currentUser?.id}
                  loading={loadingUserId === user.id}
                  onRoleChange={handleRoleChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
