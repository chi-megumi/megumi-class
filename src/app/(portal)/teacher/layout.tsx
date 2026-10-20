import { getMe } from '~/actions/auth'
import { redirect } from 'next/navigation'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await getMe()

  const isTeacher = user?.role === 'teacher' || user?.role === 'TEACHER'
  const isAdmin = user?.systemRole === 'admin'

  if (!user || (!isTeacher && !isAdmin)) {
    redirect('/')
  }

  return <>{children}</>
}

