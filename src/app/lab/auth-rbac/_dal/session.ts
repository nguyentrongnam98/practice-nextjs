import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { SESSION_COOKIE } from '../_lib/cookie'
import type { Session } from './types'

// React's cache() ensures multiple callers within the same request share one result.
// This means getSession() can be called freely from RSC, Server Actions, helpers, etc.,
// without re-reading cookies or re-validating tokens every time.
export const getSession = cache(async (): Promise<Session | null> => {
  const c = await cookies()
  const raw = c.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const session = JSON.parse(raw) as Session
    // In a real app: verify signature / decrypt token / validate expiry here.
    return session
  } catch {
    return null
  }
})
