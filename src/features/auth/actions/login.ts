'use server'

import { cookies } from 'next/headers'
import type { ActionResult } from '@/shared/types/api'
import { loginSchema } from '../schemas/login.schema'
import { authenticate } from '../services/auth.service'

export async function login(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const user = await authenticate(parsed.data)
  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }

  const role = parsed.data.email.includes('admin') ? 'admin' : 'user'
  const c = await cookies()
  c.set('role', role, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return { success: true, data: undefined }
}
