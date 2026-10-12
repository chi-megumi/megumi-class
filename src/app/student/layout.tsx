import AppHeader from '~/components/header/AppHeader'
import SideBar from '~/components/menu/Sidebar'
import '~/common/styles/components/MainLayout.scss'
import { getMe } from '~/actions/auth'
import UserProvider from '~/providers/UserProvider'
import { redirect } from 'next/navigation'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe()

  if (!user) {
    redirect('/')
  }
  // Allow teachers to preview student views
  const isAuthorized = user.role === 'student' || user.role === 'STUDENT' || user.role === 'teacher' || user.role === 'TEACHER'
  if (!isAuthorized) {
    redirect('/')
  }

  return (
    <UserProvider user={user}>
      <div className={`main-layout flex justify-center gap-3 ${user ? 'lg:pl-[280px]' : ''} print:pl-0 print:block print:w-full`}>
        {user && (
          <div className="print:hidden">
            <SideBar />
          </div>
        )}

        <div className="main-content-wrapper min-w-0 w-full max-w-[1200px] px-4 pr-[50px] print:p-6 print:m-0 print:max-w-none print:w-full">
          <div className="max-w-[900px] mx-auto w-full print:hidden">
            <AppHeader />
          </div>
          {children}

          <div className="text-center mt-10 text-slate-500 text-sm font-medium pb-8 print:hidden">
            🌸 Lớp học cô Chuy 🌸
          </div>
        </div>
      </div>
    </UserProvider>
  )
}
