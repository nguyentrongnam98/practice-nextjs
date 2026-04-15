import Link from 'next/link'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <nav className="flex gap-3 border-b pb-2 text-sm">
        <Link href="/dashboard/page-views" className="text-blue-600 hover:underline">
          Page Views
        </Link>
        <Link href="/dashboard/visitors" className="text-blue-600 hover:underline">
          Visitors
        </Link>
      </nav>
      <div className="mt-4">{children}</div>
    </div>
  )
}
