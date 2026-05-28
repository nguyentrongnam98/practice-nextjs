'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui'

export function ProxyDemo() {
  const [authed, setAuthed] = useState(false)
  const [headers, setHeaders] = useState<string | null>(null)

  useEffect(() => {
    setAuthed(document.cookie.split('; ').some((c) => c.startsWith('lab-auth=1')))
  }, [])

  function setCookie() {
    document.cookie = 'lab-auth=1; path=/lab/routing/05-proxy; max-age=3600'
    setAuthed(true)
  }

  function clearCookie() {
    document.cookie = 'lab-auth=; path=/lab/routing/05-proxy; max-age=0'
    setAuthed(false)
  }

  async function inspectHeaders() {
    const r = await fetch('/lab/routing/05-proxy/', { cache: 'no-store' })
    const value = r.headers.get('x-lab-proxy')
    setHeaders(value ? `x-lab-proxy: ${value}` : '(header not set — proxy did not run)')
  }

  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">1. Rewrite</h3>
        <p className="text-xs text-gray-600">
          The proxy rewrites <code>/rewrite</code> to <code>/original</code>. URL stays as
          <code> /rewrite</code>, but content from <code>/original</code> shows.
        </p>
        <Link
          href="/lab/routing/05-proxy/rewrite"
          className="inline-block rounded-md border px-3 py-1 text-sm text-blue-600 hover:underline"
        >
          Visit /rewrite
        </Link>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">2. Cookie-gated redirect</h3>
        <p className="text-xs text-gray-600">
          The proxy redirects to here with a <code>?reason</code> banner if the <code>lab-auth</code>
          cookie isn&apos;t set.
        </p>
        <div className="flex gap-2">
          {authed ? (
            <Button type="button" onClick={clearCookie}>
              Clear lab-auth cookie
            </Button>
          ) : (
            <Button type="button" onClick={setCookie}>
              Set lab-auth=1
            </Button>
          )}
          <Link
            href="/lab/routing/05-proxy/protected"
            className="rounded-md border px-3 py-1 text-sm text-blue-600 hover:underline"
          >
            Visit /protected
          </Link>
        </div>
        <p className="text-xs text-gray-500">
          Current cookie state: <strong>{authed ? 'lab-auth=1' : '(not set)'}</strong>
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">3. Header injection</h3>
        <p className="text-xs text-gray-600">
          The proxy adds <code>x-lab-proxy: 1</code> to every response under this URL prefix.
        </p>
        <Button type="button" onClick={inspectHeaders}>
          Inspect headers
        </Button>
        {headers && <p className="text-xs font-mono text-gray-700">{headers}</p>}
      </section>
    </div>
  )
}
