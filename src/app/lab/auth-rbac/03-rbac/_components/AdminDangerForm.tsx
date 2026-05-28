'use client'

import { useActionState } from 'react'
import { Button } from '@/shared/components/ui'
import { deleteEverything, type ActionResult } from '../_actions'

const initial: ActionResult = { idle: true }

export function AdminDangerForm() {
  const [state, action, pending] = useActionState(deleteEverything, initial)
  return (
    <form action={action} className="flex flex-col gap-2">
      <Button type="submit" loading={pending}>
        Run admin action
      </Button>
      {'ok' in state && state.ok === true && (
        <p className="text-sm text-green-600">{state.message}</p>
      )}
      {'ok' in state && state.ok === false && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
    </form>
  )
}
