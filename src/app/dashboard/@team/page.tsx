import { getTeam } from '@/features/dashboard/services/mock'

export default async function TeamPage() {
  const team = await getTeam()
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase">Team</h2>
      <ul className="mt-3 space-y-2">
        {team.map((m) => (
          <li key={m.id} className="flex items-center justify-between">
            <span className="font-medium">{m.name}</span>
            <span className="text-xs text-gray-500">{m.role}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
