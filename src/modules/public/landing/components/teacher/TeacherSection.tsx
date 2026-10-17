import React from 'react'
import { TEACHER_DATA } from '../../data/teacher'
import { TeacherPortrait } from './TeacherPortrait'
import { TeacherMomentsGrid } from './TeacherMomentsGrid'
import { TeacherBio } from './TeacherBio'
import { TeacherAchievements } from './TeacherAchievements'
import { SectionHeader } from '../common/SectionHeader'

export const TeacherSection: React.FC = () => {
  return (
    <section id="teacher" className="py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <SectionHeader
          badge="Đội ngũ chuyên môn"
          title="Gặp Gỡ Người Thầy Truyền Cảm Hứng"
          titleHighlight="Megumi Class"
          description="Không đơn thuần là người dạy học, mà là người bạn đồng hành tin cậy, giúp bạn tháo gỡ từng nút thắt trong hành trình chinh phục Tiếng Anh & Tiếng Trung."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Portrait with Gradient Border & 2 Staggered Rows of Horizontal Photos */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-5 sm:gap-6">
            <TeacherPortrait
              name={TEACHER_DATA.name}
              role="Giảng viên Song ngữ"
              imageSrc={TEACHER_DATA.imageSrc}
              imageAlt={TEACHER_DATA.imageAlt}
            />
            <TeacherMomentsGrid />
          </div>

          {/* Right Column: Bio + Achievements */}
          <div className="lg:col-span-7 xl:col-span-7">
            <TeacherBio teacher={TEACHER_DATA} />
            <TeacherAchievements achievements={TEACHER_DATA.achievements} />
          </div>
        </div>
      </div>
    </section>
  )
}
