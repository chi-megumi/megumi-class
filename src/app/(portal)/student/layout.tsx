import { getMe } from '~/actions/auth'
import { redirect } from 'next/navigation'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe()

  if (!user) {
    redirect('/')
  }
  // Allow teachers to preview student views
  const isAuthorized =
    user.role === 'student' ||
    user.role === 'STUDENT' ||
    user.role === 'teacher' ||
    user.role === 'TEACHER'
  if (!isAuthorized) {
    redirect('/')
  }

  return <>{children}</>
}

