import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold">My App</h1>
      <p className="text-gray-600">Feature Slices Architecture</p>
      <div className="flex gap-4">
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          Dashboard
        </Link>
      </div>
    </main>
  )
}
