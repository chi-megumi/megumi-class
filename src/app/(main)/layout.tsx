import { getMe } from '~/actions/auth'
import UserProvider from '~/providers/UserProvider'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe()

  return <UserProvider user={user}>{children}</UserProvider>
}
