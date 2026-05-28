'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function HoverPrefetchLink({ href, label }: { href: string; label: string }) {
  const router = useRouter()
  const [prefetched, setPrefetched] = useState(false)

  return (
    <Link
      href={href as never}
      prefetch={false}
      onMouseEnter={() => {
        if (!prefetched) {
          router.prefetch(href)
          setPrefetched(true)
        }
      }}
      className="inline-block rounded-md border px-3 py-1 text-sm text-blue-600 hover:underline"
    >
      {label}
      {prefetched && <span className="ml-2 text-xs text-green-600">✓ prefetched</span>}
    </Link>
  )
}
