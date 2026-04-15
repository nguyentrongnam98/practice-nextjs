import { describe, it, expect } from 'vitest'
import { getAnalytics, getTeam, getReports } from './mock'

describe('mock dashboard services', () => {
  it('getAnalytics returns shape', async () => {
    const data = await getAnalytics()
    expect(data).toMatchObject({
      views: expect.any(Number),
      visitors: expect.any(Number),
      growth: expect.any(Number),
    })
  })

  it('getTeam returns array of members', async () => {
    const team = await getTeam()
    expect(Array.isArray(team)).toBe(true)
    expect(team.length).toBeGreaterThan(0)
    expect(team[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      role: expect.any(String),
    })
  })

  it('getReports returns admin shape when role=admin', async () => {
    const data = await getReports('admin')
    expect(data).toMatchObject({
      revenue: expect.any(Number),
      cost: expect.any(Number),
      margin: expect.any(Number),
    })
  })

  it('getReports returns user shape when role=user', async () => {
    const data = await getReports('user')
    expect(data).toMatchObject({
      tasksDone: expect.any(Number),
      tasksOpen: expect.any(Number),
    })
  })
})
