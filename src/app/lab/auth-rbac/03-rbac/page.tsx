import Link from 'next/link'
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { getSession } from '../_dal/session'
import { RoleGate } from './_components/RoleGate'
import { AdminDangerForm } from './_components/AdminDangerForm'

type SearchParams = Promise<{ reason?: string }>

export default async function RbacIntro({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { reason } = await searchParams
  const session = await getSession()

  return (
    <ExerciseLayout
      number="03"
      title="Role-based access control"
      concept="UI hiding by role is UX, not security. The actual enforcement must run server-side on every read and action. RoleGate (a Server Component) hides children; requireRole (in a Server Action) protects the work."
      questions={[
        'Why is client-side UI hiding insufficient on its own?',
        'How do you prove a Server Action is safe to call from any client?',
        'How would you write tests for an RBAC policy?',
        'What is the difference between authorization at the data layer vs the route layer?',
        'When would you use ABAC (attribute-based) instead of RBAC?',
      ]}
    >
      {reason === 'forbidden' && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          ⛔ Access denied — your role doesn&apos;t allow that page or action.
        </div>
      )}

      <p className="mb-4 text-sm text-gray-600">
        Current role: <strong>{session?.user.role ?? 'guest (no session)'}</strong>.{' '}
        <Link href="/lab/auth-rbac/01-session" className="text-blue-600 hover:underline">
          Switch via the session exercise
        </Link>{' '}
        — try logging in as <code>user</code> first, then <code>admin</code>, to see the gate change.
      </p>

      <RoleGate allow={['admin']} fallback={
        <p className="text-sm text-gray-500 italic">
          (Admin-only section hidden. Sign in as <code>admin</code> to see it.)
        </p>
      }>
        <div className="rounded-md border-2 border-rose-300 bg-rose-50 p-3 text-sm">
          <h3 className="font-semibold">Admin zone</h3>
          <p className="mt-1 text-xs text-gray-700">
            This block is rendered server-side only for admins. The button below also re-checks the role
            in its action handler.
          </p>
          <div className="mt-3">
            <AdminDangerForm />
          </div>
        </div>
      </RoleGate>

      <div className="mt-6 rounded-md bg-gray-50 p-3 text-xs">
        <p className="font-semibold">Try to bypass:</p>
        <ol className="ml-4 mt-2 list-decimal space-y-1">
          <li>Sign in as <code>user</code> (role: user).</li>
          <li>
            Visit <Link href="/lab/auth-rbac/03-rbac/admin" className="text-blue-600 hover:underline">
              /lab/auth-rbac/03-rbac/admin
            </Link>{' '}
            directly — you&apos;ll be redirected with <code>?reason=forbidden</code>.
          </li>
        </ol>
      </div>
    </ExerciseLayout>
  )
}
