import { cacheLife } from 'next/cache'

export async function CachedProducts() {
  'use cache'
  cacheLife('minutes')

  const res = await fetch('https://dummyjson.com/products?limit=3&skip=5')
  const { products } = await res.json()
  const cachedAt = new Date().toISOString()

  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">UI-level cache</h3>
        <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
          Cached at: {cachedAt}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {products.map((p: { id: number; title: string; price: number }) => (
          <li key={p.id} className="flex items-center justify-between text-sm">
            <span>{p.title}</span>
            <span className="text-gray-500">${p.price}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-purple-600">
        Entire component output is cached — including the rendered HTML.
      </p>
    </div>
  )
}
