'use client'

import { useOptimistic, useRef } from 'react'
import { Button } from '@/shared/components/ui'
import { sendMessage } from '../_actions'
import type { Message } from '../_store'

type Props = { messages: Message[] }

export function MessageBoard({ messages }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [optimistic, addOptimistic] = useOptimistic<Message[], string>(
    messages,
    (state, text) => [
      ...state,
      { id: `temp-${state.length}`, text, createdAt: new Date().toISOString() },
    ],
  )

  async function action(formData: FormData) {
    const text = String(formData.get('text') ?? '').trim()
    if (!text) return
    addOptimistic(text)
    formRef.current?.reset()
    await sendMessage(formData)
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {optimistic.map((m) => (
          <li
            key={m.id}
            className={
              m.id.startsWith('temp-')
                ? 'rounded-md bg-yellow-50 p-2 text-sm text-gray-700 italic'
                : 'rounded-md bg-white p-2 text-sm text-gray-900 border'
            }
          >
            {m.text}
            {m.id.startsWith('temp-') && (
              <span className="ml-2 text-xs text-gray-400">(sending…)</span>
            )}
          </li>
        ))}
      </ul>
      <form ref={formRef} action={action} className="flex gap-2">
        <input
          name="text"
          required
          placeholder="Type a message…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  )
}
