import Link from 'next/link'
import { Button } from '@/shared/components/ui'
import { submitWizard } from '../_actions'
import type { WizardState } from '../_schema'

export function StepThree({ state }: { state: WizardState }) {
  return (
    <form action={submitWizard} className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-gray-700">Step 3 / 3 — Review</h3>
      <dl className="rounded-md border bg-gray-50 p-3 text-sm">
        <div className="flex justify-between py-1">
          <dt className="text-gray-500">Name</dt>
          <dd>{state.name}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-gray-500">Email</dt>
          <dd>{state.email}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-gray-500">Street</dt>
          <dd>{state.street}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-gray-500">City</dt>
          <dd>{state.city}</dd>
        </div>
        <div className="flex justify-between py-1">
          <dt className="text-gray-500">Country</dt>
          <dd>{state.country}</dd>
        </div>
      </dl>
      <div className="flex gap-2">
        <Link
          href="/lab/forms/06-multi-step?step=2"
          className="rounded-md border px-4 py-2 text-sm"
        >
          ← Back
        </Link>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  )
}
