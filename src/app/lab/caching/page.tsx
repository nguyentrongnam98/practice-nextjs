import Link from 'next/link'

const EXERCISES = [
  { num: '01', slug: '01-use-cache', title: "'use cache' directive", desc: 'Cache functions and components. Timestamp proves cache hit.' },
  { num: '02', slug: '02-cache-life', title: 'cacheLife profiles', desc: 'seconds, minutes, hours — see different TTLs side by side.' },
  { num: '03', slug: '03-on-demand', title: 'cacheTag + revalidateTag', desc: 'Tag cached data, invalidate on-demand with a button.' },
  { num: '04', slug: '04-update-tag', title: 'updateTag vs revalidateTag', desc: 'Immediate vs stale-while-revalidate — side by side comparison.' },
  { num: '05', slug: '05-runtime', title: 'Runtime APIs + cache', desc: 'Cookie value as cache key. Different input = different cache entry.' },
  { num: '06', slug: '06-no-cache', title: 'Streaming uncached data', desc: 'Cached (instant) vs uncached (streaming) — visual comparison.' },
]

export default function CachingLabIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Data Fetching & Caching Lab</h1>
      <p className="mt-1 text-sm text-gray-500">
        6 exercises for Next.js 16 Cache Components model
      </p>
      <div className="mt-6 space-y-3">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.slug}
            href={`/lab/caching/${ex.slug}`}
            className="block rounded-lg border bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <span className="text-xs font-mono text-gray-400">{ex.num}</span>
            <h2 className="font-semibold">{ex.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{ex.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
