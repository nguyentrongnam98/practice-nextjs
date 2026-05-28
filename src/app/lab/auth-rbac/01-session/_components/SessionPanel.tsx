'use client'

import { useActionState } from 'react'
import { Button } from '@/shared/components/ui'
import { startSession, type LoginState } from '../_actions'

const initial: LoginState = { idle: true }

type Props = { active: boolean }

export function SessionPanel({ active }: Props) {
  const [state, action, pending] = useActionState(startSession, initial)

  if (active) {
    return (
      <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
        ✓ Session is active. See the panel below for details. Use the &quot;Sign out&quot; button to end it.
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">
        Username (type &quot;admin&quot; or &quot;user&quot;)
      </label>
      <input
        name="username"
        autoComplete="off"
        defaultValue=""
        placeholder="admin"
        className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button type="submit" loading={pending}>
        Start session
      </Button>
      {'ok' in state && state.ok === false && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
    </form>
  )
}
