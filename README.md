# 🌸 Megumi Class — Nền Tảng Học Song Ngữ Anh - Trung & Quản Lý Lớp Học Thông Minh

<p align="center">
  <img src="docs/screenshots/hero-banner.png" alt="Megumi Class Banner" width="100%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</p>

<p align="center">
  <strong>Chinh Phục Ngoại Ngữ Bằng Trọn Vẹn Niềm Vui & Bản Lĩnh Tự Tin</strong><br>
  Lớp học Song ngữ Anh — Trung cùng <strong>Cô Đoàn Quỳnh Chi</strong> kết hợp cùng nền tảng số hóa học từ vựng, flashcards tương tác 3D và quản trị lớp học trực tuyến.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
</p>

---

## 📖 Mục Lục

- [Giới Thiệu Tổng Quan](#-giới-thiệu-tổng-quan)
- [Điểm Nổi Bật & Phương Pháp Giảng Dạy](#-điểm-nổi-bật--phương-pháp-giảng-dạy)
- [Hình Ảnh Giao Diện Thực Tế](#-hình-ảnh-giao-diện-thực-tế)
  - [1. Trang Chủ & Đội Ngũ Giảng Viên](#1-trang-chủ--đội-ngũ-giảng-viên)
  - [2. Trải Nghiệm Học Từ Vựng Flashcard 3D](#2-trải-nghiệm-học-từ-vựng-flashcard-3d)
  - [3. Luyện Tập Tương Tác: Quiz & Match Game](#3-luyện-tập-tương-tác-quiz--match-game)
  - [4. Cảm Nhận Học Viên & Đăng Ký Học Thử](#4-cảm-nhận-học-viên--đăng-ký-học-thử)
- [Hệ Thống Phân Quyền & Tính Năng](#-hệ-thống-phân-quyền--tính-năng)
- [Kiến Trúc & Công Nghệ](#-kiến-trúc--công-nghệ)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Hướng Dẫn Cài Đặt & Khởi Chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
- [Thông Tin Liên Hệ](#-thông-tin-liên-hệ)

---

## 🌟 Giới Thiệu Tổng Quan

**Megumi Class** (`megumi-eng-next`) là ứng dụng web giáo dục toàn diện, kết hợp giữa website giới thiệu lớp học cao cấp và nền tảng học tập số hóa (LMS & Interactive Learning Platform). Dự án được thiết kế chuyên biệt cho các khóa đào tạo **Tiếng Anh** và **Tiếng Trung Quốc** theo định hướng phản xạ tự nhiên và ứng dụng thực tiễn.

Hệ thống được sáng lập và bảo chứng chất lượng bởi **Cô Đoàn Quỳnh Chi**:

- 🎓 **Cử nhân Biên — Phiên dịch** Trường Đại học Ngoại ngữ — Đại học Đà Nẵng (Học bổng Sinh viên Xuất sắc).
- 🏆 **Chứng chỉ HSK 5 đạt 273/300** & chứng chỉ **HSKK Cao cấp** (phát âm chuẩn bản xứ, diễn đạt sắc sảo).
- 📜 **Chứng chỉ Tiếng Anh Quốc tế IELTS C1** (giao tiếp học thuật & tư duy ngôn ngữ bản xứ).
- 🌏 Kinh nghiệm thực chiến quốc tế tại **Ban iGV — Tổ chức Thanh niên Quốc tế AIESEC** và điều phối tại **Nhà ga Quốc tế T2 — Sân bay Quốc tế Đà Nẵng**.

---

## 🚀 Điểm Nổi Bật & Phương Pháp Giảng Dạy

Megumi Class áp dụng mô hình **Quy trình 4 Bước Đột Phá Khả Năng Phản Xạ**, tích hợp giữa phương pháp khoa học thần kinh về trí nhớ ngắn hạn/dài hạn và ứng dụng thực tiễn:

1. **Khơi Gợi Hứng Thú & Ngữ Cảnh Văn Hóa (Contextual Immersion)**: Học ngoại ngữ gắn liền với bối cảnh giao lưu quốc tế thực tế, giải phóng nỗi sợ nói sai.
2. **Nạp Từ Vựng & Chữ Hán Với Smart Flashcards (Active Recall & Spaced Repetition)**: Ghi nhớ từ vựng tiếng Anh kèm phiên âm IPA chuẩn xác, bộ thủ và pinyin chữ Hán thông qua thuật toán lặp lại ngắt quãng.
3. **Luyện Phản Xạ Khẩu Ngữ Thực Chiến 1:1 (Real-time Speaking Drill)**: Chỉnh sửa ngữ điệu, trọng âm tiếng Anh và thanh điệu tiếng Trung trực tiếp trên lớp.
4. **Hệ Thống Hóa & Đo Lường Chuẩn Hóa (Mastery & Growth Tracking)**: Làm bài kiểm tra mô phỏng HSK & IELTS định kỳ, biểu đồ hóa tiến độ và nhận xét chi tiết sau mỗi tuần học.

---

## 📸 Hình Ảnh Giao Diện Thực Tế

### 1. Trang Chủ & Đội Ngũ Giảng Viên

Giao diện trang chủ được xây dựng với phong cách thiết kế hiện đại, gam màu tươi sáng, typography chỉn chu và hiệu ứng polaroid sinh động.

|                Trang Chủ & Thông Điệp Đầu Tiên                |               Hồ Sơ Giảng Viên Cô Đoàn Quỳnh Chi               |
| :-----------------------------------------------------------: | :------------------------------------------------------------: |
|       ![Hero Banner](docs/screenshots/hero-banner.png)        |    ![Teacher Profile](docs/screenshots/landing-teacher.png)    |
| _Hero banner truyền cảm hứng cùng các lớp kèm chất lượng cao_ | _Bằng cấp chuyên môn, kinh nghiệm thực chiến & cam kết đầu ra_ |

---

### 2. Trải Nghiệm Học Từ Vựng Flashcard 3D

Nền tảng Flashcard 3D hỗ trợ học viên chủ động ôn tập từ vựng, tra cứu phát âm, xem ví dụ thực tế và phân loại từ theo chủ đề.

|                  Mặt Trước: Từ Vựng, Phát Âm & Emoji                  |             Mặt Sau: Nghĩa Tiếng Việt, Collocation & Ví Dụ              |
| :-------------------------------------------------------------------: | :---------------------------------------------------------------------: |
|          ![Flashcard Front](docs/screenshots/flashcards.png)          |        ![Flashcard Back](docs/screenshots/flashcard-flipped.png)        |
| _Hiển thị từ, phiên âm IPA, từ loại, emoji minh họa và phát âm audio_ | _Giải thích nghĩa chi tiết, bí quyết kết hợp từ và câu ví dụ highlight_ |

> **Phím tắt nhanh**:
>
> - <kbd>Space</kbd>: Lật thẻ (Flip Card 3D)
> - <kbd>→</kbd> / <kbd>←</kbd>: Chuyển từ kế tiếp / trước đó
> - <kbd>S</kbd>: Nghe phát âm chuẩn bản ngữ
> - <kbd>M</kbd>: Đánh dấu đã thuộc từ (Mastered)

---

### 3. Luyện Tập Tương Tác: Quiz & Match Game

Học viên củng cố kiến thức và rèn luyện phản xạ thông qua các mini-game và chế độ kiểm tra tương tác:

|               Đố Vui Trắc Nghiệm (Interactive Quiz)                |             Trò Chơi Ghép Thẻ Tính Giờ (Match Game)              |
| :----------------------------------------------------------------: | :--------------------------------------------------------------: |
|        ![Quiz Mode](docs/screenshots/quiz-interactive.png)         |      ![Match Game](docs/screenshots/match-game-playing.png)      |
| _Chế độ tính điểm (Scored) hoặc bất tận (Endless) với 4 phương án_ | _Nối từ vựng với nghĩa tiếng Việt tương ứng theo thời gian thực_ |

---

### 4. Cảm Nhận Học Viên & Đăng Ký Học Thử

|             Quy Trình 4 Bước Đột Phá Phản Xạ             |           Đánh Giá & Cảm Nhận 5 Sao Từ Học Viên            |
| :------------------------------------------------------: | :--------------------------------------------------------: |
| ![Methodology](docs/screenshots/landing-methodology.png) | ![Testimonials](docs/screenshots/landing-testimonials.png) |
|      _Phương pháp 4 bước khoa học chuẩn hóa đầu ra_      |       _Hơn 1,200+ học viên đạt mục tiêu HSK & IELTS_       |

<p align="center">
  <img src="docs/screenshots/landing-consultation.png" alt="Form Đăng Ký Tư Vấn & Học Thử" width="90%" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);" />
  <br>
  <em>Form đăng ký tư vấn lộ trình cá nhân hóa và trải nghiệm 01 buổi học thử miễn phí</em>
</p>

---

## 🛡️ Hệ Thống Phân Quyền & Tính Năng

### 🌸 Dành Cho Khách Vãng Lai & Người Học Thử (`Public`)

- Khám phá thông tin các khóa học Song ngữ Anh — Trung (HSK 1 - 5, HSKK, Giao tiếp, IELTS Foundation).
- Trải nghiệm trực tiếp bộ Flashcards thông minh kèm âm thanh chuẩn bản ngữ.
- Đăng ký tư vấn kiểm tra năng lực và học thử 01 buổi miễn phí.

### 🎒 Dành Cho Học Viên (`Student Portal`)

- **Quản lý Lớp Học**: Tham gia lớp học qua Mã mời (Invite Code).
- **Học Từ Vựng Theo Unit**: Truy cập các bộ thẻ từ vựng độc quyền do giáo viên biên soạn.
- **Tiến Độ Học Tập**: Theo dõi phần trăm ghi nhớ (Mastery Progress), danh sách từ vựng yêu thích (Starred items), lịch sử luyện tập.
- **Bài Kiểm Tra (Exams)**: Làm bài thi trắc nghiệm có giới hạn thời gian, xem kết quả và lời giải chi tiết.

### 🎓 Dành Cho Giáo Viên (`Teacher Portal`)

- **Quản Lý Lớp Học**: Tạo lớp, cấp mã mời học viên tham gia, duyệt danh sách lớp.
- **Biên Soạn Nội Dung Học**: Quản lý Unit, thêm mới từ vựng/chữ Hán (IPA, ngữ nghĩa, ví dụ, tip ghi nhớ).
- **Soạn Đề Thi Trực Tuyến**: Cấu hình bài kiểm tra (thời lượng, chế độ làm lại, kích hoạt hiển thị).
- **Báo Cáo Tiến Độ**: Theo dõi chi tiết điểm số, số lần luyện tập của từng học viên.

### ⚙️ Dành Cho Quản Trị Viên (`Admin Portal`)

- **Quản Lý Người Dùng**: Danh sách tài khoản, phân quyền hệ thống (`admin`, `teacher`, `student`), kích hoạt / khóa tài khoản.
- **Quản Lý Đăng Ký Tư Vấn**: Tiếp nhận, phân loại và cập nhật trạng thái học viên đăng ký (`pending`, `contacted`, `enrolled`).
- **Thống Kê Tổng Quan**: Số lượng tài khoản, lớp học và lượt đăng ký mới.

---

## 💻 Kiến Trúc & Công Nghệ

```mermaid
graph TD
    Client[Next.js 16 App Router / React 19] -->|Server Actions & API| Server[Next.js Server Runtime]
    Server -->|ORM Queries| Prisma[Prisma ORM 6]
    Prisma -->|PostgreSQL Connection| DB[(PostgreSQL Database)]
    Client -->|Zustand Persist| LocalStorage[(Client LocalStorage)]
    Server -->|Email Service| Resend[Resend / Nodemailer]
```

- **Frontend Framework**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/).
- **Ngôn Ngữ**: [TypeScript 5](https://www.typescriptlang.org/).
- **Giao Diện & Styling**:
  - [Tailwind CSS v4](https://tailwindcss.com/)
  - Sass / SCSS Modules (cho animations, hiệu ứng lật thẻ 3D, marquees)
  - [Lucide React](https://lucide.dev/) (Iconography)
  - [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) (Hiệu ứng chúc mừng hoàn thành bài)
- **Quản Lý State & Form**:
  - [Zustand](https://github.com/pmndrs/zustand) (Client store & persistence cho Flashcards)
  - [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) (Validation mạnh mẽ)
- **Cơ Sở Dữ Liệu & Backend**:
  - [Prisma ORM 6](https://www.prisma.io/)
  - [PostgreSQL](https://www.postgresql.org/) (hỗ trợ Docker / Supabase / Neon)
  - Next.js Server Actions
- **Bảo Mật & Xác Thực**:
  - [Jose](https://github.com/panva/jose) (JWT signing & verification)
  - [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) (Mã hóa mật khẩu)
  - HTTP-only Cookies
- **Dịch Vụ Email**: [Resend](https://resend.com/) & [Nodemailer](https://nodemailer.com/).

---

## 📂 Cấu Trúc Dự Án

```
megumi-eng-next/
├── prisma/
│   ├── schema.prisma       # Định nghĩa lược đồ cơ sở dữ liệu Prisma
│   └── seed.ts             # Script tạo dữ liệu khởi tạo
├── public/
│   ├── images/
│   │   ├── landing/        # Hình ảnh minh họa lớp học, chân dung Cô Chi
│   │   └── screenshots/    # Ảnh chụp màn hình giao diện thực tế
│   └── icons.svg
├── src/
│   ├── actions/            # Next.js Server Actions (Auth, Lớp học, Từ vựng, Đăng ký)
│   ├── app/
│   │   ├── (main)/         # Tuyến đường Public (Trang chủ Landing Page)
│   │   ├── (portal)/       # Tuyến đường Portal (Student, Teacher, Admin, Flashcards)
│   │   ├── api/            # API Endpoints
│   │   ├── globals.css     # Cấu hình Tailwind CSS v4 & theme tokens
│   │   └── layout.tsx      # Root Layout
│   ├── components/         # Các components dùng chung (Flashcards 3D, Auth Modals, UI)
│   ├── modules/
│   │   ├── admin/          # Module quản trị hệ thống
│   │   ├── public/         # Module landing page, giới thiệu, flashcards thử
│   │   ├── student/        # Module dành cho học viên
│   │   └── teacher/        # Module dành cho giảng viên
│   └── types/              # TypeScript definitions & interfaces
├── docker-compose.yml      # Cấu hình container PostgreSQL chạy local
└── README.md
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Môi Trường

- **Node.js**: Phiên bản 20.x trở lên (khuyến nghị 22.x hoặc 23.x)
- **npm** / **pnpm** / **yarn**
- **Docker** (nếu muốn chạy PostgreSQL local) hoặc kết nối PostgreSQL bên ngoài

### 1. Clone Kho Mã Nguồn

```bash
git clone https://github.com/Mannj-nef/megumi-class.git
cd megumi-eng-next
```

### 2. Cài Đặt Dependencies

```bash
npm install
```

### 3. Cấu Hình Biến Môi Trường

Tạo file `.env` (hoặc sao chép từ mẫu):

```env
# Database URL (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/megumi_db?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/megumi_db?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Email Service (Tùy chọn)
RESEND_API_KEY="re_..."
EMAIL_FROM="Megumi Class <support@megumiclass.edu.vn>"
```

_(Tùy chọn) Khởi chạy PostgreSQL cục bộ qua Docker Compose:_

```bash
docker compose up -d
```

### 4. Đồng Bộ Cơ Sở Dữ Liệu

```bash
# Đẩy schema vào Database
npx prisma db push

# Hoặc chạy migration
npx prisma migrate dev

# Sinh mã Prisma Client
npx prisma generate
```

### 5. Khởi Chạy Môi Trường Phát Triển

```bash
npm run dev
```

Mở trình duyệt và truy cập: **[http://localhost:3000](http://localhost:3000)**

---

## 📜 Các Lệnh Script Tiện Ích

| Lệnh                | Mục Đích                                              |
| :------------------ | :---------------------------------------------------- |
| `npm run dev`       | Khởi chạy máy chủ phát triển Next.js                  |
| `npm run build`     | Đóng gói sản phẩm tối ưu cho Production               |
| `npm run start`     | Khởi chạy ứng dụng production sau khi build           |
| `npm run lint`      | Kiểm tra quy chuẩn mã nguồn với ESLint                |
| `npm run format`    | Định dạng lại mã nguồn tự động với Prettier           |
| `npx prisma studio` | Giao diện trực quan xem và chỉnh sửa dữ liệu Database |

---

## 📬 Thông Tin Liên Hệ

- 👩‍🏫 **Người sáng lập & Giảng viên**: Cô Đoàn Quỳnh Chi
- 📞 **Hotline / Zalo tư vấn 24/7**: `0912.640.176`
- ✉️ **Email giải đáp thắc mắc**: `chidoan995.work@gmail.com`
- 📍 **Địa chỉ lớp học trực tiếp**: Khu vực Ngũ Hành Sơn, TP. Đà Nẵng
- 🌐 **Hình thức đào tạo**: Lớp trực tiếp tại Đà Nẵng & Lớp Trực tuyến 1:1 toàn quốc

---

<p align="center">
  Made with ❤️ by <strong>Mạnh Quân</strong> • © 2026 Megumi Class. All rights reserved.
</p>
