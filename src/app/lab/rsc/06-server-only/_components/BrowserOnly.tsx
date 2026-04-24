'use client'

import 'client-only'
import { useState, useEffect } from 'react'

export function BrowserOnly() {
  const [userAgent, setUserAgent] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reading browser-only API after hydration
    setUserAgent(navigator.userAgent)
  }, [])

  return (
    <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-4">
      <div className="flex items-center gap-2">
        <span className="rounded bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">
          CLIENT ONLY
        </span>
      </div>
      <p className="mt-3 text-sm">
        User Agent:{' '}
        <code className="rounded bg-orange-100 px-2 py-0.5 font-mono text-xs">
          {userAgent ? userAgent.slice(0, 80) + '...' : 'Loading...'}
        </code>
      </p>
      <p className="mt-2 text-xs text-orange-600">
        This component imports <code>client-only</code>. It cannot run on the server.
        Uses <code>useEffect</code> to safely access browser APIs.
      </p>
    </div>
  )
}
