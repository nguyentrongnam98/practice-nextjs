'use client'

import { useEffect, useRef, useState } from 'react'

export function IntersectionLoader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { rootMargin: '100px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="min-h-[120px]">
      {show ? (
        children
      ) : (
        <p className="text-sm text-gray-400 italic">Scroll into view to mount…</p>
      )}
    </div>
  )
}
