'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/shared/components/ui'

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <p className="text-sm text-gray-500">Loading heavy module…</p>,
})

export function BundleToggle() {
  const [show, setShow] = useState(false)
  return (
    <div className="space-y-3">
      <Button type="button" onClick={() => setShow((s) => !s)}>
        {show ? 'Hide' : 'Load heavy chart'}
      </Button>
      {show && <HeavyChart />}
    </div>
  )
}
