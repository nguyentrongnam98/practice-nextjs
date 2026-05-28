'use client'

import { useEffect, useState } from 'react'

export default function Chart() {
  const [now, setNow] = useState<string | null>(null)
  useEffect(() => {
    setNow(new Date().toLocaleTimeString())
  }, [])

  // Reference window to prove this can't SSR
  const ua = typeof window === 'undefined' ? '(server)' : window.navigator.userAgent.slice(0, 30)

  return (
    <div className="rounded-md border-2 border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">
      <p>📈 Pretend this is a chart from a heavy library that touches window.</p>
      <p className="mt-2 text-xs">Loaded at (client): {now ?? '…'}</p>
      <p className="text-xs">UA: {ua}</p>
    </div>
  )
}
