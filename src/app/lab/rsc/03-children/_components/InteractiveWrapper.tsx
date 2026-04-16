'use client'

import { useState } from 'react'

interface InteractiveWrapperProps {
  title: string
  children: React.ReactNode
}

export function InteractiveWrapper({ title, children }: InteractiveWrapperProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
      >
        <span className="font-semibold">{title}</span>
        <span className="text-sm text-gray-500">{open ? '▲ Collapse' : '▼ Expand'}</span>
      </button>
      {open && <div className="border-t p-4">{children}</div>}
    </div>
  )
}
