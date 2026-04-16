'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function setThemeAction(theme: string) {
  const c = await cookies()
  c.set('theme', theme, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 })
  revalidatePath('/lab/caching/05-runtime')
}
