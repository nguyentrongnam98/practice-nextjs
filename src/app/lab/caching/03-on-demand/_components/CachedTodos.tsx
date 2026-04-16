import { cacheLife, cacheTag } from 'next/cache'

export async function CachedTodos() {
  'use cache'
  cacheLife('hours')
  cacheTag('lab-todos')

  const res = await fetch('https://dummyjson.com/todos?limit=5')
  const { todos } = await res.json()
  const cachedAt = new Date().toISOString()

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Cached Todos</h3>
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
          Cached at: {cachedAt}
        </span>
      </div>
      <ul className="mt-3 space-y-1">
        {todos.map((t: { id: number; todo: string; completed: boolean }) => (
          <li key={t.id} className="flex items-center gap-2 text-sm">
            <span className={t.completed ? 'text-green-600' : 'text-gray-400'}>
              {t.completed ? '✓' : '○'}
            </span>
            <span className={t.completed ? 'line-through text-gray-400' : ''}>
              {t.todo}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-blue-600">
        Tagged with <code>lab-todos</code>. Click Revalidate, then refresh to see new timestamp.
      </p>
    </div>
  )
}
