import { getSession } from '../../_dal/session'
import type { Role } from '../../_dal/types'

type Props = {
  allow: Role[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

// Server Component. Renders children only if the current session matches a role in `allow`.
// Equivalent client-side hiding would be insecure: tampering with DOM or running the action
// directly would bypass it. This is why we have requireRole() — see _actions.ts.
export async function RoleGate({ allow, children, fallback = null }: Props) {
  const session = await getSession()
  if (!session || !allow.includes(session.user.role)) return <>{fallback}</>
  return <>{children}</>
}
