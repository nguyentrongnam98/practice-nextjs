const PHOTOS: Record<string, { color: string; title: string; description: string }> = {
  '1': { color: 'bg-rose-400', title: 'Sunset', description: 'A beautiful sunset over the horizon, painting the sky in warm colors.' },
  '2': { color: 'bg-sky-400', title: 'Ocean', description: 'Calm ocean waves meeting the shore under clear blue skies.' },
  '3': { color: 'bg-emerald-400', title: 'Forest', description: 'Dense green forest with sunlight filtering through the canopy.' },
  '4': { color: 'bg-amber-400', title: 'Desert', description: 'Golden sand dunes stretching endlessly under the hot sun.' },
  '5': { color: 'bg-violet-400', title: 'Mountains', description: 'Snow-capped mountain peaks reaching into the clouds.' },
  '6': { color: 'bg-pink-400', title: 'Cherry Blossom', description: 'Delicate cherry blossoms in full bloom during spring.' },
}

export function generateStaticParams() {
  return Object.keys(PHOTOS).map((id) => ({ id }))
}

export default async function PhotoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const photo = PHOTOS[id]

  if (!photo) {
    return <div className="text-red-500">Photo not found</div>
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">{photo.title}</h1>
      <div className={`${photo.color} mt-4 flex aspect-video items-center justify-center rounded-xl text-white text-4xl font-bold`}>
        {photo.title}
      </div>
      <p className="mt-4 text-gray-600">{photo.description}</p>
      <p className="mt-6 rounded bg-yellow-50 p-3 text-sm text-yellow-800">
        You are viewing the <strong>full page</strong> version.
        This means you navigated directly (refresh/paste URL), so no interception happened.
      </p>
    </div>
  )
}
