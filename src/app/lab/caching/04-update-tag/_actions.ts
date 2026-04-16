'use server'

import { updateTag, revalidateTag } from 'next/cache'

export async function invalidateWithUpdateTag() {
  updateTag('lab-todos-a')
}

export async function invalidateWithRevalidateTag() {
  revalidateTag('lab-todos-b', 'max')
}

export async function invalidateBoth() {
  updateTag('lab-todos-a')
  revalidateTag('lab-todos-b', 'max')
}
