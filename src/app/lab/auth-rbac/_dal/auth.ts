import 'server-only'
import { redirect } from 'next/navigation'
import { getSession } from './session'
import type { Role, Session } from './types'

// Returns the session or redirects. Use in any RSC or layout that requires auth.
export async function requireUser(redirectTo = '/lab/auth-rbac/01-session'): Promise<Session> {
  const session = await getSession()
  if (!session) {
    redirect(`${redirectTo}?reason=login-required`)
  }
  return session
}

// Returns the session if the role is allowed; otherwise redirects.
// Throws on the assertion path means downstream code can rely on the role being correct.
export async function requireRole(allowed: Role[]): Promise<Session> {
  const session = await requireUser()
  if (!allowed.includes(session.user.role)) {
    redirect('/lab/auth-rbac/03-rbac?reason=forbidden')
  }
  return session
}
