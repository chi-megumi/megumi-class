import AppHeader from '~/components/header/AppHeader'
import SideBar from '~/components/menu/Sidebar'
import '~/common/styles/components/MainLayout.scss'
import { getMe } from '~/actions/auth'
import UserProvider from '~/providers/UserProvider'
import { redirect } from 'next/navigation'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe()

  const isTeacher = user?.role === 'teacher' || user?.role === 'TEACHER'
  const isAdmin = user?.systemRole === 'admin'

  if (!user || (!isTeacher && !isAdmin)) {
    redirect('/')
  }

  return (
    <UserProvider user={user}>
      <div className={`main-layout flex justify-center gap-3 ${user ? 'lg:pl-[280px]' : ''}`}>
        {user && <SideBar />}

        <div className="main-content-wrapper min-w-0 w-full max-w-[1200px] px-4 pr-[50px]">
          <div className="max-w-[900px] mx-auto w-full">
            <AppHeader />
          </div>
          {children}

          <div className="text-center mt-10 text-slate-500 text-sm font-medium pb-8">
            🌸 Lớp học cô Chuy 🌸
          </div>
        </div>
      </div>
    </UserProvider>
  )
}
