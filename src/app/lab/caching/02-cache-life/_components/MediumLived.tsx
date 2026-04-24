import { cacheLife } from 'next/cache'

export async function MediumLived() {
  'use cache'
  cacheLife('minutes')

  const res = await fetch('https://dummyjson.com/quotes/random')
  const quote = await res.json()

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-amber-900">minutes</h3>
        <span className="text-xs text-amber-600">{new Date().toISOString()}</span>
      </div>
      <p className="mt-2 text-sm italic text-amber-800">&ldquo;{quote.quote}&rdquo;</p>
      <p className="mt-1 text-xs text-amber-600">— {quote.author}</p>
      <p className="mt-2 rounded bg-amber-100 p-1 text-xs text-amber-700">
        stale: 5m | revalidate: 1m | expire: 1h
      </p>
    </div>
  )
}
