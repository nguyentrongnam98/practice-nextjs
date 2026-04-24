import { cacheLife } from 'next/cache'

interface ThemedContentProps {
  theme: string
}

async function getCachedQuote(theme: string) {
  'use cache'
  cacheLife('minutes')
  const res = await fetch('https://dummyjson.com/quotes/random')
  const quote = await res.json()
  return { quote: quote.quote, author: quote.author, cachedAt: new Date().toISOString(), theme }
}

export async function ThemedContent({ theme }: ThemedContentProps) {
  const data = await getCachedQuote(theme)

  const isDark = data.theme === 'dark'

  return (
    <div className={`rounded-lg border p-4 ${isDark ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Theme: {data.theme}</h3>
        <span className={`rounded px-2 py-0.5 text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          Cached at: {data.cachedAt}
        </span>
      </div>
      <p className={`mt-3 text-sm italic ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        &ldquo;{data.quote}&rdquo;
      </p>
      <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        — {data.author}
      </p>
      <p className={`mt-3 rounded p-2 text-xs ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-blue-50 text-blue-700'}`}>
        theme=&ldquo;{data.theme}&rdquo; is part of the cache key. Switch theme → different cache entry → different quote.
        Switch back → same quote (cache hit!).
      </p>
    </div>
  )
}
