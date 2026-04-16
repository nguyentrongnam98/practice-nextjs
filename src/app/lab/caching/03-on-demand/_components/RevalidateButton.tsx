'use client'

import { useTransition } from 'react'
import { revalidateTodosAction } from '../_actions'

export function RevalidateButton() {
  const [pending, start] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => revalidateTodosAction())}
      className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {pending ? 'Revalidating...' : 'Revalidate Todos'}
    </button>
  )
}
