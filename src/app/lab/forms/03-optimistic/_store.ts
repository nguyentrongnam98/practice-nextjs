// In-memory store — survives within a single Node.js process while dev server runs.
// Reset on full server restart. Demo-only.

import 'server-only'

export type Message = { id: string; text: string; createdAt: string }

const messages: Message[] = [
  { id: 'seed-1', text: 'Welcome to the optimistic demo!', createdAt: new Date().toISOString() },
]

export function listMessages(): Message[] {
  return [...messages]
}

export function addMessage(text: string): Message {
  const m = { id: crypto.randomUUID(), text, createdAt: new Date().toISOString() }
  messages.push(m)
  return m
}
