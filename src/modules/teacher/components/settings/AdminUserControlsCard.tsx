'use client'

import { useState } from 'react'
import { ShieldCheck, Users, Search, Loader2 } from 'lucide-react'
import { adminSearchUsersAction, adminSetUserTypeAction } from '~/actions/admin/users'
import { AdminUserControlsCardProps, AdminUserItem, SettingsFeedback } from './types'
import AdminUserRow from './AdminUserRow'
import AdminUserSearchSkeleton from './loading/AdminUserSearchSkeleton'

export default function AdminUserControlsCard({
  classData,
  onRoleChanged,
}: AdminUserControlsCardProps) {
  const [subTab, setSubTab] = useState<'class' | 'global'>('class')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<AdminUserItem[]>([])
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<SettingsFeedback>(null)

  // Local state for class members to reflect immediate role updates
  const [memberRoleOverrides, setMemberRoleOverrides] = useState<Record<string, string>>({})

  // Format class enrollments as AdminUserItem
  const classMembers: AdminUserItem[] = classData.students.map((e) => {
    const override = memberRoleOverrides[e.student.id]
    return {
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
      avatarUrl: e.student.avatarUrl,
      userType: override || e.student.userType || 'student',
      systemRole: e.student.systemRole || 'client',
    }
  })

  // Handle role change execution
  const handleRoleChange = async (userId: string, newRole: 'student' | 'teacher') => {
    setLoadingUserId(userId)
    setFeedback(null)

    try {
      const res = await adminSetUserTypeAction({
        targetUserId: userId,
        newUserType: newRole,
      })

      if (res.success && res.data) {
        setFeedback({
          type: 'success',
          message: res.message || 'Cập nhật vai trò người dùng thành công',
        })
        setMemberRoleOverrides((prev) => ({ ...prev, [userId]: newRole }))

        // Update searchResults if currently looking at global search
        setSearchResults((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, userType: newRole } : u)),
        )

        onRoleChanged?.(userId, newRole)
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Không thể cập nhật vai trò',
        })
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'Lỗi kết nối máy chủ khi cập nhật vai trò',
      })
    } finally {
      setLoadingUserId(null)
    }
  }

  // Handle global search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setFeedback(null)

    try {
      const res = await adminSearchUsersAction({
        query: searchQuery.trim(),
        limit: 15,
      })
      if (res.success && res.data) {
        setSearchResults(
          res.data.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            avatarUrl: u.avatarUrl,
            userType: u.userType,
            systemRole: u.systemRole,
          })),
        )
      } else {
        setFeedback({ type: 'error', message: res.error || 'Tìm kiếm thất bại' })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Lỗi kết nối khi tìm kiếm người dùng' })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50/70 via-white/80 to-indigo-50/70 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-200/80 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-purple-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/20">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">Quản trị Hệ thống (Admin)</h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                Độc quyền Admin
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Phân quyền và chuyển đổi loại người dùng (Student ⇄ Teacher)
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-white/80 p-1 rounded-2xl border border-purple-200 shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => setSubTab('class')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'class'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users size={14} />
            Thành viên lớp ({classMembers.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('global')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subTab === 'global'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search size={14} />
            Tìm user hệ thống
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
              : 'bg-rose-50 border border-rose-100 text-rose-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Subtab 1: Class Members */}
      {subTab === 'class' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500 pb-1">
            <span>Danh sách thành viên đăng ký trong lớp học này:</span>
            <span>Tổng: {classMembers.length} thành viên</span>
          </div>

          {classMembers.length === 0 ? (
            <div className="text-center py-10 bg-white/50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
              Lớp học chưa có học sinh nào.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {classMembers.map((member) => (
                <AdminUserRow
                  key={member.id}
                  user={member}
                  isClassOwner={member.id === classData.teacherId}
                  loading={loadingUserId === member.id}
                  onRoleChange={handleRoleChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Global User Search */}
      {subTab === 'global' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên hoặc email người dùng cần tìm..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-purple-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 focus:border-purple-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Tìm kiếm
            </button>
          </form>

          {isSearching ? (
            <div className="py-2">
              <AdminUserSearchSkeleton count={3} />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
              {searchResults.map((user) => (
                <AdminUserRow
                  key={user.id}
                  user={user}
                  isClassOwner={user.id === classData.teacherId}
                  loading={loadingUserId === user.id}
                  onRoleChange={handleRoleChange}
                />
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
              Không tìm thấy người dùng nào phù hợp với từ khóa &quot;{searchQuery}&quot;.
            </div>
          ) : (
            <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
              Nhập email hoặc tên để tìm kiếm và set role cho bất kỳ user nào trong hệ thống.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
