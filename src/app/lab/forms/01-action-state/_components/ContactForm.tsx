'use client'

import { useActionState } from 'react'
import { Button } from '@/shared/components/ui'
import { Input } from '@/shared/components/ui'
import { submitContact, type ContactState } from '../_actions'

const initialState: ContactState = { ok: false, message: '' }

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Input
        label="Your name"
        name="name"
        placeholder="Hùng"
        defaultValue={state.lastName ?? ''}
      />
      <label className="text-sm font-medium text-gray-700" htmlFor="message">
        Message
      </label>
      <textarea
        id="message"
        name="message"
        rows={4}
        className="rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button type="submit" loading={pending}>
        {pending ? 'Sending…' : 'Send message'}
      </Button>

      {state.message && (
        <p
          aria-live="polite"
          className={state.ok ? 'text-sm text-green-600' : 'text-sm text-red-500'}
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
