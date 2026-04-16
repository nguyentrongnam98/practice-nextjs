'use client'

import { useState } from 'react'

interface Todo {
  id: number
  todo: string
  completed: boolean
}

export function TodoList({ todos }: { todos: Todo[] }) {
  const [filter, setFilter] = useState<'all' | 'done' | 'pending'>('all')

  const filtered = todos.filter((t) => {
    if (filter === 'done') return t.completed
    if (filter === 'pending') return !t.completed
    return true
  })

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Todos from API</h3>
        <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
          Client Component
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        {(['all', 'done', 'pending'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded px-3 py-1 text-xs ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f} {f === 'all' ? `(${todos.length})` : `(${todos.filter((t) => f === 'done' ? t.completed : !t.completed).length})`}
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-1">
        {filtered.map((t) => (
          <li key={t.id} className="flex items-center gap-2 text-sm">
            <span className={t.completed ? 'text-green-600' : 'text-gray-400'}>
              {t.completed ? '✓' : '○'}
            </span>
            <span className={t.completed ? 'text-gray-400 line-through' : ''}>
              {t.todo}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 rounded bg-green-50 p-2 text-xs text-green-700">
        Data fetched from <code>dummyjson.com/todos</code> on <strong>server</strong>.
        Filter buttons run on <strong>client</strong> (no re-fetch needed).
      </p>
    </div>
  )
}
