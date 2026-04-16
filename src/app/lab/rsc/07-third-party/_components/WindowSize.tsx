'use client'

import { useState, useEffect } from 'react'

export function WindowSize() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null)

  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  if (!size) {
    return <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
  }

  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-lg font-mono font-bold">
        {size.w} × {size.h}
      </p>
      <p className="text-xs text-gray-500">Resize your browser window to see it update</p>
    </div>
  )
}
