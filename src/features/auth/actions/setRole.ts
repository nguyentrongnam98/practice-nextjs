'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Role } from '../helpers/role'

export async function setRoleAction(role: Role) {
  const c = await cookies()
  c.set('role', role, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  revalidatePath('/dashboard', 'layout')
}
