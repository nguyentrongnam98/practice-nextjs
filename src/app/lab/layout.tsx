import Link from 'next/link'

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center gap-4 border-b bg-white px-6 py-3">
        <span className="text-sm font-semibold text-gray-500 uppercase">Lab</span>
        <Link href="/" className="text-xs text-blue-600 hover:underline">
          Home
        </Link>
      </header>
      <div className="mx-auto max-w-4xl p-6">{children}</div>
    </div>
  )
}
