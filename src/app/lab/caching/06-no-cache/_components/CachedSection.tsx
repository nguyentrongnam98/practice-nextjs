import { cacheLife } from 'next/cache'

export async function CachedSection() {
  'use cache'
  cacheLife('hours')

  const res = await fetch('https://dummyjson.com/products/1')
  const product = await res.json()

  return (
    <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-green-900">Cached</h3>
        <span className="text-xs text-green-600">{new Date().toISOString()}</span>
      </div>
      <p className="mt-2 text-sm">{product.title} — ${product.price}</p>
      <p className="mt-2 rounded bg-green-100 p-1 text-xs text-green-700">
        Uses 'use cache' + cacheLife('hours'). Appears instantly from cache. Timestamp stays same on refresh.
      </p>
    </div>
  )
}
