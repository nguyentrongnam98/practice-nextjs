export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4">
        <span className="font-semibold">Dashboard</span>
      </nav>
      <div className="p-6">{children}</div>
    </div>
  )
}
