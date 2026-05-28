export type Role = 'admin' | 'user' | 'guest'

export type User = {
  id: string
  name: string
  email: string
  role: Role
}

export type Session = {
  user: User
  issuedAt: string
}
