'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ModalProps {
  children: React.ReactNode
}

export function Modal({ children }: ModalProps) {
  const router = useRouter()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [router])

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => router.back()}
      className="fixed inset-0 z-50 grid place-items-center bg-black/50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <button
          aria-label="Close"
          onClick={() => router.back()}
          className="absolute right-3 top-2 text-2xl leading-none text-gray-500 hover:text-gray-900"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}
