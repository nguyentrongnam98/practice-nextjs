import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome back!</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href="/dashboard/reports" className="text-blue-600 hover:underline">
          Reports
        </Link>
        <Link href="/dashboard/page-views" className="text-blue-600 hover:underline">
          Page Views (tab)
        </Link>
        <Link href="/dashboard/visitors" className="text-blue-600 hover:underline">
          Visitors (tab)
        </Link>
        <Link href="/login" className="text-blue-600 hover:underline">
          Open Login Modal
        </Link>
        <Link href="/dashboard/photos" className="text-blue-600 hover:underline">
          Photo Gallery
        </Link>
      </div>
    </div>
  )
}
