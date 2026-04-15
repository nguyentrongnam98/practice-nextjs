import 'server-only'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export type Analytics = { views: number; visitors: number; growth: number }
export type TeamMember = { id: string; name: string; role: string }
export type AdminReport = { revenue: number; cost: number; margin: number }
export type UserReport = { tasksDone: number; tasksOpen: number }

export async function getAnalytics(): Promise<Analytics> {
  await sleep(2000)
  return { views: 12_345, visitors: 890, growth: 0.12 }
}

export async function getTeam(): Promise<TeamMember[]> {
  await sleep(800)
  return [
    { id: '1', name: 'Hùng', role: 'Lead' },
    { id: '2', name: 'Lan', role: 'Designer' },
    { id: '3', name: 'Minh', role: 'Engineer' },
  ]
}

export async function getReports(role: 'admin'): Promise<AdminReport>
export async function getReports(role: 'user'): Promise<UserReport>
export async function getReports(role: 'admin' | 'user'): Promise<AdminReport | UserReport> {
  await sleep(1200)
  if (role === 'admin') return { revenue: 1_200_000, cost: 450_000, margin: 0.625 }
  return { tasksDone: 12, tasksOpen: 4 }
}
