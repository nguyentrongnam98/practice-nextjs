import type { LoginSchema } from '../schemas/login.schema'
import type { User } from '../types'

export async function authenticate(input: LoginSchema): Promise<User | null> {
  // Placeholder — replace with real auth provider (NextAuth, Lucia, etc.)
  // This demonstrates the service layer pattern.
  if (input.email === 'demo@example.com' && input.password === 'password123') {
    return { id: '1', email: input.email, name: 'Demo User' }
  }
  return null
}
