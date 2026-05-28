import Link from 'next/link'

export default function FocusedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/lab/routing/02-groups" className="text-xs text-gray-400 hover:underline">
        × close
      </Link>
      <div className="mt-3 rounded-lg border-2 border-gray-300 bg-white p-6 shadow-lg">
        {children}
      </div>
    </div>
  )
}
