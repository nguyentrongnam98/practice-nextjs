import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPhoto } from '../../_data'

type Params = Promise<{ id: string }>

export default async function FullPhoto({ params }: { params: Params }) {
  const { id } = await params
  const photo = getPhoto(id)
  if (!photo) notFound()

  return (
    <div>
      <Link href="/lab/routing/01-intercept" className="text-sm text-blue-600 hover:underline">
        ← Back to gallery
      </Link>
      <div className={`mt-4 h-64 rounded-lg bg-gradient-to-br ${photo.color} p-6 text-white shadow`}>
        <span className="text-xs opacity-80">#{photo.id}</span>
        <h2 className="mt-12 text-2xl font-bold">{photo.title}</h2>
      </div>
      <p className="mt-3 text-sm text-gray-500">
        This is the FULL PAGE view. You see this when you navigate directly (refresh, paste URL).
      </p>
    </div>
  )
}
