import { getMe } from '~/actions/auth'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Quản trị Hệ thống | Megumi English',
  description: 'Trang quản trị người dùng và phân quyền hệ thống',
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe()

  const isAdmin = user?.systemRole === 'admin'

  if (!user || !isAdmin) {
    redirect('/')
  }

  return <>{children}</>
}
