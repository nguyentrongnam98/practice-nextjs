import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LAB_PREFIX = '/lab/routing/05-proxy'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Auth guard for dashboard routes — extend when auth provider is integrated
  // (previously in middleware.ts, merged here for Next.js 16 compatibility)
  // When a real auth provider is added, check for session cookie and redirect to /login if missing.

  // 1. Rewrite: /lab/routing/05-proxy/rewrite → /lab/routing/05-proxy/original (URL stays)
  if (pathname === `${LAB_PREFIX}/rewrite`) {
    const url = request.nextUrl.clone()
    url.pathname = `${LAB_PREFIX}/original`
    return NextResponse.rewrite(url)
  }

  // 2. Redirect-if-not-authed: protected page requires a 'lab-auth' cookie
  if (pathname === `${LAB_PREFIX}/protected`) {
    const authed = request.cookies.get('lab-auth')?.value === '1'
    if (!authed) {
      const url = request.nextUrl.clone()
      url.pathname = LAB_PREFIX
      url.searchParams.set('reason', 'login-required')
      return NextResponse.redirect(url)
    }
  }

  // 3. Header injection: all paths under the lab get x-lab-proxy: 1
  const res = NextResponse.next()
  res.headers.set('x-lab-proxy', '1')
  return res
}

export const config = {
  // Covers both the lab proxy routes and the dashboard auth guard
  matcher: ['/lab/routing/05-proxy/:path*', '/dashboard/:path*'],
}
