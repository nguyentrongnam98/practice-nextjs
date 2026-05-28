'use client'

import dynamic from 'next/dynamic'

export const DynamicChart = dynamic(() => import('./Chart'), {
  ssr: false,
  loading: () => <p className="text-sm text-gray-500">Mounting Chart on client…</p>,
})
