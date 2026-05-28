import Image from 'next/image'

export function HeroImage() {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-lg">
      <Image
        src="https://picsum.photos/seed/hero/1200/600"
        alt="Hero image — random landscape"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 800px"
        className="object-cover"
        unoptimized
      />
    </div>
  )
}
