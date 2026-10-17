export interface FooterLinkGroup {
  title: string
  links: { label: string; href: string; isExternal?: boolean }[]
}

export const FOOTER_LINKS: FooterLinkGroup[] = [
  {
    title: 'Khóa học nổi bật',
    links: [
      { label: 'Tiếng Trung HSK & HSKK Khẩu ngữ', href: '#contact' },
      { label: 'Tiếng Trung Giao tiếp Thực chiến', href: '#contact' },
      { label: 'Luyện thi IELTS & Tiếng Anh C1', href: '#contact' },
      { label: 'Tiếng Anh Phản xạ Doanh nghiệp', href: '#contact' },
      { label: 'Lớp Song ngữ Kèm 1:1 Đặc biệt', href: '#contact' },
    ],
  },
  {
    title: 'Khám phá Megumi',
    links: [
      { label: 'Về Cô Chi & Megumi Class', href: '#teacher' },
      { label: 'Phương pháp 4 Bước Đột Phá', href: '#methodology' },
      { label: 'Kho Flashcards Thông Minh', href: '#highlights' },
      { label: 'Cảm Nhận Từ Học Viên', href: '#testimonials' },
      { label: 'Đăng ký học thử 0đ', href: '#contact' },
    ],
  },
  {
    title: 'Hỗ trợ & Pháp lý',
    links: [
      { label: 'Chính sách bảo mật thông tin', href: '#contact' },
      { label: 'Điều khoản dịch vụ học tập', href: '#contact' },
      { label: 'Cam kết chuẩn đầu ra HSK & IELTS', href: '#contact' },
      { label: 'Câu hỏi thường gặp (FAQ)', href: '#contact' },
    ],
  },
]
