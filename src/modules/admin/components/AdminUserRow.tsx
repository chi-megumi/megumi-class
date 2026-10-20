'use client'

import { GraduationCap, Loader2, ShieldCheck, User, ArrowLeftRight, Calendar } from 'lucide-react'
import { AdminUserItem } from '~/actions/admin/users'

type AdminUserRowProps = {
  user: AdminUserItem
  isCurrentAdmin?: boolean
  loading?: boolean
  onRoleChange: (userId: string, newRole: 'student' | 'teacher') => Promise<void>
}

export default function AdminUserRow({
  user,
  isCurrentAdmin = false,
  loading = false,
  onRoleChange,
}: AdminUserRowProps) {
  const isTeacher = user.userType === 'teacher' || user.userType === 'TEACHER'
  const nextRole = isTeacher ? 'student' : 'teacher'

  // Format joined date
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border border-purple-100/80 shadow-xs hover:shadow-md hover:border-purple-200 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* User Info */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center shrink-0 shadow-sm overflow-hidden text-base">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-800 text-sm truncate">{user.name}</p>
            {isCurrentAdmin && (
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-bold">
                Bạn
              </span>
            )}
            {user.systemRole === 'admin' && (
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border border-rose-200/60">
                <ShieldCheck size={11} />
                Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
            <span className="truncate">{user.email}</span>
            {joinedDate && (
              <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                <Calendar size={11} />
                {joinedDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Role badge & Switch Action */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Vai trò:</span>
          {isTeacher ? (
            <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs flex items-center gap-1.5 border border-purple-200/80 shadow-2xs">
              <GraduationCap size={14} className="text-purple-600" />
              Giáo viên
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1.5 border border-blue-200/80 shadow-2xs">
              <User size={14} className="text-blue-600" />
              Học sinh
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRoleChange(user.id, nextRole)}
          disabled={loading || isCurrentAdmin}
          title={
            isCurrentAdmin
              ? 'Không thể thay đổi vai trò của chính bạn'
              : `Đổi thành ${isTeacher ? 'Học sinh' : 'Giáo viên'}`
          }
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs ${
            isTeacher
              ? 'bg-blue-50/80 text-blue-700 hover:bg-blue-100 border border-blue-200 hover:border-blue-300'
              : 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/20'
          }`}
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <ArrowLeftRight size={13} />
          )}
          <span>{isTeacher ? 'Chuyển về Học sinh' : 'Nâng lên Giáo viên'}</span>
        </button>
      </div>
    </div>
  )
}
