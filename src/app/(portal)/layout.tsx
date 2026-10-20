import AppHeader from '~/components/header/AppHeader'
import SideBar from '~/components/menu/Sidebar'
import '~/common/styles/components/MainLayout.scss'
import { getMe } from '~/actions/auth'
import UserProvider from '~/providers/UserProvider'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe()

  return (
    <UserProvider user={user}>
      <div
        className={`main-layout flex justify-center lg:gap-3 ${
          user ? 'lg:pl-[260px]' : ''
        } print:pl-0 print:block print:w-full`}
      >
        {user && (
          <div className="print:hidden">
            <SideBar position="left" />
          </div>
        )}

        <div className="main-content-wrapper min-w-0 w-full max-w-[1200px] lg:px-4 print:p-6 print:m-0 print:max-w-none print:w-full">
          <div className="max-w-[900px] mx-auto w-full print:hidden">
            <AppHeader />
          </div>

          {children}

          <div className="text-center mt-10 text-slate-500 text-sm font-medium pb-8 print:hidden">
            🌸 Lớp học Cô Chi 🌸
          </div>
        </div>
      </div>
    </UserProvider>
  )
}
