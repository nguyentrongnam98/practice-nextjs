'use client'

import { useState, useEffect } from 'react'

export function ClientInfo() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('🌐 ClientInfo rendered on BROWSER at', new Date().toISOString())
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: avoid hydration mismatch by deferring browser-only render
    setMounted(true)
  }, [])

  return (
    <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
      <div className="flex items-center gap-2">
        <span className="rounded bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">
          CLIENT
        </span>
        <h3 className="font-semibold text-orange-900">I am a Client Component</h3>
      </div>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-orange-700">typeof window:</dt>
          <dd className="font-mono">{mounted ? typeof window : 'undefined (SSR)'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-orange-700">navigator.userAgent:</dt>
          <dd className="font-mono truncate max-w-xs">
            {mounted
              ? navigator.userAgent.slice(0, 50) + '...'
              : 'Loading... (SSR)'}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-orange-600">
        Check your <strong>browser DevTools</strong> console for the log message.
      </p>
      {mounted && (
        <p className="mt-2 rounded bg-orange-100 p-2 text-xs text-orange-800">
          Values above updated after hydration via <code>useEffect</code> —
          this is how you avoid hydration mismatch with browser-only values.
        </p>
      )}
    </div>
  )
}
