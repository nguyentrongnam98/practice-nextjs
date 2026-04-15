export default function AnalyticsLoading() {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-8 animate-pulse rounded bg-gray-200" />
        <div className="h-8 animate-pulse rounded bg-gray-200" />
        <div className="col-span-2 h-5 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  )
}
