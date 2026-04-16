import { cacheLife, cacheTag } from 'next/cache'

export async function TodoListB() {
  'use cache'
  cacheLife('hours')
  cacheTag('lab-todos-b')

  const res = await fetch('https://dummyjson.com/todos?limit=3&skip=' + Math.floor(Math.random() * 20))
  const { todos } = await res.json()

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
      <h3 className="font-semibold text-amber-900">List B — revalidateTag</h3>
      <p className="text-xs text-amber-600">{new Date().toISOString()}</p>
      <ul className="mt-2 space-y-1">
        {todos.map((t: { id: number; todo: string }) => (
          <li key={t.id} className="text-sm">{t.todo}</li>
        ))}
      </ul>
      <p className="mt-2 rounded bg-amber-100 p-1 text-xs text-amber-700">
        Stale-while-revalidate — serves cached, refreshes in background
      </p>
    </div>
  )
}
