import { requireUser } from '../../_dal/auth'

export default async function PageGuarded() {
  const session = await requireUser()
  return (
    <div className="rounded-md border-2 border-emerald-300 bg-emerald-50 p-4 text-sm">
      <p className="mb-3 text-xs font-semibold text-emerald-700">[PAGE GUARD]</p>
      <p>
        ✓ Authenticated as <strong>{session.user.name}</strong> ({session.user.role}).
      </p>
      <p className="mt-2 text-xs text-gray-500">
        The page itself enforces auth. If you sign out and revisit this URL, you&apos;ll be redirected
        back to <code>/lab/auth-rbac/01-session</code>.
      </p>
    </div>
  )
}
