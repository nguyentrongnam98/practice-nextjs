import { requireUser } from '../../_dal/auth'

export default async function LayoutGuarded({ children }: { children: React.ReactNode }) {
  // Throws-on-redirect; downstream renders only if session exists.
  await requireUser()
  return (
    <div className="rounded-md border-2 border-blue-300 bg-blue-50 p-4">
      <p className="mb-3 text-xs font-semibold text-blue-700">[LAYOUT GUARD]</p>
      {children}
    </div>
  )
}
