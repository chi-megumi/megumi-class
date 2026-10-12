import type { Metadata } from 'next'
import './globals.css'
import '@/common/styles/index.scss'
import '@/common/styles/main.css'

export const metadata: Metadata = {
  title: '✨ Teen Life & Stress — Fun Flashcards Game ✨',
  description: 'Bộ 52 thẻ từ vựng tiếng Anh sống động',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,500;0,600;0,700;0,800;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
