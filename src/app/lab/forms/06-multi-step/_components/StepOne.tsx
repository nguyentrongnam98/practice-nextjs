'use client'

import { useActionState } from 'react'
import { Button, Input } from '@/shared/components/ui'
import { saveStepOne, type StepResult } from '../_actions'

const initial: StepResult = { ok: true }

type Props = { defaultName?: string; defaultEmail?: string }

export function StepOne({ defaultName = '', defaultEmail = '' }: Props) {
  const [state, action, pending] = useActionState(saveStepOne, initial)
  const fieldErrors = 'fieldErrors' in state ? state.fieldErrors : {}

  return (
    <form action={action} className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700">Step 1 / 3 — Identity</h3>
      <Input label="Name" name="name" defaultValue={defaultName} error={fieldErrors.name?.[0]} />
      <Input
        label="Email"
        name="email"
        type="email"
        defaultValue={defaultEmail}
        error={fieldErrors.email?.[0]}
      />
      <Button type="submit" loading={pending}>
        Next →
      </Button>
    </form>
  )
}
