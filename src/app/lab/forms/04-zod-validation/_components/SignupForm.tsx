'use client'

import { useActionState } from 'react'
import { Button, Input } from '@/shared/components/ui'
import { signup, type SignupState } from '../_actions'

const initialState: SignupState = { idle: true }

function getError(state: SignupState, field: string): string | undefined {
  if ('ok' in state && state.ok === false) {
    return state.fieldErrors[field]?.[0]
  }
  return undefined
}

function getValue(state: SignupState, field: string): string {
  if ('ok' in state && state.ok === false) {
    return state.values[field] ?? ''
  }
  return ''
}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState)

  if ('ok' in state && state.ok === true) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
        ✓ Signed up successfully as <strong>{state.email}</strong>.
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input
        label="Email"
        name="email"
        type="email"
        defaultValue={getValue(state, 'email')}
        error={getError(state, 'email')}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        defaultValue={getValue(state, 'password')}
        error={getError(state, 'password')}
      />
      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        defaultValue={getValue(state, 'confirmPassword')}
        error={getError(state, 'confirmPassword')}
      />
      <Input
        label="Age"
        name="age"
        type="number"
        defaultValue={getValue(state, 'age')}
        error={getError(state, 'age')}
      />
      <Button type="submit" loading={pending}>
        Sign up
      </Button>
    </form>
  )
}
