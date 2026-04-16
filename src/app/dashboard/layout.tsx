import { Suspense } from 'react'
import { getRole } from '@/features/auth/helpers/role'
import { RoleSwitcher } from './_components/RoleSwitcher'

async function NavBar() {
  const role = await getRole()
  return (
    <nav className="flex items-center border-b bg-white px-6 py-4">
      <span className="font-semibold">Dashboard</span>
      <RoleSwitcher current={role} />
    </nav>
  )
}

export default function DashboardLayout({
  children,
  analytics,
  team,
  modal,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <nav className="flex items-center border-b bg-white px-6 py-4">
          <span className="font-semibold">Dashboard</span>
        </nav>
      }>
        <NavBar />
      </Suspense>
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <section className="lg:col-span-2">{children}</section>
        <aside className="space-y-4">{analytics}</aside>
        <aside className="space-y-4">{team}</aside>
      </div>
      <Suspense>{modal}</Suspense>
    </div>
  )
}
