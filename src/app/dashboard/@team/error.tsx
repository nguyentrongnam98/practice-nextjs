'use client'

export default function TeamError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="text-sm font-semibold text-red-700">Team failed</h2>
      <p className="mt-1 text-xs text-red-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-3 rounded border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  )
}
