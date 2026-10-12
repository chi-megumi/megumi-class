import AppHeader from '~/components/header/AppHeader'
import SideBar from '~/components/menu/Sidebar'
import '~/common/styles/components/MainLayout.scss'
import { getMe } from '~/actions/auth'
import UserProvider from '~/providers/UserProvider'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe()

  return (
    <UserProvider user={user}>
      <div className="main-layout flex justify-center gap-3">
        {user && <SideBar />}

        <div className="main-content-wrapper min-w-0 w-full max-w-[900px] px-4">
          <AppHeader />
          {children}

          <div className="text-center mt-10 text-slate-500 text-sm font-medium">
            🌸 Lớp học cô Chuy 🌸
          </div>
        </div>
      </div>
    </UserProvider>
  )
}
