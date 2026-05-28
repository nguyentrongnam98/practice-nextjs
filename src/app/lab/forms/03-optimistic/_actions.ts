'use server'

import { revalidatePath } from 'next/cache'
import { addMessage } from './_store'

export async function sendMessage(formData: FormData): Promise<void> {
  const text = String(formData.get('text') ?? '').trim()
  if (!text) return

  // simulate slow server so the optimistic UI is visible
  await new Promise((r) => setTimeout(r, 1500))
  addMessage(text)
  revalidatePath('/lab/forms/03-optimistic')
}
