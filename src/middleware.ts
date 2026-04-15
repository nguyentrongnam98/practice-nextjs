import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Auth guard for dashboard routes — extend when auth provider is integrated
  // Example: check for session cookie, redirect to /login if missing
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
