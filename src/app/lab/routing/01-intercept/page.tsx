import Link from 'next/link'
import { PHOTOS } from './_data'

export default function Gallery() {
  return (
    <div>
      <p className="mb-4 text-sm text-gray-600">
        Click a tile — it opens as a modal (soft navigation). Open the same URL in a new tab — it shows
        the full page. Try browser back/forward.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PHOTOS.map((p) => (
          <Link
            key={p.id}
            href={`/lab/routing/01-intercept/photo/${p.id}`}
            className={`h-32 rounded-lg bg-gradient-to-br ${p.color} p-3 text-white shadow transition-transform hover:scale-[1.02]`}
          >
            <span className="text-xs opacity-80">#{p.id}</span>
            <p className="mt-6 text-sm font-medium">{p.title}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
