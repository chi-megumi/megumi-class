import type { Metadata } from 'next'
import FlashcardsPage from '@/modules/public/flashcards/components/FlashcardsPage'
import { getVocabItems } from '@/actions/vocab'
import AppHeader from '~/components/header/AppHeader'
import SideBar from '~/components/menu/Sidebar'
import '~/common/styles/components/MainLayout.scss'
import { getMe } from '~/actions/auth'
import UserProvider from '~/providers/UserProvider'

export const metadata: Metadata = {
  title: 'Học Thử Flashcards — Megumi Class',
  description:
    'Trải nghiệm phương pháp học từ vựng và chữ Hán phản xạ thực chiến qua flashcards thông minh của Megumi Class.',
}

export default async function FlashcardsRoute() {
  const [vocabItems, user] = await Promise.all([getVocabItems(), getMe()])

  return (
    <UserProvider user={user}>
      <div
        className={`main-layout flex justify-center gap-3 ${
          user ? 'lg:pl-[280px]' : ''
        } print:pl-0 print:block print:w-full`}
      >
        {user && (
          <div className="print:hidden">
            <SideBar position="left" />
          </div>
        )}

        <div className="main-content-wrapper min-w-0 w-full max-w-[900px] px-4">
          <AppHeader />
          <main className="min-h-screen flex flex-col items-center py-10 w-full">
            <FlashcardsPage initialVocab={vocabItems} />
          </main>

          <div className="text-center mt-10 text-slate-500 text-sm font-medium pb-8 print:hidden">
            🌸 Lớp học Cô Chi 🌸
          </div>
        </div>
      </div>
    </UserProvider>
  )
}
