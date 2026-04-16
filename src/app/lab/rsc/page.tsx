import Link from 'next/link'

const EXERCISES = [
  { num: '01', slug: '01-boundary', title: "'use client' boundary", desc: 'Where Server ends and Client begins. Console log proof.' },
  { num: '02', slug: '02-composition', title: 'Server wraps Client', desc: 'Server fetches data, Client adds interactivity.' },
  { num: '03', slug: '03-children', title: 'Children (donut) pattern', desc: 'Pass Server Components as children to Client Components.' },
  { num: '04', slug: '04-serialization', title: 'Serialization constraint', desc: 'What can and cannot cross the Server→Client boundary.' },
  { num: '05', slug: '05-streaming', title: 'Suspense streaming', desc: 'Progressive rendering with multiple Suspense boundaries.' },
  { num: '06', slug: '06-server-only', title: 'Guard imports', desc: "Protect server secrets with 'server-only' and 'client-only'." },
  { num: '07', slug: '07-third-party', title: 'Wrap client-only libs', desc: 'Use browser APIs safely with useEffect wrapper pattern.' },
]

export default function RscLabIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Server & Client Components Lab</h1>
      <p className="mt-1 text-sm text-gray-500">
        7 exercises for senior Next.js interview prep
      </p>
      <div className="mt-6 space-y-3">
        {EXERCISES.map((ex) => (
          <Link
            key={ex.slug}
            href={`/lab/rsc/${ex.slug}`}
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
