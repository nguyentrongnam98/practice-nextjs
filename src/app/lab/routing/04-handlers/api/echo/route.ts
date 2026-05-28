import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? ''
  const body =
    contentType.includes('application/json')
      ? await request.json()
      : await request.text()

  return Response.json({
    method: 'POST',
    contentType,
    received: body,
    receivedAt: new Date().toISOString(),
  })
}
