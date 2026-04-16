'use server'

import { revalidateTag } from 'next/cache'

export async function revalidateTodosAction() {
  revalidateTag('lab-todos', 'max')
}
