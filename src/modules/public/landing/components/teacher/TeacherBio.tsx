import React from 'react'
import { TeacherInfo } from '../../types/landing'
import { CheckCircle2, Quote } from 'lucide-react'

interface TeacherBioProps {
  teacher: TeacherInfo
}

export const TeacherBio: React.FC<TeacherBioProps> = ({ teacher }) => {
  return (
    <div className="flex flex-col">
      {/* Role Tag & Name */}
      <div className="mb-4">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
          {teacher.role}
        </span>
        <h3 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
          {teacher.name}
        </h3>
        <p className="mt-1 text-sm sm:text-base font-semibold text-pink-600">
          {teacher.tagline}
        </p>
      </div>

      {/* Inspirational Quote Card */}
      <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-pink-50/70 via-indigo-50/50 to-white border border-pink-100 shadow-xs mb-6">
        <Quote
          size={32}
          className="text-pink-300 absolute top-4 right-4 pointer-events-none opacity-60"
        />
        <p className="relative text-sm sm:text-base font-medium text-slate-700 italic leading-relaxed">
          {teacher.quote}
        </p>
      </div>

      {/* Bio Paragraphs */}
      <div className="space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
        {teacher.bioParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Credentials Checklist */}
      <div className="mt-6 pt-6 border-t border-slate-200/70">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
          Bằng cấp & Chứng chỉ chuyên môn:
        </h4>
        <ul className="space-y-2">
          {teacher.credentials.map((cred, index) => (
            <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>{cred}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
