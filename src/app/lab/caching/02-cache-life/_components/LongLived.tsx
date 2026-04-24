import { cacheLife } from 'next/cache'

export async function LongLived() {
  'use cache'
  cacheLife('hours')

  const res = await fetch('https://dummyjson.com/quotes/random')
  const quote = await res.json()

  return (
    <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-red-900">hours</h3>
        <span className="text-xs text-red-600">{new Date().toISOString()}</span>
      </div>
      <p className="mt-2 text-sm italic text-red-800">&ldquo;{quote.quote}&rdquo;</p>
      <p className="mt-1 text-xs text-red-600">— {quote.author}</p>
      <p className="mt-2 rounded bg-red-100 p-1 text-xs text-red-700">
        stale: 5m | revalidate: 1h | expire: 1d
      </p>
    </div>
  )
}
