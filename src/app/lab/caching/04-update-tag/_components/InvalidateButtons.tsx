'use client'

import { useTransition } from 'react'
import { invalidateBoth } from '../_actions'

export function InvalidateButtons() {
  const [pending, start] = useTransition()

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => invalidateBoth())}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? 'Invalidating...' : 'Invalidate Both'}
      </button>
      <span className="text-xs text-gray-500">
        Then refresh — List A shows new data immediately, List B may show stale first.
      </span>
    </div>
  )
}
