import type { NextRequest } from 'next/server'

const USERS: Record<string, { id: string; name: string }> = {
  '1': { id: '1', name: 'Hùng' },
  '2': { id: '2', name: 'Alice' },
  '3': { id: '3', name: 'Bob' },
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params
  const user = USERS[id]
  if (!user) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  return Response.json(user)
}
