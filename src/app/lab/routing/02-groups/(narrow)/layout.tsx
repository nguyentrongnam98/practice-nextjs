import Link from 'next/link'

export default function NarrowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md">
      <Link href="/lab/routing/02-groups" className="text-sm text-blue-600 hover:underline">
        ← Back
      </Link>
      <div className="mt-2 rounded-lg border-2 border-blue-300 bg-blue-50 p-3 text-xs text-blue-800">
        I am the <strong>(narrow)</strong> group layout. max-w-md.
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}
