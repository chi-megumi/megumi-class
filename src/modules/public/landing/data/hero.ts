import { PolaroidPhoto } from '../types/landing'

export const HERO_CONFIG = {
  badge: '🌸 Lớp học Song ngữ Anh - Trung Megumi — Cùng Cô Chi bứt phá',
  titleHighlight: 'Chinh Phục Ngoại Ngữ',
  subtitle: 'Song ngữ Anh - Trung',
  titleRest: 'Bằng Trọn Vẹn Niềm Vui & Bản Lĩnh Tự Tin',
  description:
    'Xóa bỏ rào cản phát âm và nỗi sợ từ vựng. Tại Megumi, bạn được Cô Chi trực tiếp hướng dẫn theo lộ trình cá nhân hóa, làm chủ từ vựng tiếng Anh và chữ Hán tiếng Trung qua flashcards thông minh, tự tin phản xạ trong học tập lẫn công việc.',
  primaryCtaText: 'Đăng ký học thử miễn phí',
  secondaryCtaText: 'Xem cảm nhận học viên',
  trustMetrics: [
    { value: 'HSK 5 & IELTS C1', label: 'Chứng chỉ kép xuất sắc' },
    { value: 'Song ngữ Anh - Trung', label: 'Lộ trình cá nhân hóa' },
    { value: '4.9/5 ⭐', label: 'Học viên hài lòng' },
  ],
}

export const POLAROID_PHOTOS: PolaroidPhoto[] = [
  {
    id: 'polaroid-tutoring',
    title: 'Học Kèm Tận Tâm',
    caption: 'Cô Chi hướng dẫn flashcards phản xạ',
    imageSrc: '/images/landing/polaroid-tutoring.jpg',
    imageAlt: 'Cô Chi kèm cặp học sinh với flashcards',
    tiltDeg: -6,
    leftPercent: -4,
    topPercent: 8,
    zIndex: 10,
    badgeText: '✨ Kèm sát 1:1',
  },
  {
    id: 'polaroid-group',
    title: 'Tự Tin Bứt Phá',
    caption: 'Học viên đạt điểm cao HSK & IELTS',
    imageSrc: '/images/landing/polaroid-group.jpg',
    imageAlt: 'Học viên Megumi vui mừng đạt điểm cao',
    tiltDeg: 5,
    rightPercent: -4,
    bottomPercent: 8,
    zIndex: 12,
    badgeText: '🎉 Chuẩn đầu ra',
  },
]
