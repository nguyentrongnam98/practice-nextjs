'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Button, Input } from '@/shared/components/ui'
import { saveStepTwo, type StepResult } from '../_actions'

const initial: StepResult = { ok: true }

type Props = { defaultStreet?: string; defaultCity?: string; defaultCountry?: string }

export function StepTwo({ defaultStreet = '', defaultCity = '', defaultCountry = '' }: Props) {
  const [state, action, pending] = useActionState(saveStepTwo, initial)
  const fieldErrors = 'fieldErrors' in state ? state.fieldErrors : {}

  return (
    <form action={action} className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700">Step 2 / 3 — Address</h3>
      <Input
        label="Street"
        name="street"
        defaultValue={defaultStreet}
        error={fieldErrors.street?.[0]}
      />
      <Input label="City" name="city" defaultValue={defaultCity} error={fieldErrors.city?.[0]} />
      <Input
        label="Country"
        name="country"
        defaultValue={defaultCountry}
        error={fieldErrors.country?.[0]}
      />
      <div className="flex gap-2">
        <Link
          href="/lab/forms/06-multi-step?step=1"
          className="rounded-md border px-4 py-2 text-sm"
        >
          ← Back
        </Link>
        <Button type="submit" loading={pending}>
          Next →
        </Button>
      </div>
    </form>
  )
}
