import { requireRole } from '../../_dal/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(['admin'])
  return (
    <div className="rounded-md border-2 border-rose-400 bg-rose-50 p-4">
      <p className="mb-3 text-xs font-semibold text-rose-700">[ADMIN LAYOUT GUARD]</p>
      {children}
    </div>
  )
}
