import { getReports } from '@/features/dashboard/services/mock'

export default async function UserReportsPage() {
  const data = await getReports('user')
  return (
    <dl className="grid grid-cols-2 gap-3">
      <div>
        <dt className="text-xs text-gray-500">Tasks Done</dt>
        <dd className="text-lg font-bold text-green-600">{data.tasksDone}</dd>
      </div>
      <div>
        <dt className="text-xs text-gray-500">Tasks Open</dt>
        <dd className="text-lg font-bold text-orange-600">{data.tasksOpen}</dd>
      </div>
    </dl>
  )
}
