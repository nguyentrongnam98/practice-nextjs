import { describe, it, expect, vi, beforeEach } from 'vitest'

const cookieSet = vi.fn()
vi.mock('next/headers', () => ({
  cookies: async () => ({ set: cookieSet, get: () => undefined }),
}))

import { login } from './login'

describe('login action', () => {
  beforeEach(() => {
    cookieSet.mockReset()
  })

  it('returns fieldErrors for invalid email', async () => {
    const formData = new FormData()
    formData.set('email', 'not-an-email')
    formData.set('password', 'password123')

    const result = await login(formData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.fieldErrors?.email).toBeDefined()
    }
  })

  it('returns fieldErrors for short password', async () => {
    const formData = new FormData()
    formData.set('email', 'user@example.com')
    formData.set('password', '123')

    const result = await login(formData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.fieldErrors?.password).toBeDefined()
    }
  })

  it('returns error for wrong credentials', async () => {
    const formData = new FormData()
    formData.set('email', 'wrong@example.com')
    formData.set('password', 'password123')

    const result = await login(formData)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Invalid email or password')
    }
  })

  it('returns success for valid credentials', async () => {
    const formData = new FormData()
    formData.set('email', 'demo@example.com')
    formData.set('password', 'password123')

    const result = await login(formData)
    expect(result.success).toBe(true)
  })

  it('sets role=user cookie on successful login with non-admin email', async () => {
    const formData = new FormData()
    formData.set('email', 'demo@example.com')
    formData.set('password', 'password123')

    await login(formData)
    expect(cookieSet).toHaveBeenCalledWith(
      'role',
      'user',
      expect.objectContaining({ path: '/' }),
    )
  })

  it('does not set cookie on failed login', async () => {
    const formData = new FormData()
    formData.set('email', 'admin@example.com')
    formData.set('password', 'password123')

    await login(formData)
    expect(cookieSet).not.toHaveBeenCalled()
  })
})
