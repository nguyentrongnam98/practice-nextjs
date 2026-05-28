import Link from 'next/link'

export default function WideLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/lab/routing/02-groups" className="text-sm text-blue-600 hover:underline">
        ← Back
      </Link>
      <div className="mt-2 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
        I am the <strong>(wide)</strong> group layout. max-w-6xl.
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}
