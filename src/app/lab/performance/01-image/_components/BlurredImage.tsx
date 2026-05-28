import Image from 'next/image'

const BLUR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCA0IDQnPjxyZWN0IHdpZHRoPSc0JyBoZWlnaHQ9JzQnIGZpbGw9JyM5OTk5OTknLz48L3N2Zz4='

export function BlurredImage() {
  return (
    <div className="relative h-48 w-full overflow-hidden rounded-lg">
      <Image
        src="https://picsum.photos/seed/blur/900/450"
        alt="Image with blur-up placeholder"
        fill
        placeholder="blur"
        blurDataURL={BLUR}
        sizes="(max-width: 768px) 100vw, 600px"
        className="object-cover"
        unoptimized
      />
    </div>
  )
}
