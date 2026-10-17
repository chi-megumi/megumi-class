import type { Metadata } from 'next'
import LandingPage from '@/modules/public/landing/components/LandingPage'

export const metadata: Metadata = {
  title: 'Megumi — Lớp Học Tiếng Anh & Tiếng Trung Cô Quỳnh Chi | Bứt Phá Phản Xạ',
  description:
    'Lớp học Song ngữ Anh - Trung Megumi cùng Cô Đoàn Quỳnh Chi (HSK 5 273/300, HSKK Cao cấp, IELTS C1, Cử nhân Biên phiên dịch). Phương pháp học phản xạ tự nhiên, flashcards thông minh và lộ trình cá nhân hóa.',
  keywords: [
    'tiếng Anh cô Chi',
    'tiếng Trung cô Chi',
    'học tiếng Trung Đà Nẵng',
    'học tiếng Anh Đà Nẵng',
    'luyện thi HSK Đà Nẵng',
    'HSK 5',
    'IELTS C1',
    'Đoàn Quỳnh Chi',
    'Megumi Class',
    'học tiếng Trung giao tiếp',
  ],
  openGraph: {
    title: 'Megumi — Lớp Học Tiếng Anh & Tiếng Trung Cô Quỳnh Chi',
    description:
      'Chinh phục Tiếng Anh và Tiếng Trung cùng Cô Đoàn Quỳnh Chi. Phương pháp flashcards tương tác thực chiến, phản xạ chuẩn bản ngữ và cam kết đầu ra bứt phá.',
    images: ['/images/landing/teacher-chi.jpg'],
    type: 'website',
  },
}

export default function Home() {
  return <LandingPage />
}
