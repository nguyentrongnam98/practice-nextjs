import Image from 'next/image'

const IDS = ['grid-1', 'grid-2', 'grid-3', 'grid-4', 'grid-5', 'grid-6']

export function ResponsiveGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {IDS.map((id) => (
        <div key={id} className="relative aspect-video overflow-hidden rounded">
          <Image
            src={`https://picsum.photos/seed/${id}/600/400`}
            alt={`Grid ${id}`}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            className="object-cover"
            unoptimized
          />
        </div>
      ))}
    </div>
  )
}
