import Image from 'next/image'
import { ExerciseLayout } from '@/app/lab/rsc/_components/ExerciseLayout'
import { listUploads } from './_actions'
import { UploadForm } from './_components/UploadForm'

export default async function FileUploadExercise() {
  const files = await listUploads()

  return (
    <ExerciseLayout
      number="05"
      title="File upload with FormData"
      concept="A <input type='file'> inside a <form action={serverAction}> automatically uses multipart/form-data. The Server Action receives the File via formData.get('file'). Validate size and MIME on the server — never trust the client."
      questions={[
        'What encoding does a form with a file input use, and how is it set?',
        'How do you convert the uploaded File to bytes you can write to disk?',
        'Why validate file size and type on the server when you also have an accept attribute?',
        'What is the default body-size limit for Server Actions, and how do you raise it?',
        'How would you stream a large upload instead of buffering it entirely?',
      ]}
    >
      <p className="mb-4 text-sm text-gray-600">
        Upload an image (max 2 MB, png/jpg/gif/webp). Files are saved to{' '}
        <code>public/uploads/lab/</code> and listed below. They survive page refresh but are gitignored.
      </p>
      <UploadForm />

      <h3 className="mt-6 mb-2 text-sm font-semibold text-gray-700">
        Uploaded files ({files.length})
      </h3>
      {files.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No uploads yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {files.map((f) => (
            <div key={f.name} className="rounded border bg-white p-2">
              <div className="relative h-24 w-full overflow-hidden rounded">
                <Image
                  src={`/uploads/lab/${f.name}`}
                  alt={f.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <p className="mt-1 truncate text-xs text-gray-500" title={f.name}>
                {f.name}
              </p>
              <p className="text-xs text-gray-400">{(f.size / 1024).toFixed(1)} KB</p>
            </div>
          ))}
        </div>
      )}
    </ExerciseLayout>
  )
}
