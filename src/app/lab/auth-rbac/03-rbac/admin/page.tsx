import { getSession } from '../../_dal/session'

export default async function AdminHome() {
  const session = await getSession()
  return (
    <div className="text-sm">
      <p>
        ✓ Admin dashboard. Hello, <strong>{session!.user.name}</strong>.
      </p>
      <p className="mt-2 text-xs text-gray-500">
        If you visited this directly without being an admin, the layout guard already redirected you to
        the parent with <code>?reason=forbidden</code>.
      </p>
    </div>
  )
}
