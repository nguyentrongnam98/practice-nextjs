import { getRole } from '@/features/auth/helpers/role'

export default async function ReportsLayout({
  admin,
  user,
}: {
  admin: React.ReactNode
  user: React.ReactNode
}) {
  const role = await getRole()
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase">Reports</h2>
        <p className="text-xs text-gray-500">Visible role: {role}</p>
      </header>
      {role === 'admin' ? admin : user}
    </div>
  )
}
