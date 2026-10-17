import { StatItem, FeatureItem } from '../types/landing'

export const STATS_ITEMS: StatItem[] = [
  {
    id: 'stat-hsk5',
    iconName: 'Award',
    value: 273,
    suffix: '/300 HSK 5',
    label: 'Điểm HSK 5 & HSKK Cao Cấp',
    sublabel: 'Điểm số xuất sắc, khẩu ngữ lưu loát chuẩn bản xứ',
  },
  {
    id: 'stat-ielts',
    iconName: 'BookCheck',
    value: 100,
    suffix: '% C1',
    label: 'Chuẩn Tiếng Anh IELTS C1',
    sublabel: 'Nền tảng giao tiếp & tư duy ngôn ngữ học thuật vững vàng',
  },
  {
    id: 'stat-vocab',
    iconName: 'Sparkles',
    value: 5000,
    suffix: '+',
    label: 'Từ vựng & Chữ Hán số hóa',
    sublabel: 'Flashcards thông minh nhớ sâu từ vựng và bộ thủ Hán tự',
  },
  {
    id: 'stat-scholarship',
    iconName: 'GraduationCap',
    value: 100,
    suffix: '%',
    label: 'Học Bổng Biên - Phiên Dịch',
    sublabel: 'Đại học Ngoại ngữ - Đại học Đà Nẵng, đào tạo chuyên sâu',
  },
]

export const HIGHLIGHT_FEATURES: FeatureItem[] = [
  {
    id: 'feat-bilingual',
    iconName: 'Compass',
    title: 'Đào Tạo Song Ngữ Anh — Trung',
    description:
      'Lựa chọn chuyên sâu Tiếng Anh, Tiếng Trung hoặc lộ trình Song ngữ tích hợp bám sát mục tiêu du học, thi chứng chỉ hay giao tiếp làm việc.',
    tag: 'Song ngữ',
    colorVariant: 'primary',
  },
  {
    id: 'feat-smart-flashcards',
    iconName: 'Brain',
    title: 'Hệ Thống Flashcards Số Megumi',
    description:
      'Học từ vựng tiếng Anh và chữ Hán tiếng Trung với hình ảnh trực quan, pinyin, audio chuẩn kết hợp thuật toán ngắt quãng giúp nhớ từ vĩnh viễn.',
    tag: 'Công nghệ',
    colorVariant: 'secondary',
  },
  {
    id: 'feat-interactive',
    iconName: 'Flame',
    title: 'Phản Xạ Thực Chiến Đa Văn Hóa',
    description:
      'Đúc kết từ trải nghiệm điều phối AIESEC và Nhà ga Quốc tế T2 Đà Nẵng, giúp học viên tự tin giao tiếp tự nhiên và giải tỏa nỗi sợ nói sai.',
    tag: 'Thực chiến',
    colorVariant: 'accent',
  },
  {
    id: 'feat-commitment',
    iconName: 'ShieldCheck',
    title: 'Kèm Cặp Sát Sao Từng Lộ Trình',
    description:
      'Lớp học quy mô nhỏ hoặc kèm 1:1, Cô Chi trực tiếp sửa từng âm đuôi tiếng Anh và thanh điệu tiếng Trung, theo dõi báo cáo tiến độ đều đặn.',
    tag: 'Tận tâm',
    colorVariant: 'warning',
  },
]
