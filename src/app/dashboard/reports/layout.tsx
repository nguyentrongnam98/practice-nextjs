import { Suspense } from 'react'
import { getRole } from '@/features/auth/helpers/role'

async function ReportsContent({
  admin,
  user,
}: {
  admin: React.ReactNode
  user: React.ReactNode
}) {
  const role = await getRole()
  return (
    <>
      <header className="mb-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase">Reports</h2>
        <p className="text-xs text-gray-500">Visible role: {role}</p>
      </header>
      {role === 'admin' ? admin : user}
    </>
  )
}

export default function ReportsLayout({
  admin,
  user,
}: {
  admin: React.ReactNode
  user: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <Suspense fallback={<div className="animate-pulse h-32 rounded bg-gray-100" />}>
        <ReportsContent admin={admin} user={user} />
      </Suspense>
    </div>
  )
}
