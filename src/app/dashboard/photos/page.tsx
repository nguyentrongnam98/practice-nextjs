import Link from 'next/link'

const PHOTOS = [
  { id: '1', color: 'bg-rose-400', title: 'Sunset' },
  { id: '2', color: 'bg-sky-400', title: 'Ocean' },
  { id: '3', color: 'bg-emerald-400', title: 'Forest' },
  { id: '4', color: 'bg-amber-400', title: 'Desert' },
  { id: '5', color: 'bg-violet-400', title: 'Mountains' },
  { id: '6', color: 'bg-pink-400', title: 'Cherry Blossom' },
]

export default function PhotosPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Photo Gallery</h1>
      <p className="mt-1 text-sm text-gray-500">
        Click a photo → modal. Refresh on photo URL → full page.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {PHOTOS.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/photos/${p.id}`}
            className="group block overflow-hidden rounded-lg"
          >
            <div
              className={`${p.color} flex aspect-square items-center justify-center text-white font-semibold text-lg group-hover:opacity-80 transition-opacity`}
            >
              {p.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
