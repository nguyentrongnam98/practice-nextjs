import { getReports } from '@/features/dashboard/services/mock'

export default async function AdminReportsPage() {
  const data = await getReports('admin')
  return (
    <dl className="grid grid-cols-3 gap-3">
      <div>
        <dt className="text-xs text-gray-500">Revenue</dt>
        <dd className="text-lg font-bold">${data.revenue.toLocaleString()}</dd>
      </div>
      <div>
        <dt className="text-xs text-gray-500">Cost</dt>
        <dd className="text-lg font-bold">${data.cost.toLocaleString()}</dd>
      </div>
      <div>
        <dt className="text-xs text-gray-500">Margin</dt>
        <dd className="text-lg font-bold text-green-600">
          {(data.margin * 100).toFixed(1)}%
        </dd>
      </div>
    </dl>
  )
}
