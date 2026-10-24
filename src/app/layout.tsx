import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import '@/common/styles/index.scss'
import '@/common/styles/main.css'
import NavigationProgressBar from '@/components/navigation/NavigationProgressBar'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: '✨ Teen Life & Stress — Fun Flashcards Game ✨',
  description: 'Bộ 52 thẻ từ vựng tiếng Anh sống động',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`antialiased ${plusJakartaSans.variable}`}>
      <body className={`${plusJakartaSans.className} min-h-full flex flex-col`}>
        <NavigationProgressBar />
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
