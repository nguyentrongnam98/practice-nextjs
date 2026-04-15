import { getAnalytics } from '@/features/dashboard/services/mock'

export default async function AnalyticsPage() {
  const data = await getAnalytics()
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase">Analytics</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-gray-500">Views</dt>
          <dd className="text-2xl font-bold">{data.views.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Visitors</dt>
          <dd className="text-2xl font-bold">{data.visitors.toLocaleString()}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-gray-500">Growth</dt>
          <dd className="text-lg font-medium text-green-600">
            +{(data.growth * 100).toFixed(1)}%
          </dd>
        </div>
      </dl>
    </div>
  )
}
