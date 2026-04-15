export default function TeamLoading() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 space-y-3">
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  )
}
