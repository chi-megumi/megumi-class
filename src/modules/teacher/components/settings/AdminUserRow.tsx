'use client'

import { GraduationCap, Loader2, ShieldCheck, User, ArrowLeftRight } from 'lucide-react'
import { AdminUserItem } from './types'

type AdminUserRowProps = {
  user: AdminUserItem
  isClassOwner?: boolean
  loading?: boolean
  onRoleChange: (userId: string, newRole: 'student' | 'teacher') => Promise<void>
}

export default function AdminUserRow({
  user,
  isClassOwner = false,
  loading = false,
  onRoleChange,
}: AdminUserRowProps) {
  const isTeacher = user.userType === 'teacher' || user.userType === 'TEACHER'
  const nextRole = isTeacher ? 'student' : 'teacher'

  return (
    <div className="p-4 rounded-2xl bg-white/90 border border-purple-100/60 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* User info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user.name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-800 text-sm truncate">{user.name}</p>
            {user.systemRole === 'admin' && (
              <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={10} />
                Admin
              </span>
            )}
            {isClassOwner && (
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                Chủ nhiệm
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>

      {/* Role badge & Switch Action */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Vai trò:</span>
          {isTeacher ? (
            <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1 border border-purple-200">
              <GraduationCap size={13} />
              Giáo viên
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1 border border-blue-200">
              <User size={13} />
              Học sinh
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRoleChange(user.id, nextRole)}
          disabled={loading || isClassOwner}
          title={
            isClassOwner
              ? 'Không thể đổi vai trò của giáo viên chủ nhiệm lớp'
              : `Đổi thành ${isTeacher ? 'Học sinh' : 'Giáo viên'}`
          }
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isTeacher
              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          {loading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <ArrowLeftRight size={13} />
          )}
          <span>{isTeacher ? 'Set thành Học sinh' : 'Set thành Giáo viên'}</span>
        </button>
      </div>
    </div>
  )
}
