import 'server-only'
import { cache } from 'react'
import { getSession } from '../_dal/session'
import type { Role } from '../_dal/types'

// Simulated database — in real life this would be a SQL/ORM call.
const DB: Record<string, { id: string; phone: string; secret: string; team: 'platform' | 'product' }> = {
  admin: { id: 'admin', phone: '+84-900-000-001', secret: 'TOP-SECRET-ADMIN', team: 'platform' },
  user: { id: 'user', phone: '+84-900-000-002', secret: 'TOP-SECRET-USER', team: 'product' },
}

export type ProfileDTO = {
  name: string
  email: string
  role: Role
  // phone is privacy-gated
  phone: string | null
  // secret is admin-only
  secret: string | null
  team: string
}

// cache() means concurrent callers within the same request share one DB read.
// This is the canonical DAL pattern from the Next.js Data Security guide.
export const getProfileDTO = cache(async (): Promise<ProfileDTO | null> => {
  const session = await getSession()
  if (!session) return null

  const row = DB[session.user.id]
  if (!row) return null

  // Authorization rules live in the DAL, not in the consumer.
  // Phone: visible to self only (everyone is "self" in this mock).
  // Secret: admins only.
  const canSeeSecret = session.user.role === 'admin'

  return {
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    phone: row.phone, // would be gated by viewer-vs-target in a real app
    secret: canSeeSecret ? row.secret : null,
    team: row.team,
  }
})
