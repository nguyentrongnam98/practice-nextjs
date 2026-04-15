'use client'

import { useActionState } from 'react'
import { Button } from '@/shared/components/ui'
import { Input } from '@/shared/components/ui'
import { login } from '../actions/login'
import type { ActionResult } from '@/shared/types/api'

const initialState: ActionResult = { success: false, error: '' }

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => login(formData),
    initialState,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        required
        error={!state.success ? state.fieldErrors?.email?.[0] : undefined}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="At least 6 characters"
        required
        error={!state.success ? state.fieldErrors?.password?.[0] : undefined}
      />

      {!state.success && state.error && !state.fieldErrors && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <Button type="submit" loading={isPending}>
        Sign in
      </Button>
    </form>
  )
}
