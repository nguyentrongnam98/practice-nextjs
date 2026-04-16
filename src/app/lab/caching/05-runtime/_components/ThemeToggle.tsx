'use client'

import { useTransition } from 'react'
import { setThemeAction } from '../_actions'

export function ThemeToggle({ current }: { current: string }) {
  const [pending, start] = useTransition()

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-500">Theme:</span>
      {(['light', 'dark'] as const).map((t) => (
        <button
          key={t}
          type="button"
          disabled={pending || current === t}
          onClick={() => start(() => setThemeAction(t))}
          className={`rounded px-3 py-1 text-sm ${
            current === t
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50'
          }`}
        >
          {t}
        </button>
      ))}
      {pending && <span className="text-xs text-gray-400">Switching...</span>}
    </div>
  )
}
