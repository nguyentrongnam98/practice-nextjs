import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPhoto } from '../../../_data'

type Params = Promise<{ id: string }>

export default async function PhotoModal({ params }: { params: Params }) {
  const { id } = await params
  const photo = getPhoto(id)
  if (!photo) notFound()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className={`h-48 rounded-t-lg bg-gradient-to-br ${photo.color} p-4 text-white`}>
          <span className="text-xs opacity-80">#{photo.id}</span>
          <h2 className="mt-12 text-xl font-bold">{photo.title}</h2>
        </div>
        <div className="flex justify-between p-4">
          <span className="text-xs text-gray-500">
            This is the INTERCEPTED MODAL — soft navigation.
          </span>
          <Link
            href="/lab/routing/01-intercept"
            className="text-sm text-blue-600 hover:underline"
          >
            Close
          </Link>
        </div>
      </div>
    </div>
  )
}
