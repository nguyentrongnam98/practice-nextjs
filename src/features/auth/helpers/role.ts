import 'server-only'
import { cookies } from 'next/headers'

export type Role = 'admin' | 'user'

export async function getRole(): Promise<Role> {
  const c = await cookies()
  const value = c.get('role')?.value
  return value === 'admin' ? 'admin' : 'user'
}
