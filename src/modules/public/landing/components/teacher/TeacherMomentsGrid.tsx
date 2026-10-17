import React from 'react'
import Image from 'next/image'
import { Sparkles, Users, BookOpen, HeartHandshake } from 'lucide-react'

interface MomentItem {
  id: string
  imageSrc: string
  alt: string
  label: string
  icon: React.ReactNode
  span: 'col-span-7' | 'col-span-5'
}

const MOMENTS_ROW_1: MomentItem[] = [
  {
    id: 'moment-1',
    imageSrc: '/images/landing/polaroid-tutoring.jpg',
    alt: 'Gia sư 1:1 kèm cặp sát sao cùng học viên',
    label: 'Kèm cặp 1:1 thực chiến',
    icon: <Sparkles size={12} className="text-pink-400 shrink-0" />,
    span: 'col-span-7',
  },
  {
    id: 'moment-2',
    imageSrc: '/images/landing/classroom-hero.jpg',
    alt: 'Không gian lớp học ấm áp, hiện đại',
    label: 'Không gian hiện đại',
    icon: <BookOpen size={12} className="text-indigo-400 shrink-0" />,
    span: 'col-span-5',
  },
]

const MOMENTS_ROW_2: MomentItem[] = [
  {
    id: 'moment-3',
    imageSrc: '/images/landing/polaroid-group.jpg',
    alt: 'Học viên hào hứng trong buổi học nhóm nhỏ',
    label: 'Không khí hào hứng',
    icon: <Users size={12} className="text-pink-400 shrink-0" />,
    span: 'col-span-5',
  },
  {
    id: 'moment-4',
    imageSrc: '/images/landing/teacher-classroom-horizontal.jpg',
    alt: 'Giáo trình cá nhân hóa và phương pháp trực quan',
    label: 'Sửa phát âm & phản xạ',
    icon: <HeartHandshake size={12} className="text-emerald-400 shrink-0" />,
    span: 'col-span-7',
  },
]

export const TeacherMomentsGrid: React.FC = () => {
  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Row 1: 7 cols - 5 cols (Same Height) */}
      <div className="grid grid-cols-12 gap-3.5">
        {MOMENTS_ROW_1.map((item) => (
          <div
            key={item.id}
            className={`${item.span} relative h-36 sm:h-40 md:h-44 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-xs hover:shadow-md hover:border-pink-300 transition-all duration-300 group`}
          >
            <Image
              src={item.imageSrc}
              alt={item.alt}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-1.5 text-white z-10">
              {item.icon}
              <span className="text-[11px] sm:text-xs font-bold leading-tight truncate text-white drop-shadow-sm">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: 5 cols - 7 cols (So-le / Staggered with Same Height) */}
      <div className="grid grid-cols-12 gap-3.5">
        {MOMENTS_ROW_2.map((item) => (
          <div
            key={item.id}
            className={`${item.span} relative h-36 sm:h-40 md:h-44 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-xs hover:shadow-md hover:border-pink-300 transition-all duration-300 group`}
          >
            <Image
              src={item.imageSrc}
              alt={item.alt}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent pointer-events-none" />
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-1.5 text-white z-10">
              {item.icon}
              <span className="text-[11px] sm:text-xs font-bold leading-tight truncate text-white drop-shadow-sm">
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
