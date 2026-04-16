import { Modal } from '@/shared/components/feedback'

const PHOTOS: Record<string, { color: string; title: string; description: string }> = {
  '1': { color: 'bg-rose-400', title: 'Sunset', description: 'A beautiful sunset over the horizon, painting the sky in warm colors.' },
  '2': { color: 'bg-sky-400', title: 'Ocean', description: 'Calm ocean waves meeting the shore under clear blue skies.' },
  '3': { color: 'bg-emerald-400', title: 'Forest', description: 'Dense green forest with sunlight filtering through the canopy.' },
  '4': { color: 'bg-amber-400', title: 'Desert', description: 'Golden sand dunes stretching endlessly under the hot sun.' },
  '5': { color: 'bg-violet-400', title: 'Mountains', description: 'Snow-capped mountain peaks reaching into the clouds.' },
  '6': { color: 'bg-pink-400', title: 'Cherry Blossom', description: 'Delicate cherry blossoms in full bloom during spring.' },
}

export default async function PhotoModalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const photo = PHOTOS[id]

  if (!photo) {
    return (
      <Modal>
        <p className="text-red-500">Photo not found</p>
      </Modal>
    )
  }

  return (
    <Modal>
      <h2 className="text-xl font-bold">{photo.title}</h2>
      <div className={`${photo.color} mt-3 flex aspect-video items-center justify-center rounded-lg text-white text-3xl font-bold`}>
        {photo.title}
      </div>
      <p className="mt-3 text-sm text-gray-600">{photo.description}</p>
      <p className="mt-3 rounded bg-green-50 p-2 text-xs text-green-800">
        This is the <strong>modal</strong> version (intercepted).
        Grid is still visible behind this overlay.
      </p>
    </Modal>
  )
}
