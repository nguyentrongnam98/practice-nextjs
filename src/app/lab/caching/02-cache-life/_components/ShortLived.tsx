import { cacheLife } from 'next/cache'

export async function ShortLived() {
  'use cache'
  cacheLife('seconds')

  const res = await fetch('https://dummyjson.com/quotes/random')
  const quote = await res.json()

  return (
    <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-green-900">seconds</h3>
        <span className="text-xs text-green-600">{new Date().toISOString()}</span>
      </div>
      <p className="mt-2 text-sm italic text-green-800">"{quote.quote}"</p>
      <p className="mt-1 text-xs text-green-600">— {quote.author}</p>
      <p className="mt-2 rounded bg-green-100 p-1 text-xs text-green-700">
        stale: 0 | revalidate: 1s | expire: 60s
      </p>
    </div>
  )
}
