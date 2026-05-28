'use client'

import { useState } from 'react'
import { Button } from '@/shared/components/ui'

const ENDPOINTS = {
  hello: '/lab/routing/04-handlers/api/hello',
  echo: '/lab/routing/04-handlers/api/echo',
  user: (id: string) => `/lab/routing/04-handlers/api/users/${id}`,
  stream: '/lab/routing/04-handlers/api/stream',
} as const

export function HandlersDemo() {
  const [out, setOut] = useState<string>('')
  const [busy, setBusy] = useState(false)

  async function run(fn: () => Promise<string>) {
    setBusy(true)
    try {
      setOut(await fn())
    } catch (e) {
      setOut(`Error: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              const r = await fetch(ENDPOINTS.hello)
              return JSON.stringify(await r.json(), null, 2)
            })
          }
          disabled={busy}
        >
          GET /hello
        </Button>
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              const r = await fetch(ENDPOINTS.echo, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ greeting: 'xin chào', when: Date.now() }),
              })
              return JSON.stringify(await r.json(), null, 2)
            })
          }
          disabled={busy}
        >
          POST /echo (JSON)
        </Button>
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              const r = await fetch(ENDPOINTS.user('2'))
              return `${r.status} ${r.statusText}\n${JSON.stringify(await r.json(), null, 2)}`
            })
          }
          disabled={busy}
        >
          GET /users/2
        </Button>
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              const r = await fetch(ENDPOINTS.user('999'))
              return `${r.status} ${r.statusText}\n${JSON.stringify(await r.json(), null, 2)}`
            })
          }
          disabled={busy}
        >
          GET /users/999 (404)
        </Button>
        <Button
          type="button"
          onClick={() =>
            run(async () => {
              const r = await fetch(ENDPOINTS.stream)
              const reader = r.body!.getReader()
              const decoder = new TextDecoder()
              let acc = ''
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                acc += decoder.decode(value)
                setOut(acc) // live update
              }
              return acc
            })
          }
          disabled={busy}
        >
          GET /stream (live)
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-md bg-gray-900 p-3 text-xs text-green-200">
        {out || '↑ click a button'}
      </pre>
    </div>
  )
}
