'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { SESSION_COOKIE, SESSION_PATH, SESSION_MAX_AGE } from '../_lib/cookie'
import type { Role, Session } from '../_dal/types'

const MOCK_USERS: Record<string, { name: string; email: string; role: Role }> = {
  admin: { name: 'Admin Hùng', email: 'admin@example.com', role: 'admin' },
  user: { name: 'User Alice', email: 'alice@example.com', role: 'user' },
}

export type LoginState =
  | { ok: true; role: Role }
  | { ok: false; error: string }
  | { idle: true }

export async function startSession(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim()
  const profile = MOCK_USERS[username]
  if (!profile) {
    return { ok: false, error: 'Try "admin" or "user".' }
  }

  const session: Session = {
    user: { id: username, ...profile },
    issuedAt: new Date().toISOString(),
  }

  const c = await cookies()
  c.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: SESSION_PATH,
    maxAge: SESSION_MAX_AGE,
  })

  revalidatePath(SESSION_PATH, 'layout')
  return { ok: true, role: profile.role }
}

export async function endSession(): Promise<void> {
  const c = await cookies()
  c.delete(SESSION_COOKIE)
  revalidatePath(SESSION_PATH, 'layout')
}
