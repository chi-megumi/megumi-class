import AdminDashboard from '~/modules/admin/components/AdminDashboard'
import { adminGetUsersAction } from '~/actions/admin/users'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const res = await adminGetUsersAction({
    query: '',
    role: 'all',
    limit: 50,
  })

  const initialUsers = res.success && res.data ? res.data.users : []
  const initialStats =
    res.success && res.data ? res.data.stats : { total: 0, teachers: 0, students: 0, admins: 0 }

  return (
    <div className="w-full mx-auto pt-2 pb-10">
      <AdminDashboard initialUsers={initialUsers} initialStats={initialStats} />
    </div>
  )
}
