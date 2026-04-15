'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Something went wrong</h1>
      <p className="text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </main>
  )
}
