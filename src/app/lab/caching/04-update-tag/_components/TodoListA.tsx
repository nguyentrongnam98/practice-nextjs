import { cacheLife, cacheTag } from 'next/cache'

export async function TodoListA() {
  'use cache'
  cacheLife('hours')
  cacheTag('lab-todos-a')

  // eslint-disable-next-line react-hooks/purity -- intentional: randomness demonstrates cache hit (same result served from cache)
  const res = await fetch('https://dummyjson.com/todos?limit=3&skip=' + Math.floor(Math.random() * 20))
  const { todos } = await res.json()

  return (
    <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
      <h3 className="font-semibold text-green-900">List A — updateTag</h3>
      <p className="text-xs text-green-600">{new Date().toISOString()}</p>
      <ul className="mt-2 space-y-1">
        {todos.map((t: { id: number; todo: string }) => (
          <li key={t.id} className="text-sm">{t.todo}</li>
        ))}
      </ul>
      <p className="mt-2 rounded bg-green-100 p-1 text-xs text-green-700">
        Immediate expire — next request waits for fresh data
      </p>
    </div>
  )
}
