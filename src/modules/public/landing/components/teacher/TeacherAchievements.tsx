import React from 'react'
import { TeacherAchievement } from '../../types/landing'
import { Award, BookCheck, Sparkles, Users } from 'lucide-react'

interface TeacherAchievementsProps {
  achievements: TeacherAchievement[]
}

const ICON_MAP = {
  Award,
  BookCheck,
  Sparkles,
  Users,
}

export const TeacherAchievements: React.FC<TeacherAchievementsProps> = ({ achievements }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {achievements.map((item) => {
        const IconComponent = ICON_MAP[item.iconName] || Sparkles

        return (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-white border border-slate-100 shadow-xs hover:border-pink-200 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                <IconComponent size={16} />
              </div>
              <span className="text-lg font-black text-slate-900 leading-none">
                {item.value}
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-800 leading-tight">
              {item.label}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
              {item.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}
