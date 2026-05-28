// src/app/lab/forms/page.tsx
import Link from 'next/link'

const EXERCISES = [
  {
    num: '01',
    slug: '01-action-state',
    title: 'useActionState basics',
    desc: 'Form state and error from a Server Action — the new React 19 pattern.',
  },
  {
    num: '02',
    slug: '02-form-status',
    title: 'useFormStatus for pending UI',
    desc: 'Show loading state in a child button without prop drilling.',
  },
  {
    num: '03',
    slug: '03-optimistic',
    title: 'Optimistic updates with useOptimistic',
    desc: 'UI updates instantly, syncs with server in background.',
  },
  {
    num: '04',
    slug: '04-zod-validation',
    title: 'Server-side Zod validation',
    desc: 'Per-field errors driven by Zod safeParse and useActionState.',
  },
  {
    num: '05',
    slug: '05-file-upload',
    title: 'File upload with FormData',
    desc: 'Multipart upload to a Server Action, saved to disk.',
  },
  {
    num: '06',
    slug: '06-multi-step',
    title: 'Multi-step (wizard) form',
    desc: 'State persisted via cookies between steps, validated per step.',
  },
]

export default function FormsLabIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Forms & Server Actions Lab</h1>
      <p className="mt-1 text-sm text-gray-500">
        6 exercises covering React 19 form hooks and Next.js Server Actions
      </p>
      <div className="mt-6 space-y-3">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.slug}
            href={`/lab/forms/${ex.slug}`}
            className="block rounded-lg border bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <span className="text-xs font-mono text-gray-400">{ex.num}</span>
            <h2 className="font-semibold">{ex.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{ex.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
