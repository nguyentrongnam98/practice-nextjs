import { describe, it, expect, vi, beforeEach } from 'vitest'

const cookiesMock = vi.fn()
vi.mock('next/headers', () => ({
  cookies: () => cookiesMock(),
}))

import { getRole } from './role'

describe('getRole', () => {
  beforeEach(() => {
    cookiesMock.mockReset()
  })

  it("returns 'user' when no cookie set", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined })
    expect(await getRole()).toBe('user')
  })

  it("returns 'admin' when cookie is admin", async () => {
    cookiesMock.mockResolvedValue({ get: () => ({ value: 'admin' }) })
    expect(await getRole()).toBe('admin')
  })

  it("returns 'user' when cookie is user", async () => {
    cookiesMock.mockResolvedValue({ get: () => ({ value: 'user' }) })
    expect(await getRole()).toBe('user')
  })
})
